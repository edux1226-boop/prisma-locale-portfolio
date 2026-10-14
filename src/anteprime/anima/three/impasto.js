/* L'IMPASTO — la mossa firma dell'anteprima di Anima.
   Un panetto crudo che, allo scorrere, diventa le forme della carta:
   tonda, romana scrocchiarella, padellino (nel suo tegamino), pala (sul
   tagliere, due gusti) e teglia; poi torna panetto: il senza glutine, da
   chiedere il giorno prima.

   È una sola sfera deformata nello shader. Ogni punto della sfera ha due
   coordinate: t (da polo a polo) e φ (attorno). t percorre il profilo della
   pizza — faccia di sopra, cornicione arrotondato, fondo — e φ gira lungo
   una superellisse: tonda, ovale lunga o rettangolo cambiano solo numeri.
   Le normali si calcolano per differenze finite sulla stessa funzione,
   quindi bolle, fossette e macchie restano coerenti con la luce.
   Tegamino, teglia e tagliere sono un secondo guscio costruito allo stesso
   modo, con la stessa pianta della pasta.

   Tutto dipende da un numero, la "tappa" (0 → 6), più il tempo. */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

/* ---- Le forme ------------------------------------------------------------
   a, c    semiassi della pianta; n esponente (2 = ellisse, 9 ≈ rettangolo)
   w       larghezza del cornicione (frazione del raggio)
   centro  altezza della faccia al centro; bordo altezza del cornicione
   irr     irregolarità della stesura; bolle, fossette: rilievi
   cottura 0 crudo → 1 cotto → 1.2 ben dorato; macchie: leopardatura
   unto    lucido d'olio; farina: spolvero; palla: 1 = panetto
   sugo, mozz, basilico, meta: il condimento (meta = metà bianca, la pala)
   sup     il supporto: 0 niente, 1 presente; supH altezza della parete,
           supG distanza dalla pasta, supT spessore, supB fondo, legno 0/1,
           supN esponente della pianta del supporto                       */
const PANETTO = {
  palla: 1, scala: 1, a: 1.25, c: 1.25, n: 2, w: 0.3, centro: 0.3, bordo: 0.42, irr: 0.02,
  bolle: 0, fossette: 0, cottura: 0, macchie: 0, unto: 0.05, farina: 1, giro: 0,
  sugo: 0, mozz: 0, basilico: 0, meta: 0,
  sup: 0, supH: 0.2, supG: 0.03, supT: 0.035, supB: 0.03, legno: 0, supN: 2,
};

export const FORME = [
  PANETTO,
  // tonda
  { ...PANETTO, palla: 0, a: 1.55, c: 1.55, w: 0.17, centro: 0.05, bordo: 0.3, irr: 0.035, bolle: 1, cottura: 1, macchie: 1, unto: 0.12, farina: 0.15, sugo: 1, mozz: 1, basilico: 1 },
  // romana scrocchiarella: sottile, larga, irregolare
  { ...PANETTO, palla: 0, a: 1.72, c: 1.64, w: 0.045, centro: 0.03, bordo: 0.06, irr: 0.065, bolle: 0.5, cottura: 1.14, macchie: 0.55, unto: 0.08, farina: 0.25, giro: 0.4, sugo: 1, mozz: 0.55, basilico: 0.7 },
  // padellino nel tegamino
  { ...PANETTO, palla: 0, a: 1.0, c: 1.0, w: 0.09, centro: 0.3, bordo: 0.4, irr: 0.008, bolle: 0.35, cottura: 1.1, macchie: 0.15, unto: 0.6, farina: 0.03, sugo: 1, mozz: 0.85, basilico: 1, sup: 1, supH: 0.3, supG: 0.015, supT: 0.035, supB: 0.035, legno: 0, supN: 2 },
  // pala, sul tagliere, due gusti
  { ...PANETTO, palla: 0, a: 1.85, c: 0.74, n: 2.9, w: 0.075, centro: 0.065, bordo: 0.13, irr: 0.04, bolle: 0.6, fossette: 1, cottura: 1.06, macchie: 0.55, unto: 0.1, farina: 0.45, giro: -0.35, sugo: 1, mozz: 0.9, basilico: 0.8, meta: 1, sup: 1, supH: 0, supG: 0.16, supT: 0.08, supB: 0.04, legno: 1, supN: 5 },
  // teglia romana nella teglia
  { ...PANETTO, palla: 0, a: 1.6, c: 1.08, n: 9, w: 0.05, centro: 0.2, bordo: 0.22, irr: 0, bolle: 0.25, fossette: 0.75, cottura: 1.18, macchie: 0.08, unto: 0.8, farina: 0, giro: 0.5, sugo: 1, mozz: 0.7, basilico: 0, sup: 1, supH: 0.22, supG: 0.012, supT: 0.03, supB: 0.03, legno: 0, supN: 9 },
  // senza glutine: si torna al panetto, più piccolo
  { ...PANETTO, scala: 0.8 },
];

const CHIAVI = Object.keys(PANETTO);

const BRUCIATURA = '#140B06';
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const liscio = (t) => t * t * (3 - 2 * t);

/* Fra una tappa e l'altra la forma si ferma: il testo ha il tempo di essere letto. */
export function formaA(tappa, out = {}) {
  const max = FORME.length - 1;
  const p = Math.min(max, Math.max(0, tappa));
  const i = Math.min(max - 1, Math.floor(p));
  const f = liscio(clamp01((p - i - 0.22) / 0.56));
  const A = FORME[i];
  const B = FORME[i + 1];
  for (const k of CHIAVI) out[k] = lerp(A[k], B[k], f);
  // a metà strada la pasta si raccoglie un poco (si sente che è la stessa)
  // e il condimento sparisce: ogni forma è una pizza nuova
  const passaggio = Math.sin(Math.PI * f);
  out.raccolta = passaggio * (1 - Math.max(A.palla, B.palla));
  const pulito = 1 - smoothBand(f);
  out.sugo *= pulito;
  out.mozz *= pulito;
  out.basilico *= pulito;
  // il supporto si dissolve se cambia natura (tegamino → tagliere)
  out.supVis = A.sup && B.sup && A.legno === B.legno ? 1 : lerp(A.sup, B.sup, f) * (A.sup && B.sup ? pulito : 1);
  return out;
}
function smoothBand(f) {
  // 0 agli estremi, 1 nel mezzo del passaggio
  return liscio(clamp01((f - 0.05) / 0.25)) * liscio(clamp01((0.95 - f) / 0.25));
}

