/* ==========================================================================
   L'ACQUA — un solo shader, due usi:
   1. la scena WebGL dell'apertura (MareScena.tsx, React Three Fiber);
   2. il fermo immagine di riserva (scripts/tavole/render.ts), renderizzato
      in anticipo con la stessa composizione per telefoni e hardware debole.

   Un unico triangolo a schermo intero: per ogni pixel un raggio dalla
   camera incontra il piano del mare. Onde direzionali a cresta stretta
   (somma di exp(sin)), riflesso del cielo con Fresnel, luce bassa del
   mattino, foschia calda all'orizzonte. Un draw call, nessuna texture.

   Nessun import: lo legge anche Node dallo script delle tavole.
   ========================================================================== */

export const VERTICE = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** La palette del sito in GLSL. */
export const PALETTE = /* glsl */ `
const vec3 NOTTE = vec3(0.027, 0.106, 0.133);
const vec3 ADRIATICO = vec3(0.063, 0.169, 0.208);
const vec3 AVORIO = vec3(0.953, 0.933, 0.894);
const vec3 SABBIA = vec3(0.847, 0.784, 0.678);
const vec3 OTTONE = vec3(0.706, 0.604, 0.416);
const vec3 BIANCO = vec3(0.980, 0.969, 0.941);
const vec3 TERRACOTTA = vec3(0.663, 0.435, 0.349);
const vec3 SALVIA = vec3(0.537, 0.573, 0.486);
`;

export const UTILI = /* glsl */ `
mat2 ruota(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
`;

/** Le onde: condivise con le tavole dipinte (scripts/tavole). */
export const ONDE = /* glsl */ `
// Onde a cresta stretta: h = a·e^(sin x − 1). Restituisce altezza e gradiente.
// Ogni ottava ruota la direzione e deforma la successiva (le onde si parlano).
vec3 onde(vec2 p, float t, float ottave) {
  float h = 0.0;
  vec2 g = vec2(0.0);
  float a = 0.13;
  float f = 0.62;
  float v = 1.15;
  vec2 d = normalize(vec2(0.86, 0.5));
  for (int i = 0; i < 12; i++) {
    if (float(i) >= ottave) break;
    float x = dot(d, p) * f + t * v;
    float w = exp(sin(x) - 1.0);
    float dw = w * cos(x);
    h += a * w;
    g += a * dw * f * d;
    p -= d * dw * a * 0.32;
    a *= 0.67;
    f *= 1.62;
    v *= 1.18;
    d = ruota(0.94) * d;
  }
  return vec3(h, g);
}
`;

export const FRAMMENTO = /* glsl */ `
precision highp float;

uniform float uTempo;      // secondi
uniform vec2 uRis;         // risoluzione in pixel del buffer
uniform float uAvvicina;   // 0 → 1: scorrendo, la superficie si avvicina
uniform vec2 uPuntatore;   // -1..1, già smorzato
uniform float uLuce;       // 0 → 1: la luce del mattino che arriva
uniform float uGrana;      // grana di pellicola (0 nel 3D, un filo nei fermi)

${PALETTE}

const vec3 SOLE = vec3(-0.46, 0.06, 0.89);

${UTILI}

${ONDE}

vec3 cielo(vec3 r) {
  float y = clamp(r.y, 0.0, 1.0);
  // una foschia calda sull'orizzonte, poi il blu che sale verso la notte
  vec3 foschia = mix(ADRIATICO * 2.2, SABBIA, 0.5);
  vec3 c = mix(foschia, ADRIATICO * 1.35, smoothstep(0.0, 0.22, y));
  c = mix(c, NOTTE, smoothstep(0.2, 0.75, y));
  vec3 s = normalize(SOLE);
  float sd = max(dot(r, s), 0.0);
  c += OTTONE * pow(sd, 18.0) * 0.32 * uLuce;
  c += AVORIO * smoothstep(0.99965, 0.99985, sd) * 0.85 * uLuce;
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRis) / uRis.y;
  float k = smoothstep(0.0, 1.0, uAvvicina);

  // camera: alta sul mare con l'orizzonte in alto; scorrendo scende e guarda giù
  float altezza = mix(2.4, 0.55, k);
  float beccheggio = mix(-0.165, -1.05, k) + uPuntatore.y * 0.018;
  float imbardata = uPuntatore.x * 0.045;
  vec3 ro = vec3(0.0, altezza, uTempo * 0.32);
  vec3 rd = normalize(vec3(uv, 1.42));
  rd.yz = ruota(beccheggio) * rd.yz;
  rd.xz = ruota(imbardata) * rd.xz;

  vec3 col;
  float distanza = 1e4;
  if (rd.y > -0.0005) {
    col = cielo(rd);
  } else {
    distanza = -ro.y / rd.y;
    vec3 p = ro + rd * distanza;
    // meno ottave lontano: niente sfarfallio all'orizzonte
    float ottave = clamp(12.0 - log2(distanza + 1.0) * 1.8, 3.0, 12.0);
    vec3 w = onde(p.xz, uTempo, ottave);
    vec3 n = normalize(vec3(-w.y, 1.0, -w.z));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(8.0, 90.0, distanza)));

    float coseno = max(dot(n, -rd), 0.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - coseno, 5.0);
    vec3 r = reflect(rd, n);
    r.y = abs(r.y);

    // il corpo dell'acqua: blu profondo, un velo verde sulle creste
    vec3 profondo = mix(NOTTE, ADRIATICO, 0.78);
    profondo += vec3(0.02, 0.07, 0.07) * smoothstep(0.25, 0.95, w.x) * (1.0 - k * 0.5);
    col = mix(profondo, cielo(r), fresnel);

    // la scia del sole: scintille sulla superficie
    vec3 s = normalize(SOLE);
    float sp = max(dot(r, s), 0.0);
    col += AVORIO * pow(sp, 700.0) * 4.0 * uLuce;
    col += OTTONE * pow(sp, 60.0) * 0.22 * uLuce;

    // foschia verso l'orizzonte
    float nebbia = 1.0 - exp(-distanza * 0.02);
    col = mix(col, cielo(normalize(vec3(rd.x, 0.0, rd.z))), nebbia);
  }

  // il mattino che arriva, poi l'immersione nel blu della scena dopo
  col *= mix(0.22, 1.0, uLuce);
  col = mix(col, ADRIATICO, smoothstep(0.62, 1.0, uAvvicina) * 0.85);

  // vignetta morbida e grana
  vec2 q = gl_FragCoord.xy / uRis;
  col *= 1.0 - 0.28 * pow(length((q - 0.5) * vec2(1.0, 1.2)), 2.2);
  col += (hash(gl_FragCoord.xy + fract(uTempo) * 61.0) - 0.5) * uGrana;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
