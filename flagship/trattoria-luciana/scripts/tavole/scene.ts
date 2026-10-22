/* ==========================================================================
   Tavole provvisorie di Trattoria Luciana.

   Non sono fotografie: sono "dipinti" generati da shader, nella palette del
   sito, che tengono il posto alle foto vere. Sono tutti lo stesso mare a
   ore diverse: l'alba sulla costa, la paranza controluce, il mezzogiorno
   dalla tavola, il lungomare all'ora blu, la luna. Più la luce della
   pergola su una tovaglia.

   Le onde sono quelle dell'apertura (components/mare/acqua.ts).
   ========================================================================== */

import { PALETTE, UTILI, ONDE, FRAMMENTO } from '../../components/mare/acqua.ts';

const PRELUDIO = /* glsl */ `
precision highp float;
uniform vec2 uRis;
uniform float uTempo;
uniform float uCx;      // spostamento orizzontale della composizione
uniform float uOriz;    // altezza dell'orizzonte (0 in basso, 1 in alto)
uniform float uGrana;
${PALETTE}
${UTILI}
${ONDE}

float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
float f1(float x) { float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * n1(x); x *= 2.03; a *= 0.5; } return s; }
float creste(float x) { float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * (1.0 - abs(n1(x) * 2.0 - 1.0)); x *= 2.1; a *= 0.5; } return s; }
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++) { s += a * n2(p); p = m * p; a *= 0.5; } return s; }

// Finitura comune: spalla morbida sulle luci, vignetta, grana di pellicola.
vec3 finitura(vec3 c) {
  vec2 q = gl_FragCoord.xy / uRis;
  vec2 v = q - 0.5;
  c *= 1.0 - dot(v, v) * 0.42;
  c = mix(c, 0.82 + 0.18 * (1.0 - exp(-(c - 0.82) / 0.18)), step(0.82, c));
  c += (hash(gl_FragCoord.xy + 17.0) - 0.5) * uGrana;
  return clamp(c, 0.0, 1.0);
}

// Camera sul mare: altezza, focale e orizzonte a uOriz. rd in coordinate mondo.
const float FOCALE = 1.45;
float beccheggio() { return -atan((uOriz - 0.5) / FOCALE); }
vec3 raggio(vec2 frag) {
  vec2 uv = (frag - 0.5 * uRis) / uRis.y;
  uv.x += uCx;
  vec3 rd = normalize(vec3(uv, FOCALE));
  rd.yz = ruota(beccheggio()) * rd.yz;
  return rd;
}
// Da una direzione mondo al "foglio" del paesaggio: x orizzontale, y altezza
// sopra l'orizzonte, nelle stesse unità dello schermo. Serve anche ai riflessi.
vec2 mondo(vec3 r) {
  return vec2(r.x / max(r.z, 1e-3), r.y / max(length(r.xz), 1e-3)) * FOCALE;
}
`;

/* ------------------------------------------------------------------ ROSETO
   La costa all'alba vista dal mare, guardando a ovest: il sole è alle spalle
   e accende la città, le colline e la neve del Gran Sasso. */