/* ---- GLSL ---------------------------------------------------------------- */

/* Rumore simplex 3D di Ian McEwan e Stefan Gustavson (Ashima Arts), licenza MIT. */
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const COMUNE = /* glsl */ `
const float PI = 3.141592653589793;
float superR(vec2 dir, float a, float c, float n) {
  float x = pow(abs(dir.x) / a, n);
  float z = pow(abs(dir.y) / c, n);
  return pow(x + z, -1.0 / n);
}
`;

/* Luce comune alla pasta e ai supporti: chiave calda dall'alto a sinistra,
   un riempimento freddo e debole, il controluce del forno dietro. */
const LUCE = /* glsl */ `
uniform vec3 uLuceChiave, uLuceRetro, uLuceFill;
uniform vec3 uColChiave, uColRetro, uColFill, uCielo, uTerra;
vec3 illumina(vec3 base, vec3 N, vec3 V, float wrap, float lucido, float forza) {
  float dk = max((dot(N, uLuceChiave) + wrap) / (1.0 + wrap), 0.0);
  float df = max((dot(N, uLuceFill) + 0.6) / 1.6, 0.0);
  float dr = max(dot(N, uLuceRetro), 0.0);
  vec3 amb = mix(uTerra, uCielo, N.y * 0.5 + 0.5);
  vec3 col = base * (amb + uColChiave * dk + uColFill * df * 0.6);
  col += base * uColRetro * dr * 0.8;
  vec3 H = normalize(uLuceChiave + V);
  col += uColChiave * pow(max(dot(N, H), 0.0), lucido) * forza;
  vec3 H2 = normalize(uLuceRetro + V);
  col += uColRetro * pow(max(dot(N, H2), 0.0), lucido * 0.6) * forza * 0.6;
  return col;
}
`;

const VERTEX = /* glsl */ `
uniform float uPalla, uScala, uA, uC, uN, uW, uCentro, uBordo, uIrr, uBolle, uFossette, uRaccolta, uRespiro, uAlza;
varying vec3 vPosW;
varying vec3 vNormW;
varying vec3 vPosM;
varying float vCorn;
varying float vSotto;
varying float vPiega;
varying float vBolla;

const float T1 = 0.40;
const float T2 = 0.62;

${SIMPLEX}
${COMUNE}

float smax(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return max(a, b) + h * h * k * 0.25;
}

/* Fossette della pala: distanza dal punto più vicino di una griglia mossa. */
float fossette(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = fract(sin(vec2(dot(i + g, vec2(127.1, 311.7)), dot(i + g, vec2(269.5, 183.3)))) * 43758.5453);
      vec2 r = g + 0.2 + 0.6 * o - f;
      d = min(d, dot(r, r));
    }
  }
  return sqrt(d);
}

/* La forma: (t, φ) → punto. corn = peso del cornicione, sotto = peso del fondo. */
vec3 forma(float t, float phi, out float corn, out float sotto, out float piega, out float bollaOut) {
  vec2 dir = vec2(-cos(phi), sin(phi));
  float w = uW;
  float h = uBordo * 0.5;
  float r;
  float y;
  vec2 n2;
  float pendio = w * 1.1;
  if (t < T1) {
    float s = t / T1;
    r = (1.0 - w) * s;
    float sale = smoothstep(1.0 - w - pendio, 1.0 - w, r);
    y = mix(uCentro, uBordo, sale * sale * (3.0 - 2.0 * sale));
    n2 = vec2(0.0, 1.0);
    corn = sale;
    sotto = 0.0;
  } else if (t < T2) {
    float s = (t - T1) / (T2 - T1);
    float a = mix(0.5 * PI, -0.5 * PI, s);
    r = 1.0 - w + w * cos(a);
    y = h + h * sin(a);
    n2 = normalize(vec2(cos(a) / w, sin(a) / max(h, 0.002)));
    corn = smoothstep(-0.6, 0.4, sin(a));
    sotto = smoothstep(0.2, -0.8, sin(a));
  } else {
    float s = (t - T2) / (1.0 - T2);
    r = (1.0 - w) * (1.0 - s);
    y = 0.0;
    n2 = vec2(0.0, -1.0);
    corn = 0.0;
    sotto = 1.0;
  }

  float irr = 1.0 + uIrr * snoise(vec3(dir * 1.4, 4.2)) + uIrr * 0.5 * snoise(vec3(dir * 3.1, 9.7));
  float R = superR(dir, uA, uC, uN) * irr;
  vec3 p = vec3(dir.x * r * R, y, dir.y * r * R);

  // bolle sul cornicione e piccoli rilievi sulla faccia
  float bolla = smoothstep(0.15, 0.85, snoise(p * 3.4 + 1.7) * 0.75 + snoise(p * 8.0 + 4.0) * 0.25);
  float grana = snoise(p * 2.6 + 7.3);
  float sopra = 1.0 - sotto;
  float rilievo = uBolle * (0.07 * bolla * corn + 0.01 * grana * sopra);
  bollaOut = bolla * corn * uBolle;

  // fossette della pala e della teglia, solo sulla faccia di sopra
  float fo = 1.0 - smoothstep(0.0, 0.34, fossette(p.xz * 2.4 + 0.5));
  rilievo -= uFossette * 0.03 * fo * (1.0 - corn) * sopra;
  piega = fo * uFossette * (1.0 - corn) * sopra;

  p += vec3(dir * n2.x, n2.y) * rilievo;
  p.y = max(p.y, sotto > 0.5 ? 0.0 : 0.006);

  // il panetto: una sfera schiacciata, appoggiata, con il fondo che si allarga
  float th = t * PI;
  vec3 sf = vec3(-cos(phi) * sin(th), cos(th), sin(phi) * sin(th));
  float S = uScala;
  float allarga = 1.0 + 0.16 * (1.0 - smoothstep(-0.35, 0.5, sf.y));
  vec3 b = vec3(sf.x * allarga, sf.y * 0.68 + 0.5, sf.z * allarga) * S;
  b += sf * (snoise(sf * 1.3 + 2.0) * 0.03 + snoise(sf * 3.2) * 0.004) * S;
  b.y = smax(b.y, 0.0, 0.22 * S) - 0.012 * S;
  b.y *= 1.0 + uRespiro;

  // a metà fra due forme, la pasta si raccoglie: meno larga, più alta
  p.xz *= 1.0 - 0.18 * uRaccolta;
  p.y += 0.12 * uRaccolta * (1.0 - r) * sopra;

  vec3 q = mix(p, b, uPalla);
  q.y += uAlza;
  return q;
}

void main() {
  float phi = uv.x * 2.0 * PI;
  float t = 1.0 - uv.y;
  float corn, sotto, piega, bolla, c2, s2, p2, b2;
  vec3 P = forma(t, phi, corn, sotto, piega, bolla);
  vec3 N;
  if (t < 0.0015) {
    N = vec3(0.0, 1.0, 0.0);
  } else if (t > 0.9985) {
    N = vec3(0.0, -1.0, 0.0);
  } else {
    vec3 Pt = forma(min(t + 0.0012, 0.9999), phi, c2, s2, p2, b2);
    vec3 Pp = forma(t, phi + 0.0025, c2, s2, p2, b2);
    N = normalize(cross(Pt - P, Pp - P));
  }
  vCorn = mix(corn, 0.0, uPalla);
  vSotto = mix(sotto, smoothstep(0.1, -0.6, cos(t * PI)), uPalla);
  vPiega = piega;
  vBolla = bolla * (1.0 - uPalla);
  vPosM = P;
  vec4 w = modelMatrix * vec4(P, 1.0);
  vPosW = w.xyz;
  vNormW = normalize(mat3(modelMatrix) * N);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uCrudo, uChiaro, uDorato, uBruno, uCarbone, uFarinaCol;
uniform vec3 uSugoCol, uSugoScuro, uMozzCol, uBasilicoCol;
uniform float uCottura, uMacchie, uUnto, uFarina, uPalla, uA, uC, uAlza;
uniform float uSugo, uMozz, uBasilico, uMeta;
varying vec3 vPosW;
varying vec3 vNormW;
varying vec3 vPosM;
varying float vCorn;
varying float vSotto;
varying float vPiega;
varying float vBolla;

${SIMPLEX}
${COMUNE}
${LUCE}

/* Foglia di basilico: una mandorla con la nervatura. Restituisce (dentro, nervo). */
vec2 foglia(vec2 p, vec2 c, float ang, float L, float W) {
  vec2 d = p - c;
  float cs = cos(ang);
  float sn = sin(ang);
  vec2 q = vec2(cs * d.x + sn * d.y, -sn * d.x + cs * d.y);
  float u = q.x / L;
  float largo = W * (1.0 - u * u) * (1.0 + 0.25 * u);
  float dentro = (1.0 - smoothstep(-0.01, 0.01, abs(q.y) - largo)) * step(abs(u), 1.0);
  float nervo = (1.0 - smoothstep(0.0, 0.006, abs(q.y))) * dentro;
  return vec2(dentro, nervo);
}

void main() {
  vec3 N = normalize(vNormW);
  vec3 V = normalize(cameraPosition - vPosW);
  if (dot(N, V) < 0.0) N = -N;
  vec3 pm = vPosM - vec3(0.0, uAlza, 0.0);

  float n1 = snoise(pm * 1.8 + 3.0);
  float n2 = snoise(pm * 7.0 + 11.0);

  // cotto: chiaro al centro, dorato e poi bruno salendo sul cornicione, bruno sotto
  float tono = clamp(vCorn * 0.95 + n1 * 0.22 + n2 * 0.06 - 0.05, 0.0, 1.0);
  vec3 cotto = mix(uChiaro, uDorato, smoothstep(0.0, 0.55, tono));
  cotto = mix(cotto, uBruno, smoothstep(0.5, 1.0, tono) * 0.85);
  cotto = mix(cotto, mix(uDorato, uBruno, 0.55 + n1 * 0.3), vSotto * 0.85);
  cotto *= 1.0 - vPiega * 0.12;

  // leopardatura: le cime delle bolle si bruciano, con un alone bruno attorno;
  // qualche macchia anche sotto, dove la pasta tocca la pietra
  float sp = snoise(pm * 9.0 + 5.0);
  float leo = vBolla * 1.05 + sp * 0.18 + snoise(pm * 2.4 + 21.0) * 0.32 + snoise(pm * 5.0 + 2.0) * 0.12;
  float sottoM = vSotto * smoothstep(0.35, 0.75, snoise(pm * 3.2 + 8.0) * 0.7 + sp * 0.3);
  // sul cornicione la doratura cresce verso la cresta
  float cresta = smoothstep(0.55, 1.0, vCorn) * (1.0 - vSotto);
  float alone = uMacchie * clamp(smoothstep(0.08, 0.5, leo + cresta * 0.15) * smoothstep(0.2, 0.7, vCorn + vSotto) + sottoM * 0.8, 0.0, 1.0);
  float cuore = uMacchie * clamp(smoothstep(0.5, 0.75, leo + cresta * 0.1) + smoothstep(0.55, 0.8, sottoM), 0.0, 1.0);
  cotto = mix(cotto, uBruno * 0.85, alone * 0.8);
  cotto = mix(cotto, mix(uBruno * 0.42, uCarbone, smoothstep(0.7, 0.95, leo)), cuore * 0.9);

  vec3 crudo = uCrudo * (0.95 + 0.07 * n1 + 0.03 * n2);
  float c = clamp(uCottura, 0.0, 1.0);
  vec3 base = mix(crudo, cotto, c);
  base *= 1.0 - max(uCottura - 1.0, 0.0) * 0.55;

  // ---- il condimento, solo sulla faccia di sopra, dentro il cornicione
  float faccia = (1.0 - vSotto) * smoothstep(0.55, 0.85, N.y);
  float bordoSugo = 1.0 - smoothstep(0.1, 0.42, vCorn + n2 * 0.06 + snoise(pm * 2.2) * 0.08);
  vec2 xz = pm.xz;
  float bianca = uMeta * smoothstep(-0.05, 0.05, xz.x + snoise(vec3(xz * 1.5, 2.0)) * 0.06);
  float sugo = uSugo * faccia * bordoSugo * (1.0 - bianca);
  float spess = snoise(vec3(xz * 2.6, 5.0)) * 0.5 + 0.5;
  vec3 colSugo = mix(uSugoCol, uSugoScuro, spess * 0.7);
  // dove il sugo è sottile si vede la pasta sotto
  colSugo = mix(colSugo, mix(colSugo, uDorato, 0.35), smoothstep(0.7, 0.95, snoise(vec3(xz * 3.0, 9.0)) * 0.5 + 0.5) * 0.5);
  // la passata non è liscia: piccoli grumi più scuri
  colSugo *= 0.9 + 0.12 * snoise(vec3(xz * 14.0, 4.0));

  // mozzarella a chiazze, più fitta e più morbida sulla metà bianca
  float mz = snoise(vec3(xz * 1.25, 7.0)) * 0.78 + snoise(vec3(xz * 3.6, 3.0)) * 0.22;
  float soglia = mix(0.38, -0.05, bianca);
  float mozz = uMozz * faccia * bordoSugo * smoothstep(soglia, soglia + 0.08, mz);
  float ombraMozz = uMozz * faccia * bordoSugo * smoothstep(soglia - 0.14, soglia, mz) * (1.0 - smoothstep(soglia, soglia + 0.05, mz));
  vec3 colMozz = uMozzCol * (0.94 + 0.08 * n2);
  // la mozzarella fusa prende colore a macchie dove bolle
  colMozz = mix(colMozz, uDorato * 1.02, smoothstep(0.5, 0.85, snoise(vec3(xz * 7.0, 1.0))) * 0.5 * (1.0 - bianca * 0.5));
  colMozz *= 1.0 - 0.06 * smoothstep(soglia + 0.08, soglia + 0.3, mz);

  vec3 superficie = mix(base, colSugo, sugo);
  superficie *= 1.0 - ombraMozz * 0.35;
  superficie = mix(superficie, colMozz, mozz);

  // basilico: poche foglie, posate dopo la cottura
  vec2 f = vec2(0.0);
  vec2 sc = vec2(uA, uC) * 0.62;
  f = max(f, foglia(xz, vec2(0.28, 0.12) * sc, 0.6, 0.2, 0.085));
  f = max(f, foglia(xz, vec2(-0.32, 0.3) * sc, 2.2, 0.17, 0.075));
  f = max(f, foglia(xz, vec2(0.05, -0.42) * sc, 1.1, 0.19, 0.08));
  f = max(f, foglia(xz, vec2(-0.12, -0.08) * sc, 3.6, 0.15, 0.065));
  float bas = uBasilico * faccia * f.x * (1.0 - bianca * 0.6);
  vec3 colBas = uBasilicoCol * (0.8 + 0.3 * n2) + vec3(0.05, 0.09, 0.02) * f.y;
  superficie = mix(superficie, colBas, bas);

  // spolvero di farina
  float fl = smoothstep(0.42, 0.9, snoise(pm * 34.0 + 2.0) * 0.6 + n1 * 0.4 + 0.2);
  fl *= uFarina * mix(0.55, 1.0, max(vSotto, vCorn)) * (1.0 - max(sugo, mozz));
  superficie = mix(superficie, uFarinaCol, clamp(fl, 0.0, 1.0) * 0.8);

  // rilievo di mozzarella, foglie e grumi del sugo: bump in spazio schermo
  float hb = 0.022 * smoothstep(0.0, 1.0, mozz) + 0.006 * sugo * spess + 0.008 * bas;
  vec3 dpx = dFdx(vPosW);
  vec3 dpy = dFdy(vPosW);
  float dhx = dFdx(hb);
  float dhy = dFdy(hb);
  vec3 r1 = cross(dpy, N);
  vec3 r2 = cross(N, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  N = normalize(abs(det) * N - grad);

  float ao = mix(0.5, 1.0, smoothstep(0.0, 0.07, pm.y + (1.0 - vSotto) * 0.06));
  ao *= 1.0 - vPiega * 0.25;

  float lucido = mix(16.0, 70.0, uUnto);
  float forza = mix(0.03, 0.4, uUnto);
  lucido = mix(lucido, 55.0, sugo);
  forza = mix(forza, 0.32, sugo);
  forza = mix(forza, 0.12, mozz);
  forza = mix(forza, 0.25, bas);
  forza *= 1.0 - clamp(fl, 0.0, 1.0) * 0.8;

  vec3 col = illumina(superficie, N, V, 0.42, lucido, forza * (0.6 + 0.4 * n2)) * ao;

  // la pasta cruda lascia passare un po' di luce
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  col += uColRetro * crudo * fres * 0.22 * (1.0 - c);
  col += uColRetro * fres * 0.05 * c;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ---- Il supporto: tegamino, teglia o tagliere ------------------------------
   Profilo (t): fondo interno → parete interna → bordo tondo → parete esterna →
   fondo esterno. La pianta è una superellisse con i semiassi della pasta. */
const SUP_V = /* glsl */ `
uniform float uA, uC, uSupN, uSupH, uSupG, uSupT, uSupB;
varying vec3 vPosW;
varying vec3 vNormW;
varying vec3 vPosM;
varying float vDentro;