const ROSETO = PRELUDIO + /* glsl */ `
// Il massiccio: una cresta frastagliata dentro un inviluppo largo, con il
// Corno Grande che spunta un po' a sinistra del centro.
float inviluppo(float x) { return exp(-pow((x + 0.12) / 0.78, 2.0)); }
float sasso(float x) {
  float m = inviluppo(x) * (0.04 + 0.085 * pow(creste(x * 2.1 + 1.7), 1.7));
  m += 0.045 * exp(-pow((x + 0.1) / 0.075, 2.0)) + 0.02 * exp(-pow((x + 0.24) / 0.05, 2.0));
  m += 0.005 * creste(x * 11.0 + 4.0) * inviluppo(x);
  return m * 1.25;
}
float sassoLiscio(float x) {
  return (inviluppo(x) * (0.04 + 0.085 * pow(creste(x * 2.1 + 1.7), 1.7)) + 0.045 * exp(-pow((x + 0.1) / 0.075, 2.0))) * 1.25;
}
float collinaLontana(float x) { return 0.034 + 0.018 * f1(x * 2.3 + 4.0) + 0.012 * exp(-pow((x + 0.1) / 0.4, 2.0)); }
float collinaVicina(float x) { return 0.02 + 0.014 * f1(x * 3.4 + 11.0); }

vec3 cieloAlba(float y) {
  vec3 basso = mix(SABBIA * 1.04, vec3(0.93, 0.78, 0.72), 0.35);
  vec3 c = mix(basso, vec3(0.62, 0.68, 0.72), smoothstep(0.0, 0.16, y));
  c = mix(c, ADRIATICO * 2.6, smoothstep(0.12, 0.5, y));
  return c;
}

// Il paesaggio sopra l'orizzonte; y = altezza sopra l'orizzonte (unità schermo).
vec3 paesaggio(float x, float y) {
  vec3 foschia = cieloAlba(0.02);
  vec3 col = cieloAlba(y);
  // nuvole basse accese di rosa
  float nv = fbm(vec2(x * 1.6, y * 9.0) + 2.0);
  col = mix(col, mix(vec3(0.95, 0.82, 0.78), AVORIO, 0.4), smoothstep(0.58, 0.8, nv) * smoothstep(0.32, 0.12, y) * smoothstep(0.08, 0.16, y) * 0.55);

  // Gran Sasso: ombra blu, versanti in luce, neve accesa dall'alba
  float m = sasso(x);
  if (y < m) {
    float dm = (sassoLiscio(x + 0.01) - sassoLiscio(x - 0.01)) / 0.02;
    float luce = clamp(0.6 + dm * 0.6 + 0.25 * (fbm(vec2(x * 30.0, y * 30.0)) - 0.5), 0.15, 1.0);
    vec3 roccia = mix(vec3(0.34, 0.37, 0.46), vec3(0.72, 0.6, 0.56), luce);
    float neve = smoothstep(0.085, 0.1, y + 0.03 * (fbm(vec2(x * 24.0, y * 40.0)) - 0.5));
    vec3 c = mix(roccia, mix(vec3(0.99, 0.86, 0.8), vec3(0.72, 0.76, 0.88), 1.0 - luce), neve);
    col = mix(c, foschia, 0.34 + 0.2 * (1.0 - y / 0.18));
  }
  float cl = collinaLontana(x);
  if (y < cl) col = mix(mix(SALVIA * 0.85, vec3(0.45, 0.5, 0.52), 0.5), foschia, 0.36 + 0.2 * (1.0 - y / cl));
  float cv = collinaVicina(x);
  if (y < cv) col = mix(SALVIA * 0.72 + vec3(0.05, 0.04, 0.02), foschia, 0.2);

  // la città: case basse in luce calda, qualche finestra
  float cella = floor(x * 60.0);
  float hh = h1(cella * 1.37 + 3.0);
  float altezza = 0.008 + 0.026 * pow(hh, 1.8);
  if (h1(cella * 7.1) < 0.14) altezza = 0.004 + 0.006 * h1(cella);
  if (y < altezza + 0.006 && y > 0.006) {
    float tinta = h1(cella * 3.3);
    vec3 facciata = mix(mix(AVORIO, SABBIA, tinta), mix(vec3(0.92, 0.74, 0.66), vec3(0.95, 0.88, 0.7), tinta), step(0.6, tinta) * 0.7);
    facciata *= 0.92 + 0.12 * h1(cella * 9.0);
    vec2 f = vec2(fract(x * 60.0 * 4.0), fract((y - 0.006) * 240.0));
    float fin = step(0.35, f.x) * step(f.x, 0.7) * step(0.3, f.y) * step(f.y, 0.7) * step(y, altezza + 0.0045);
    facciata = mix(facciata, facciata * 0.55, fin * 0.8);
    float tetto = smoothstep(altezza + 0.0045, altezza + 0.006, y);
    col = mix(mix(facciata, TERRACOTTA * 0.8, tetto), foschia, 0.12);
  }
  // le palme del lungomare
  float passo = 0.052;
  float xp = mod(x + 0.01, passo) - passo * 0.5 + passo * 0.3 * (h1(floor((x + 0.01) / passo) + 9.0) - 0.5);
  float id = floor((x + 0.01) / passo);
  float hp = (0.016 + 0.007 * h1(id)) * step(0.3, h1(id + 2.0));
  float tronco = smoothstep(0.0011, 0.0005, abs(xp + (y - 0.006) * 0.12 * (h1(id + 4.0) - 0.5))) * step(0.006, y) * step(y, 0.006 + hp);
  vec2 cp = vec2(xp + hp * 0.06 * (h1(id + 4.0) - 0.5), y - 0.006 - hp);
  float ang = atan(cp.y, cp.x);
  float chioma = smoothstep(0.0012, 0.0, length(cp) - 0.0085 * (0.35 + 0.65 * abs(sin(ang * 4.5 + id))) * (cp.y < 0.0 ? 0.75 : 1.0));
  col = mix(col, mix(SALVIA * 0.45, NOTTE, 0.35), max(tronco, chioma) * 0.92);
  // la spiaggia
  if (y < 0.006) col = mix(SABBIA * 1.06, vec3(0.97, 0.86, 0.78), 0.3) * (0.9 + 0.1 * y / 0.006);
  return col;
}

void main() {
  vec3 rd = raggio(gl_FragCoord.xy);
  vec2 s = mondo(rd);
  vec3 col;
  if (rd.y > 0.0) {
    col = paesaggio(s.x, s.y);
  } else {
    vec3 ro = vec3(0.0, 1.3, 0.0);
    float t = -ro.y / rd.y;
    vec3 p = ro + rd * t;
    float ott = clamp(12.0 - log2(t + 1.0) * 1.8, 3.0, 12.0);
    vec3 w = onde(p.xz * 1.1, uTempo, ott);
    vec3 n = normalize(vec3(-w.y * 0.8, 1.0, -w.z * 0.8));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(4.0, 40.0, t)));
    vec3 r = reflect(rd, n);
    r.y = abs(r.y);
    vec2 sr = mondo(r);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 riflesso = paesaggio(sr.x, max(sr.y, 0.012)) * 0.85;
    vec3 corpo = mix(NOTTE, ADRIATICO, 0.9) + vec3(0.015, 0.05, 0.05) * smoothstep(0.2, 0.9, w.x);
    col = mix(corpo, riflesso, clamp(fres, 0.0, 1.0));
    col = mix(col, cieloAlba(0.01) * 0.9, (1.0 - exp(-t * 0.025)) * 0.65);
  }
  gl_FragColor = vec4(finitura(col), 1.0);
}
`;

/* ----------------------------------------------------------------- PARANZA
   Il peschereccio che rientra all'alba, controluce sul sole basso. */
const PARANZA = PRELUDIO + /* glsl */ `
const vec3 SOLE = vec3(-0.12, 0.04, 1.0);

vec3 cielo(vec3 r) {
  float y = max(r.y, 0.0);
  vec3 c = mix(mix(TERRACOTTA * 1.18, SABBIA * 1.08, 0.55), vec3(0.5, 0.56, 0.6), smoothstep(0.0, 0.14, y));
  c = mix(c, ADRIATICO * 1.8, smoothstep(0.1, 0.55, y));
  vec3 s = normalize(SOLE);
  float sd = max(dot(r, s), 0.0);
  c += OTTONE * pow(sd, 14.0) * 0.34;
  c += vec3(1.0, 0.9, 0.76) * pow(sd, 120.0) * 0.4;
  c = mix(c, vec3(1.0, 0.97, 0.9) * 1.25, smoothstep(0.99962, 0.99974, sd));
  // strati sottili di nubi davanti al sole
  float b = fbm(vec2(r.x / max(r.y, 0.02) * 0.6, log(max(r.y, 0.001)) * 5.0));
  c = mix(c, c * vec3(0.78, 0.74, 0.78), smoothstep(0.55, 0.75, b) * smoothstep(0.01, 0.05, y) * smoothstep(0.25, 0.08, y) * 0.6);
  return c;
}

float segmento(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
float scatola(vec2 p, vec2 c, vec2 m) { vec2 d = abs(p - c) - m; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

// La paranza in silhouette: scafo con la prua alta, la timoneria a prua,
// l'albero con la crocetta, il portale a poppa e qualche cavo.
float barca(vec2 p) {
  float ponte = 0.1 + 0.07 * smoothstep(0.25, 0.6, p.x);
  float scafo = max(scatola(p, vec2(0.0, 0.06), vec2(0.6, 0.08)), p.y - ponte);
  scafo = max(scafo, -(p.x + 0.6 - p.y * 0.35));
  float d = scafo;
  d = min(d, scatola(p, vec2(0.28, 0.2), vec2(0.13, 0.07)));
  d = min(d, scatola(p, vec2(0.3, 0.285), vec2(0.1, 0.018)));
  d = min(d, segmento(p, vec2(0.1, 0.12), vec2(0.1, 0.78)) - 0.009);
  d = min(d, segmento(p, vec2(0.0, 0.62), vec2(0.2, 0.62)) - 0.006);
  d = min(d, segmento(p, vec2(-0.5, 0.1), vec2(-0.42, 0.5)) - 0.008);
  d = min(d, segmento(p, vec2(-0.3, 0.1), vec2(-0.38, 0.5)) - 0.008);
  d = min(d, segmento(p, vec2(-0.44, 0.5), vec2(-0.36, 0.5)) - 0.01);
  d = min(d, segmento(p, vec2(0.1, 0.76), vec2(-0.4, 0.5)) - 0.003);
  d = min(d, segmento(p, vec2(0.1, 0.76), vec2(0.55, 0.17)) - 0.003);
  d = min(d, segmento(p, vec2(0.1, 0.5), vec2(-0.55, 0.12)) - 0.003);
  return d;
}
// un gabbiano: due ali curve
float gabbiano(vec2 p) {
  p.x = abs(p.x);
  float y = 0.22 * sin(p.x * 3.4) - 0.35 * p.x * p.x;
  return max(abs(p.y - y) - 0.05 * (1.0 - p.x), p.x - 0.95);
}

void main() {
  vec3 rd = raggio(gl_FragCoord.xy);
  vec2 s = mondo(rd);
  float px = 1.0 / uRis.y;
  vec3 foschia = cielo(vec3(rd.x, 0.004, rd.z));
  vec2 posBarca = vec2(0.34, -0.004);
  float scala = 0.16;
  vec3 col;
  if (rd.y > 0.0) {
    col = cielo(rd);
    float g = 1e3;
    g = min(g, gabbiano((s - vec2(0.12, 0.2)) / 0.03) * 0.03);
    g = min(g, gabbiano((s - vec2(0.2, 0.25)) / 0.02) * 0.02);
    g = min(g, gabbiano((s - vec2(-0.32, 0.3)) / 0.016) * 0.016);
    col = mix(col, NOTTE * 1.6, smoothstep(px * 1.2, 0.0, g) * 0.8);
  } else {
    vec3 ro = vec3(0.0, 1.0, 0.0);
    float t = -ro.y / rd.y;
    vec3 p = ro + rd * t;
    float ott = clamp(12.0 - log2(t + 1.0) * 1.8, 3.0, 12.0);
    vec3 w = onde(p.xz, uTempo, ott);
    vec3 n = normalize(vec3(-w.y, 1.0, -w.z));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(8.0, 90.0, t)));
    vec3 r = reflect(rd, n);
    r.y = abs(r.y);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 corpo = mix(NOTTE, ADRIATICO, 0.7);
    col = mix(corpo, cielo(r), fres);
    float sp = max(dot(r, normalize(SOLE)), 0.0);
    col += AVORIO * pow(sp, 600.0) * 4.0 + OTTONE * pow(sp, 50.0) * 0.3;
    // il riflesso della barca, spezzato dalle onde
    vec2 sr = vec2(s.x + n.x * 0.012, -s.y + n.z * 0.006 - 0.004);
    float rb = barca((sr - posBarca) / scala);
    col = mix(col, NOTTE * 1.3, smoothstep(0.03, -0.02, rb) * 0.5 * smoothstep(-0.05, -0.002, s.y));
    col = mix(col, foschia, 1.0 - exp(-t * 0.018));
  }
  float b = barca((s - posBarca) / scala) * scala;
  col = mix(col, mix(NOTTE * 1.25, foschia, 0.22), smoothstep(px * 1.5, -px * 0.5, b));
  gl_FragColor = vec4(finitura(col), 1.0);
}
`;