${COMUNE}

vec3 guscio(float t, float phi, out float dentro) {
  vec2 dir = vec2(-cos(phi), sin(phi));
  float R = superR(dir, uA, uC, uSupN);
  float ri = R + uSupG;
  float ro = ri + uSupT;
  float rw;
  float y;
  dentro = 0.0;
  if (t < 0.3) {
    rw = ri * (t / 0.3);
    y = uSupB;
    dentro = 1.0;
  } else if (t < 0.45) {
    float s = (t - 0.3) / 0.15;
    rw = ri;
    y = mix(uSupB, uSupH + uSupB, s);
    dentro = 1.0;
  } else if (t < 0.55) {
    float s = (t - 0.45) / 0.1;
    float a = PI * (1.0 - s);
    rw = ri + uSupT * 0.5 + uSupT * 0.5 * cos(a);
    y = uSupH + uSupB + uSupT * 0.5 * sin(a);
  } else if (t < 0.7) {
    float s = (t - 0.55) / 0.15;
    rw = ro;
    y = mix(uSupH + uSupB, 0.0, s);
  } else {
    float s = (t - 0.7) / 0.3;
    rw = ro * (1.0 - s);
    y = 0.0;
  }
  return vec3(dir.x * rw, y, dir.y * rw);
}

void main() {
  float phi = uv.x * 2.0 * PI;
  float t = 1.0 - uv.y;
  float d, d2;
  vec3 P = guscio(t, phi, d);
  vec3 Pt = guscio(min(t + 0.001, 0.9999), phi, d2);
  vec3 Pp = guscio(t, phi + 0.002, d2);
  vec3 N = cross(Pt - P, Pp - P);
  N = length(N) < 1e-7 ? vec3(0.0, t < 0.5 ? 1.0 : -1.0, 0.0) : normalize(N);
  vDentro = d;
  vPosM = P;
  vec4 w = modelMatrix * vec4(P, 1.0);
  vPosW = w.xyz;
  vNormW = normalize(mat3(modelMatrix) * N);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const SUP_F = /* glsl */ `
uniform float uLegno, uVis;
uniform vec3 uAcciaio, uLegnoCol;
varying vec3 vPosW;
varying vec3 vNormW;
varying vec3 vPosM;
varying float vDentro;

${SIMPLEX}
${COMUNE}
${LUCE}

void main() {
  // compare e scompare a grana fine, senza trasparenze da ordinare
  float soglia = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  if (soglia > uVis) discard;
  vec3 N = normalize(vNormW);
  vec3 V = normalize(cameraPosition - vPosW);
  if (dot(N, V) < 0.0) N = -N;

  // acciaio brunito: scuro, con la luce del forno che ci scivola sopra
  vec3 acc = uAcciaio * (0.9 + 0.2 * snoise(vPosM * 3.0));
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 colA = illumina(acc, N, V, 0.2, 60.0, 0.9) + uColRetro * fres * 0.35;
  colA *= mix(1.0, 0.75, vDentro);

  // legno: venatura lungo il tagliere, unto e infarinato dove passa la pizza
  float ven = snoise(vec3(vPosM.x * 0.6, vPosM.z * 14.0, 0.0)) * 0.6 + snoise(vec3(vPosM.x * 2.0, vPosM.z * 40.0, 3.0)) * 0.25;
  vec3 legno = uLegnoCol * (0.82 + 0.28 * ven);
  float sem = smoothstep(0.55, 0.9, snoise(vPosM * 30.0)) * 0.5;
  legno = mix(legno, vec3(0.86, 0.76, 0.52), sem);
  vec3 colL = illumina(legno, N, V, 0.35, 22.0, 0.08);

  vec3 col = mix(colA, colL, uLegno);
  float ao = mix(0.55, 1.0, smoothstep(0.0, 0.06, vPosM.y));
  gl_FragColor = vec4(col * ao, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* Fondo: la luce del forno sul banco, uguale al gradiente CSS di ripiego. */
const FONDO_V = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;
const FONDO_F = /* glsl */ `
uniform vec2 uCentro;
uniform float uAspetto;
uniform vec3 uCaldo, uMedio, uBuio;
varying vec2 vUv;
void main() {
  vec2 p = vUv - uCentro;
  p.x *= uAspetto;
  float d = length(p * vec2(0.85, 1.15));
  vec3 col = mix(uCaldo, uMedio, smoothstep(0.0, 0.45, d));
  col = mix(col, uBuio, smoothstep(0.35, 1.05, d));
  // una grana fine, perché il nero non sia digitale
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/* Ombra di contatto con la stessa pianta della forma (o del supporto). */
const OMBRA_V = /* glsl */ `
varying vec2 vXZ;
void main() { vXZ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const OMBRA_F = /* glsl */ `
uniform float uA, uC, uN, uPalla, uScala, uOpacita;
varying vec2 vXZ;
void main() {
  vec2 p = vXZ;
  float sup = pow(pow(abs(p.x) / (uA * 1.02), uN) + pow(abs(p.y) / (uC * 1.02), uN), 1.0 / uN);
  float cer = length(p) / (uScala * 1.12);
  float d = mix(sup, cer, uPalla);
  float a = (1.0 - smoothstep(0.55, 1.35, d)) * 0.75 + (1.0 - smoothstep(0.85, 1.04, d)) * 0.25;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a * uOpacita);
}
`;

/* Farina nell'aria: granelli che scendono piano nel fascio della luce. */
const ARIA_V = /* glsl */ `
attribute vec4 aDati;
uniform float uTempo, uPx;
varying float vLuce;
void main() {
  vec3 p = position;
  float vel = 0.05 + aDati.x * 0.08;
  p.y = mod(p.y - uTempo * vel, 3.4) - 0.2;
  p.x += sin(uTempo * (0.2 + aDati.y * 0.3) + aDati.z * 6.28) * 0.18;
  p.z += cos(uTempo * (0.15 + aDati.y * 0.25) + aDati.z * 6.28) * 0.18;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * (2.0 + aDati.w * 5.0) / -mv.z;
  vLuce = smoothstep(4.2, 0.6, length(p.xz - vec2(-0.6, 0.4))) * smoothstep(3.2, 0.5, p.y);
}
`;
const ARIA_F = /* glsl */ `
uniform float uAria;
uniform vec3 uColore;
varying float vLuce;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c));
  a *= a;
  gl_FragColor = vec4(uColore * a * (0.05 + 0.95 * vLuce) * uAria, 1.0);
  #include <colorspace_fragment>
}
`;

function random(seed) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* Filigrana dell'anteprima, ripetuta e inclinata, disegnata nel canvas. */
function tramaFiligrana() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const g = canvas.getContext('2d');
  g.fillStyle = '#FBF8F0';
  g.font = '700 21px Arial, Helvetica, sans-serif';
  g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = '5px';
  const testo = 'DEMO · PRISMA LOCALE';
  g.fillText(testo, 14, 44);
  g.fillText(testo, 270, 120);
  g.fillText(testo, 270 - 512, 120);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.center.set(0.5, 0.5);
  texture.rotation = (24 * Math.PI) / 180;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const NOOP = { ready: false, setTappa() {}, setAria() {}, setPuntatore() {}, setInquadratura() {}, setAttiva() {}, dispose() {} };

/* host: elemento che contiene il canvas.
   opzioni.still: { tappa, tempo, centroX, aria } → Promise con il canvas renderizzato. */
export function createImpasto(host, options = {}) {
  const { dpr = 1.75, granelli = 90, still = null, onReady, onFail, onLost, onRestored } = options;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: Boolean(still),
    });
  } catch (error) {
    canvas.remove();
    onFail?.(error);
    return still ? Promise.reject(error) : NOOP;
  }

  renderer.debug.checkShaderErrors = import.meta.env?.DEV ?? false;
  renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio || 1, dpr));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(BRUCIATURA, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 60);
  scene.add(camera);

  /* Fondo */
  const fondo = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      vertexShader: FONDO_V,
      fragmentShader: FONDO_F,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uCentro: { value: new Vector2(0.66, 0.46) },
        uAspetto: { value: 1.6 },
        uCaldo: { value: new Color('#5B341A') },
        uMedio: { value: new Color('#2A170D') },
        uBuio: { value: new Color(BRUCIATURA) },
      },
    }),
  );
  fondo.frustumCulled = false;
  fondo.renderOrder = -10;
  scene.add(fondo);

  /* Luce, condivisa */
  const luce = {
    uLuceChiave: { value: new Vector3(-0.55, 0.85, 0.45).normalize() },
    uLuceRetro: { value: new Vector3(0.35, 0.45, -0.85).normalize() },
    uLuceFill: { value: new Vector3(0.85, 0.25, 0.5).normalize() },
    uColChiave: { value: new Color('#FFF1E2').multiplyScalar(1.45) },
    uColRetro: { value: new Color('#FFA25A').multiplyScalar(0.6) },
    uColFill: { value: new Color('#9FA9C2').multiplyScalar(0.4) },
    uCielo: { value: new Color('#6E5640').multiplyScalar(0.55) },
    uTerra: { value: new Color('#2A1A10').multiplyScalar(0.5) },
  };

  /* La pasta */
  const f = (v) => ({ value: v });
  const uniforms = {
    ...luce,
    uPalla: f(1), uScala: f(1), uA: f(1), uC: f(1), uN: f(2), uW: f(0.2), uCentro: f(0.1), uBordo: f(0.2),
    uIrr: f(0), uBolle: f(0), uFossette: f(0), uRaccolta: f(0), uRespiro: f(0), uAlza: f(0),
    uCottura: f(0), uMacchie: f(0), uUnto: f(0), uFarina: f(1),
    uSugo: f(0), uMozz: f(0), uBasilico: f(0), uMeta: f(0),
    uCrudo: f(new Color('#EBDEC6')),
    uChiaro: f(new Color('#EAD3A6')),
    uDorato: f(new Color('#D69A55')),
    uBruno: f(new Color('#9C5E2C')),
    uCarbone: f(new Color('#2E180C')),
    uFarinaCol: f(new Color('#F8F2E6')),
    uSugoCol: f(new Color('#B92A17')),
    uSugoScuro: f(new Color('#7C170C')),
    uMozzCol: f(new Color('#F6F0E2')),
    uBasilicoCol: f(new Color('#2E5A22')),
  };
  const pasta = new Mesh(
    new SphereGeometry(1, still ? 360 : 280, still ? 220 : 170),
    new ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms, side: DoubleSide }),
  );
  pasta.frustumCulled = false;
  scene.add(pasta);

  /* Il supporto */
  const supUni = {
    ...luce,
    uA: uniforms.uA,
    uC: uniforms.uC,
    uSupN: f(2), uSupH: f(0.2), uSupG: f(0.03), uSupT: f(0.03), uSupB: f(0.03),
    uLegno: f(0), uVis: f(0),
    uAcciaio: f(new Color('#3A3634')),
    uLegnoCol: f(new Color('#9A6638')),
  };
  const supporto = new Mesh(
    new SphereGeometry(1, 160, 120),
    new ShaderMaterial({ vertexShader: SUP_V, fragmentShader: SUP_F, uniforms: supUni, side: DoubleSide }),
  );
  supporto.frustumCulled = false;
  pasta.add(supporto);

  /* Ombra */
  const ombraUni = {
    uA: f(1), uC: f(1), uN: uniforms.uN,
    uPalla: uniforms.uPalla,
    uScala: uniforms.uScala,
    uOpacita: f(0.72),
  };
  const ombra = new Mesh(
    new PlaneGeometry(8, 8),
    new ShaderMaterial({ vertexShader: OMBRA_V, fragmentShader: OMBRA_F, uniforms: ombraUni, transparent: true, depthWrite: false }),
  );
  ombra.rotation.x = -Math.PI / 2;
  ombra.position.y = -0.004;
  ombra.renderOrder = -1;
  pasta.add(ombra);

  /* Farina nell'aria */
  const rand = random(21);
  const pos = new Float32Array(granelli * 3);
  const dati = new Float32Array(granelli * 4);
  for (let i = 0; i < granelli; i++) {
    // più fitti nel fascio della luce chiave, in alto a sinistra del soggetto
    pos[i * 3] = (rand() - 0.5) * 4.2 - 0.4;
    pos[i * 3 + 1] = rand() * 3.4 - 0.2;
    pos[i * 3 + 2] = (rand() - 0.5) * 3.6 + 0.3;
    dati[i * 4] = rand();
    dati[i * 4 + 1] = rand();
    dati[i * 4 + 2] = rand();
    dati[i * 4 + 3] = rand() ** 2;
  }
  const ariaGeo = new BufferGeometry();
  ariaGeo.setAttribute('position', new BufferAttribute(pos, 3));
  ariaGeo.setAttribute('aDati', new BufferAttribute(dati, 4));
  const ariaUni = {
    uTempo: f(0),
    uPx: f(30),
    uAria: f(1),
    uColore: f(new Color('#FFE9CF').multiplyScalar(0.16)),
  };
  const aria = new Points(
    ariaGeo,
    new ShaderMaterial({ vertexShader: ARIA_V, fragmentShader: ARIA_F, uniforms: ariaUni, transparent: true, depthWrite: false, blending: AdditiveBlending }),
  );
  aria.frustumCulled = false;
  scene.add(aria);

  /* Filigrana: un piano agganciato alla camera, disegnato per ultimo. */
  const filigrana = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({ map: tramaFiligrana(), transparent: true, opacity: 0.028, depthTest: false, depthWrite: false, toneMapped: false }),
  );
  filigrana.position.z = -1;
  filigrana.renderOrder = 999;
  camera.add(filigrana);

  /* ---- Stato ---- */
  const forma = {};
  const state = {
    target: 0,
    tappa: 0,
    time: 0,
    aria: 1,
    ariaTarget: 1,
    px: 0,
    py: 0,
    pxT: 0,
    pyT: 0,
    // dove sta il soggetto nel fotogramma (0 = sinistra, 1 = destra)
    centroX: 0.68,
    centroXT: 0.68,
    centroY: 0.5,
    zoom: 1,
    w: 1,
    h: 1,
    distanza: 7.4,
  };
  const GUARDA = new Vector3(0, 0.22, 0);

  function applica(tappa, t) {
    formaA(tappa, forma);
    const set = (u, v) => { u.value = v; };
    set(uniforms.uPalla, forma.palla);
    set(uniforms.uScala, forma.scala);
    set(uniforms.uA, forma.a);
    set(uniforms.uC, forma.c);
    set(uniforms.uN, forma.n);
    set(uniforms.uW, forma.w);
    set(uniforms.uCentro, forma.centro);
    set(uniforms.uBordo, forma.bordo);
    set(uniforms.uIrr, forma.irr);
    set(uniforms.uBolle, forma.bolle);
    set(uniforms.uFossette, forma.fossette);
    set(uniforms.uRaccolta, forma.raccolta);
    set(uniforms.uCottura, forma.cottura);
    set(uniforms.uMacchie, forma.macchie);
    set(uniforms.uUnto, forma.unto);
    set(uniforms.uFarina, forma.farina);
    set(uniforms.uSugo, forma.sugo);
    set(uniforms.uMozz, forma.mozz);
    set(uniforms.uBasilico, forma.basilico);
    set(uniforms.uMeta, forma.meta);
    // il panetto respira appena, come la pasta che lievita
    set(uniforms.uRespiro, Math.sin(t * 0.9) * 0.012 * forma.palla);
    // nel tegamino e nella teglia la pasta sta sul fondo, sul tagliere sopra il legno
    const fondoSup = forma.supB * forma.supVis + (forma.legno > 0.5 ? forma.supT * 0.5 * forma.supVis : 0);
    set(uniforms.uAlza, fondoSup);

    set(supUni.uSupN, forma.supN);
    set(supUni.uSupH, forma.supH);
    set(supUni.uSupG, forma.supG);
    set(supUni.uSupT, forma.supT);
    set(supUni.uSupB, forma.supB);
    set(supUni.uLegno, forma.legno);
    set(supUni.uVis, forma.supVis);
    supporto.visible = forma.supVis > 0.002;

    // l'ombra prende la pianta del supporto quando c'è
    const extra = (forma.supG + forma.supT) * forma.supVis;
    ombraUni.uA.value = forma.a + extra;
    ombraUni.uC.value = forma.c + extra;

    pasta.rotation.y = 0.5 + forma.giro + t * 0.07 + state.px * 0.12;
    ariaUni.uTempo.value = t;
    ariaUni.uAria.value = state.aria;

    // camera: tre quarti dall'alto; più bassa sul panetto, che è alto
    const el = 0.7 - forma.palla * 0.18 + state.py * 0.04;
    const d = state.distanza;
    camera.position.set(0, Math.sin(el) * d + GUARDA.y, Math.cos(el) * d);
    camera.lookAt(GUARDA);

    // il soggetto fuori centro: si sposta la finestra di proiezione
    const offX = (0.5 - state.centroX) * state.w;
    const offY = (0.5 - state.centroY) * state.h;
    camera.setViewOffset(state.w, state.h, offX, offY, state.w, state.h);
    fondo.material.uniforms.uCentro.value.set(state.centroX, 1 - state.centroY - 0.06);
  }

  function resize() {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    state.w = w;
    state.h = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const meta = Math.tan(((camera.fov / 2) * Math.PI) / 180);
    // la forma più larga (~4.4 con il tagliere) deve stare nel suo spazio
    state.distanza = Math.max(7.6, 2.5 / (meta * Math.min(camera.aspect, 1.9) * 0.62)) * state.zoom;
    fondo.material.uniforms.uAspetto.value = camera.aspect;
    ariaUni.uPx.value = 26 * renderer.getPixelRatio() * (h / 900);
    const altezza = 2 * meta;
    const larghezza = altezza * camera.aspect;
    filigrana.scale.set(larghezza, altezza, 1);
    const modulo = (460 / h) * altezza;
    filigrana.material.map.repeat.set(larghezza / modulo, altezza / (modulo * (160 / 512)));
  }

  /* ---- Immagine statica ---- */
  if (still) {
    state.centroX = still.centroX ?? 0.5;
    state.centroY = still.centroY ?? 0.5;
    state.zoom = still.zoom ?? 1;
    state.aria = still.aria ?? 0.6;
    resize();
    applica(still.tappa ?? 0, still.tempo ?? 4);
    const compiled = renderer.extensions.has('KHR_parallel_shader_compile')
      ? renderer.compileAsync(scene, camera)
      : Promise.resolve(renderer.compile(scene, camera));
    return compiled.then(() => {
      renderer.render(scene, camera);
      return {
        canvas,
        dispose: () => {
          renderer.dispose();
          canvas.remove();
        },
      };
    });
  }

  /* ---- Ciclo ---- */
  let rafId = 0;
  let running = false;
  let attiva = false;
  let lost = false;
  let wasLost = false;
  let disposed = false;
  let last = 0;
  const perf = { skip: 120, frames: 0, total: 0, stage: 0 };

  function monitor(dt) {
    if (perf.stage > 1) return;
    if (perf.skip > 0) {
      perf.skip -= 1;
      return;
    }
    perf.frames += 1;
    perf.total += dt;
    if (perf.frames < 90) return;
    const media = perf.total / perf.frames;
    perf.frames = 0;
    perf.total = 0;
    if (media <= 1 / 42) {
      perf.stage = 2;
    } else if (perf.stage === 0) {
      renderer.setPixelRatio(1);
      resize();
      perf.stage = 1;
      perf.skip = 30;
    } else {
      perf.stage = 2;
      onFail?.(new Error('frame rate insufficiente'));
    }
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    // passo massimo di 1/8 s: dopo una pausa non si salta, ma una macchina lenta non resta indietro
    const dt = Math.min((now - last) / 1000, 1 / 8);
    last = now;
    state.time += dt;
    const k = 1 - Math.exp(-dt * 4.5);
    state.tappa += (state.target - state.tappa) * k;
    state.aria += (state.ariaTarget - state.aria) * k;
    state.px += (state.pxT - state.px) * (1 - Math.exp(-dt * 2.5));
    state.py += (state.pyT - state.py) * (1 - Math.exp(-dt * 2.5));
    state.centroX += (state.centroXT - state.centroX) * k;
    applica(state.tappa, state.time);
    renderer.render(scene, camera);
    monitor(dt);
  }

  function setRunning(on) {
    if (on === running || disposed || lost) return;
    running = on;
    if (on) {
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  const api = {
    ready: false,
    canvas,
    setTappa(value) {
      state.target = value;
    },
    setAria(value) {
      state.ariaTarget = value;
    },
    setPuntatore(x, y) {
      state.pxT = x;
      state.pyT = y;
    },
    setInquadratura(centroX) {
      state.centroXT = centroX;
    },
    setAttiva(on) {
      attiva = on;
      sync();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (wasLost) {
        if (!lost) renderer.forceContextLoss();
        canvas.remove();
        return;
      }
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        for (const material of materials) {
          material.map?.dispose();
          material.dispose();
        }
      });
      renderer.renderLists.dispose();
      renderer.dispose();
      if (!lost) renderer.forceContextLoss();
      canvas.remove();
    },
  };

  function sync() {
    setRunning(attiva && !document.hidden && api.ready);
  }
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!running && !lost && !disposed) {
      applica(state.tappa, state.time);
      renderer.render(scene, camera);
    }
  });
  const onContextLost = (event) => {
    event.preventDefault();
    lost = true;
    wasLost = true;
    running = false;
    cancelAnimationFrame(rafId);
    onLost?.();
  };
  const onContextRestored = () => {
    lost = false;
    onRestored?.();
  };
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  resize();
  applica(0, 0);

  const compiled = renderer.extensions.has('KHR_parallel_shader_compile')
    ? renderer.compileAsync(scene, camera).catch(() => {})
    : Promise.resolve(renderer.compile(scene, camera));
  compiled.then(() => {
    if (disposed || lost) return;
    state.tappa = state.target;
    applica(state.tappa, 0);
    renderer.render(scene, camera);
    api.ready = true;
    resizeObserver.observe(host);
    sync();
    onReady?.();
  });

  return api;
}