/* --------------------------------------------------------------- ORIZZONTE
   Mezzogiorno, il mare calmo visto dalla tavola. */
const ORIZZONTE = PRELUDIO + /* glsl */ `
const vec3 SOLE = vec3(0.2, 0.62, 0.76);
vec3 cielo(vec3 r) {
  float y = max(r.y, 0.0);
  vec3 c = mix(mix(AVORIO, vec3(0.7, 0.8, 0.84), 0.55), vec3(0.42, 0.56, 0.64), smoothstep(0.0, 0.3, y));
  c = mix(c, ADRIATICO * 2.8, smoothstep(0.25, 0.9, y));
  float nv = fbm(vec2(r.x / max(r.y, 0.03) * 0.5, 1.0 / max(r.y, 0.03) * 0.3));
  c = mix(c, AVORIO, smoothstep(0.6, 0.85, nv) * smoothstep(0.02, 0.1, y) * 0.35);
  return c;
}
void main() {
  vec3 rd = raggio(gl_FragCoord.xy);
  vec3 col;
  if (rd.y > 0.0) {
    col = cielo(rd);
  } else {
    vec3 ro = vec3(0.0, 1.6, 0.0);
    float t = -ro.y / rd.y;
    vec3 p = ro + rd * t;
    float ott = clamp(12.0 - log2(t + 1.0) * 1.8, 3.0, 12.0);
    vec3 w = onde(p.xz * 1.4, uTempo, ott);
    vec3 n = normalize(vec3(-w.y * 0.75, 1.0, -w.z * 0.75));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(10.0, 120.0, t)));
    vec3 r = reflect(rd, n);
    r.y = abs(r.y);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 corpo = mix(ADRIATICO * 1.5, vec3(0.16, 0.36, 0.4), 0.45 * exp(-t * 0.08));
    col = mix(corpo, cielo(r), fres);
    float sp = max(dot(r, normalize(SOLE)), 0.0);
    col += BIANCO * pow(sp, 1500.0) * 6.0;
    col = mix(col, cielo(vec3(rd.x, 0.01, rd.z)), (1.0 - exp(-t * 0.012)) * 0.9);
  }
  gl_FragColor = vec4(finitura(col), 1.0);
}
`;

/* ------------------------------------------------------------------- NOTTE
   Il mare di notte, con la luna e la sua scia. */
const NOTTE_SCENA = PRELUDIO + /* glsl */ `
const vec3 LUNA = vec3(0.3, 0.17, 1.0);
vec3 cielo(vec3 r) {
  float y = max(r.y, 0.0);
  vec3 c = mix(ADRIATICO * 1.35, NOTTE * 0.7, smoothstep(0.0, 0.55, y));
  vec3 l = normalize(LUNA);
  float ld = max(dot(r, l), 0.0);
  c += AVORIO * pow(ld, 40.0) * 0.16 + OTTONE * pow(ld, 8.0) * 0.06;
  c = mix(c, AVORIO * 1.05, smoothstep(0.99962, 0.99975, ld));
  vec2 st = r.xy / max(r.z, 0.1) * 380.0;
  float h = hash(floor(st));
  float stella = step(0.9965, h) * smoothstep(0.5, 0.0, length(fract(st) - 0.5)) * smoothstep(0.04, 0.2, y);
  c += AVORIO * stella * (0.4 + 0.6 * hash(floor(st) + 3.0));
  return c;
}
void main() {
  vec3 rd = raggio(gl_FragCoord.xy);
  vec3 col;
  if (rd.y > 0.0) {
    col = cielo(rd);
  } else {
    vec3 ro = vec3(0.0, 1.8, 0.0);
    float t = -ro.y / rd.y;
    vec3 p = ro + rd * t;
    float ott = clamp(12.0 - log2(t + 1.0) * 1.8, 3.0, 12.0);
    vec3 w = onde(p.xz, uTempo, ott);
    vec3 n = normalize(vec3(-w.y, 1.0, -w.z));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(8.0, 90.0, t)));
    vec3 r = reflect(rd, n);
    r.y = abs(r.y);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    col = mix(NOTTE * 0.8, cielo(r), fres);
    float sp = max(dot(r, normalize(LUNA)), 0.0);
    col += mix(AVORIO, OTTONE, 0.35) * (pow(sp, 320.0) * 2.4 + pow(sp, 40.0) * 0.05);
    col = mix(col, cielo(vec3(rd.x, 0.01, rd.z)), (1.0 - exp(-t * 0.02)) * 0.85);
  }
  gl_FragColor = vec4(finitura(col), 1.0);
}
`;

/* --------------------------------------------------------------- LUNGOMARE
   L'ora blu lungo il lungomare: le case a sinistra con le finestre accese,
   le palme e i lampioni che si allontanano, il mare a destra. */
const LUNGOMARE = PRELUDIO + /* glsl */ `
const float H = 1.65;     // altezza dell'occhio
const float MURO = -7.0;  // facciate
const float BORDO = 2.4;  // fine del marciapiede
const float RIVA = 14.0;  // dove comincia il mare

vec3 cielo(vec3 r) {
  float y = max(r.y, 0.0);
  float ovest = smoothstep(0.4, -0.6, r.x / max(r.z, 0.2));
  vec3 caldo = mix(vec3(0.62, 0.52, 0.56), mix(TERRACOTTA, SABBIA, 0.45), ovest);
  vec3 c = mix(caldo, vec3(0.2, 0.32, 0.44), smoothstep(0.0, 0.12 + 0.08 * ovest, y));
  c = mix(c, ADRIATICO * 1.15, smoothstep(0.12, 0.55, y));
  c = mix(c, NOTTE, smoothstep(0.45, 0.95, y));
  return c;
}

float segmento(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }

// la palma: tronco curvo e fronde che ricadono, in unità di altezza (base in 0,0)
float palma(vec2 p, float seme) {
  float curva = 0.08 * (h1(seme) - 0.5);
  vec2 cima = vec2(curva, 1.0);
  float d = segmento(p, vec2(0.0), cima) - 0.016 * (1.25 - p.y * 0.45);
  vec2 c = p - cima;
  if (dot(c, c) > 0.36) return d;
  for (int i = 0; i < 11; i++) {
    float a = (float(i) + 0.5) / 11.0 * 6.2832 + seme;
    vec2 dir = vec2(cos(a), 0.45 + 0.75 * sin(a));
    float lungo = 0.38 + 0.1 * h1(seme + float(i));
    // la fronda: quattro tratti lungo una parabola che ricade
    vec2 q0 = vec2(0.0);
    for (int k = 1; k <= 4; k++) {
      float t = float(k) / 4.0 * lungo;
      vec2 q1 = dir * t * vec2(1.0, 0.75) + vec2(0.0, -1.1 * t * t);
      float spess = 0.028 * (1.0 - float(k) / 5.0) + 0.004;
      d = min(d, segmento(c, q0, q1) - spess);
      q0 = q1;
    }
  }
  return d;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRis) / uRis.y;
  uv.x += uCx;
  float oy = uOriz - 0.5;
  float v = uv.y - oy;
  float px = 1.0 / uRis.y;
  vec3 rd = normalize(vec3(uv.x, v, FOCALE));
  vec3 col = cielo(rd);

  // il suolo: marciapiede, spiaggia, mare
  if (v < 0.0) {
    float z = H * FOCALE / -v;
    float x = uv.x * z / FOCALE;
    if (x < BORDO) {
      vec3 pav = vec3(0.17, 0.2, 0.24) + 0.02 * n2(vec2(x * 3.0, z * 0.6));
      for (int i = 0; i < 12; i++) {
        float zl = 15.5 + float(i) * 9.0;
        float dd = length(vec2(x - 1.9, (z - zl) * 0.6));
        pav += vec3(0.42, 0.3, 0.16) * exp(-dd * dd * 0.25) * 0.8;
      }
      col = pav;
    } else if (x < RIVA) {
      col = mix(vec3(0.22, 0.25, 0.3), vec3(0.3, 0.3, 0.33), smoothstep(BORDO, RIVA, x)) * (0.92 + 0.1 * n2(vec2(x, z) * 2.0));
    } else {
      vec3 p = vec3(x, 0.0, z);
      vec3 w = onde(p.xz * 0.9, uTempo, clamp(12.0 - log2(z) * 1.8, 3.0, 12.0));
      vec3 n = normalize(vec3(-w.y, 1.0, -w.z));
      vec3 r = reflect(rd, n);
      r.y = abs(r.y);
      float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
      col = mix(NOTTE * 0.9, cielo(r), clamp(fres * 1.2, 0.0, 1.0));
      float riva = smoothstep(RIVA + 0.6, RIVA, x);
      col = mix(col, vec3(0.6, 0.62, 0.66), riva * 0.25);
    }
    col = mix(col, cielo(vec3(rd.x, 0.01, rd.z)), 1.0 - exp(-z * 0.012));
  }

  // le facciate: piano x = MURO
  if (uv.x < 0.0) {
    float z = MURO * FOCALE / uv.x;
    float y = H + v * z / FOCALE;
    float lotto = floor(z / 9.0);
    float alto = 9.0 + 9.0 * h1(lotto * 2.7);
    if (y > 0.0 && y < alto && z > 1.0) {
      vec3 muro = mix(vec3(0.14, 0.18, 0.24), vec3(0.24, 0.24, 0.28), h1(lotto));
      vec2 f = vec2(fract(z / 3.2), fract(y / 3.1));
      float fin = step(0.25, f.x) * step(f.x, 0.62) * step(0.3, f.y) * step(f.y, 0.78) * step(3.1, y);
      float accesa = step(0.55, hash(vec2(floor(z / 3.2), floor(y / 3.1))));
      vec3 vetro = mix(vec3(0.1, 0.13, 0.18), vec3(1.0, 0.76, 0.45) * 1.05, accesa);
      muro = mix(muro, vetro, fin);
      // la trattoria: piano terra caldo, tra 15 e 24 metri
      float tratt = step(15.0, z) * step(z, 24.0) * step(y, 3.2);
      float vetrina = tratt * step(0.4, y) * step(y, 2.7) * step(0.08, fract(z / 2.25)) * step(fract(z / 2.25), 0.92);
      muro = mix(muro, vec3(1.0, 0.8, 0.52) * 1.1, vetrina);
      muro = mix(muro, vec3(0.42, 0.28, 0.18), tratt * (1.0 - step(0.4, y) * step(y, 2.7)) * 0.6);
      // la luce calda dei lampioni sul piano terra
      muro += vec3(0.3, 0.2, 0.1) * smoothstep(4.5, 0.0, y) * 0.35;
      col = mix(muro, cielo(vec3(rd.x, 0.01, rd.z)), 1.0 - exp(-z * 0.01));
    }
  }

  // palme e lampioni lungo il marciapiede
  for (int i = 0; i < 12; i++) {
    float zp = 11.0 + float(i) * 9.0;
    float sc = FOCALE / zp;
    vec2 base = vec2(0.2 * sc, -H * sc + oy);
    float altezzaP = (7.5 + 2.0 * h1(float(i))) * sc;
    vec2 locale = (uv - base) / altezzaP;
    float d = 1e3;
    if (locale.x > -0.6 && locale.x < 0.6 && locale.y > -0.05 && locale.y < 1.5) d = palma(locale, float(i) * 1.7) * altezzaP;
    vec3 ombra = mix(vec3(0.05, 0.08, 0.1), cielo(vec3(rd.x, 0.02, rd.z)), 1.0 - exp(-zp * 0.012));
    col = mix(col, ombra, smoothstep(px, -px, d));
    float zl = zp + 4.5;
    float sl = FOCALE / zl;
    vec2 bl = vec2(1.9 * sl, -H * sl + oy);
    float pal = segmento(uv, bl, bl + vec2(0.0, 4.2 * sl)) - 0.035 * sl;
    col = mix(col, ombra, smoothstep(px, -px, pal));
    vec2 testa = bl + vec2(0.0, 4.25 * sl);
    float dl = length(uv - testa);
    col += vec3(1.0, 0.78, 0.48) * (smoothstep(0.12 * sl + px, 0.0, dl) * 1.4 + exp(-dl / (0.9 * sl)) * 0.22);
  }
  gl_FragColor = vec4(finitura(col), 1.0);
}
`;

/* ----------------------------------------------------------------- PERGOLA
   Dall'alto: la tovaglia di lino, l'ombra delle foglie della pergola,
   un bicchiere d'acqua con la sua caustica, il bordo di un piatto. */
const PERGOLA = PRELUDIO + /* glsl */ `
const vec2 LUCE = vec2(-0.55, 0.38);

vec3 tela(vec2 p) {
  float trama = 0.5 * (n2(p * vec2(1200.0, 70.0)) + n2(p * vec2(70.0, 1200.0)));
  float pieghe = 0.94 + 0.08 * fbm(p * 1.5 + 3.0) - 0.04 * smoothstep(0.012, 0.0, abs(p.x - 0.1 + 0.05 * fbm(p * 2.0)));
  return BIANCO * (0.95 + 0.06 * trama) * pieghe;
}
// L'ombra della pergola: le travi di legno in diagonale e le foglie di vite,
// con le macchie di sole dove la chioma si apre.
float foglie(vec2 p) {
  float u = dot(p, normalize(vec2(1.0, 0.32)));
  float travi = smoothstep(0.0, 0.015, abs(fract(u * 1.6 + 0.2) - 0.5) - 0.43);
  vec2 w = p * 5.5 + vec2(fbm(p * 4.0), fbm(p * 4.0 + 3.0)) * 1.4;
  float f = fbm(w + 11.0);
  float chioma = smoothstep(0.47, 0.53, f) * smoothstep(0.35, 0.7, fbm(p * 1.3 + 5.0) + 0.1);
  float buchi = smoothstep(0.012, 0.0, length(fract(w * 0.9) - 0.5) - 0.06) * step(0.52, hash(floor(w * 0.9)));
  return clamp(max(chioma * (1.0 - buchi), travi * 0.9), 0.0, 1.0);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRis) / uRis.y;
  p.x += uCx;
  vec2 l = normalize(LUCE);
  vec3 sole = vec3(1.0, 0.95, 0.85);
  vec3 ombra = mix(ADRIATICO * 3.0, SABBIA, 0.58);

  vec3 base = tela(p);
  float ombraFoglie = foglie(p + l * 0.02);
  // il piatto: ombra portata, poi il piatto
  vec2 cp = vec2(0.46, -0.34);
  float R = 0.42;
  float dOmbraPiatto = length(p - cp + l * 0.035) - R;
  float ombraPiatto = smoothstep(0.03, -0.02, dOmbraPiatto);
  // il bicchiere: ombra, caustica, vetro
  vec2 cg = vec2(-0.3, 0.14);
  float rg = 0.12;
  vec2 og = (p - cg + l * 0.13) * vec2(1.0, 1.0);
  float ombraBicchiere = smoothstep(0.02, -0.03, length(og * vec2(1.0, 1.15)) - rg * 1.05);
  float buio = clamp(max(ombraFoglie * 0.85, max(ombraPiatto * 0.55, ombraBicchiere * 0.6)), 0.0, 1.0);
  vec3 col = base * mix(sole * 1.04, ombra, buio);
  // caustica: la luce concentrata dall'acqua, un arco brillante nell'ombra
  vec2 cc = p - cg + l * 0.1;
  float arco = smoothstep(0.012, 0.0, abs(length(cc * vec2(1.0, 1.2)) - rg * 0.62)) * smoothstep(-0.2, 0.6, dot(normalize(cc), -l));
  float cuore = exp(-dot(cc, cc) / (rg * rg * 0.08));
  col += vec3(1.0, 0.97, 0.88) * (arco * 0.55 + cuore * 0.35) * ombraBicchiere;
  // il vetro visto dall'alto
  float dg = length(p - cg);
  if (dg < rg) {
    vec3 dentro = tela((p - cg) * 0.82 + cg) * mix(sole, ombra, foglie((p - cg) * 0.82 + cg) * 0.8);
    dentro = mix(dentro, dentro * vec3(0.9, 0.97, 1.0), 0.6);
    col = dentro;
  }
  float bordo = smoothstep(0.004, 0.0, abs(dg - rg)) + 0.5 * smoothstep(0.003, 0.0, abs(dg - rg * 0.9));
  col = mix(col, vec3(0.6, 0.66, 0.68), bordo * 0.5);
  float lampo = smoothstep(0.006, 0.0, abs(dg - rg * 0.95)) * smoothstep(0.7, 1.0, dot(normalize(p - cg), -l));
  col += lampo * 0.6;
  // il piatto: bianco, la tesa più luminosa dal lato del sole
  float dp = length(p - cp);
  if (dp < R) {
    float tesa = smoothstep(R * 0.7, R * 0.74, dp);
    vec2 dirp = normalize(p - cp);
    float lato = dot(dirp, -l);
    vec3 cer = BIANCO * (0.96 + 0.05 * lato * tesa);
    cer *= 1.0 - 0.08 * smoothstep(R * 0.74, R * 0.7, dp) * smoothstep(R * 0.55, R * 0.72, dp) * (0.5 - 0.5 * lato);
    cer *= mix(sole, ombra, foglie(p) * 0.75);
    col = cer;
    col = mix(col, col * 0.86, smoothstep(0.004, 0.0, abs(dp - R * 0.72)) * 0.6);
  }
  col = mix(col, col * 0.8, smoothstep(0.004, 0.0, abs(dp - R)) * 0.7);
  gl_FragColor = vec4(finitura(col), 1.0);
}
`;

export const SCENE = {
  mare: FRAMMENTO,
  roseto: ROSETO,
  paranza: PARANZA,
  orizzonte: ORIZZONTE,
  notte: NOTTE_SCENA,
  lungomare: LUNGOMARE,
  pergola: PERGOLA,
} as const;

export type NomeScena = keyof typeof SCENE;
