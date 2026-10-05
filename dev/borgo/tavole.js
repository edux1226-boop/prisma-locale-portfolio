/* Tavole provvisorie dell'anteprima Borgo Spoltino.

   Non sono foto: sono "dipinti" generati con uno shader, nella palette del
   sito, da sostituire con le fotografie reali della location. Tutte usano lo
   stesso colle, visto verso ovest (il Gran Sasso all'orizzonte), a ore
   diverse: è la giornata del matrimonio. */

const comune = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uCx, uVig;
out vec4 o;

float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float h2(vec2 p) { vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3. - 2. * f); return mix(h1(i), h1(i + 1.), f); }
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y);
}
float f1(float x) { float s = 0., a = .5; for (int i = 0; i < 6; i++) { s += a * n1(x); x *= 2.03; a *= .5; } return s; }
float f2(vec2 p) { float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++) { s += a * n2(p); p = m * p; a *= .5; } return s; }
float ridged(float x) { float s = 0., a = .5; for (int i = 0; i < 6; i++) { s += a * (1. - abs(n1(x) * 2. - 1.)); x *= 2.1; a *= .5; } return s; }

// Colore finale: neri caldi sollevati, grana di pellicola, vignetta.
vec3 finitura(vec3 c, vec2 q, float grana) {
  vec2 v = q - .5;
  c *= 1. - dot(v, v) * .55 * uVig;
  // spalla morbida sulle luci: niente bianchi bruciati
  c = mix(c, .78 + .22 * (1. - exp(-(c - .78) / .22)), step(.78, c));
  c = mix(vec3(.075, .064, .053), vec3(.985, .97, .94), c);
  float g = h2(gl_FragCoord.xy + 17.) - .5;
  c += g * grana * (1.15 - dot(c, vec3(.33)));
  return clamp(c, 0., 1.);
}
`;

/* ------------------------------------------------------------------
   IL COLLE: paesaggio verso il Gran Sasso, dal pomeriggio alla notte.
   ------------------------------------------------------------------ */
const colle = comune + /* glsl */ `
uniform vec3 uSkyTop, uSkyHor, uSunCol, uFog, uFar, uNear, uLit;
uniform vec3 uSun;          // x, y, raggio
uniform float uBloom, uStars, uMoon, uWindows, uStrings, uHaze, uDay, uClouds, uGrain, uRamo, uStrato, uZoom, uCy;

const float BX = .36; // il borgo

float monti(float x) {
  // il massiccio del Gran Sasso: spalle larghe e due cime nette
  float m = .44 + .07 * exp(-pow((x + .3) / .34, 2.));
  m += .045 * exp(-pow((x + .14) / .06, 2.)) + .03 * exp(-pow((x + .27) / .045, 2.)) + .02 * exp(-pow((x + .43) / .08, 2.));
  m += (.04 * ridged(x * 6. + 3.) - .022) * smoothstep(-1.1, -.5, x) * smoothstep(.35, -.05, x) + .008 * ridged(x * 13.);
  m += .014 * exp(-pow((x - .95) / .35, 2.)) + .008 * f1(x * 4.);
  return m;
}

float cresta(int i, float x) {
  if (i == 0) return .43 + .018 * f1(x * 5. + 11.) - .006;
  if (i == 1) return .395 + .04 * f1(x * 2.6 + 4.) - .018 + .012 * exp(-pow((x + .55) / .2, 2.));
  if (i == 2) return .34 + .05 * f1(x * 1.7 + 8.) - .02 + .07 * exp(-pow((x - BX) / .24, 2.));
  if (i == 3) return .215 + .06 * f1(x * 1.3 + 1.) - .03 - .05 * exp(-pow((x - .2) / .3, 2.)) + .04 * exp(-pow((x + .7) / .4, 2.));
  float b = .075 + .04 * f1(x * 2.2 + 20.) - .02;
  float cella = floor(x * 900.);
  float fil = h1(cella * 1.37);
  b += .018 * pow(fil, 3.) * (.6 + .8 * n1(x * 14.));
  return b;
}

// Cipressi e alberi tondi lungo una cresta. Restituisce copertura 0..1.
float alberi(int i, vec2 p, float passo, float dens, float alt, float px) {
  float cov = 0.;
  float c0 = floor(p.x / passo);
  for (int k = -2; k <= 2; k++) {
    float c = c0 + float(k);
    float hh = h1(c * 3.17 + float(i) * 19.);
    if (hh > dens) continue;
    float tx = (c + .2 + .6 * h1(c * 7.3 + float(i))) * passo;
    float base = cresta(i, tx) - alt * .12;
    float tipo = h1(c * 1.91 + float(i) * 5.);
    if (tipo < .55) {
      // cipresso
      float H = alt * (.75 + .5 * h1(c * 4.1));
      float t = (p.y - base) / H;
      if (t < 0. || t > 1.) continue;
      float W = H * .14 * pow(1. - t, .75) * smoothstep(-.05, .25, t);
      W *= .85 + .3 * n1(p.y / H * 18. + c);
      cov = max(cov, smoothstep(W + px, W - px, abs(p.x - tx)));
    } else {
      // olivo o quercia: chioma irregolare
      float R = alt * (.22 + .12 * h1(c * 9.2));
      vec2 cc = vec2(tx, base + alt * .1 + R * .7);
      vec2 d = (p - cc) / vec2(1.25, 1.);
      float a = atan(d.y, d.x);
      float r = R * (.82 + .3 * f2(vec2(a * 2., c)));
      float chioma = smoothstep(r + px, r - px, length(d));
      float tronco = step(abs(p.x - tx), alt * .012) * step(base, p.y) * step(p.y, cc.y);
      cov = max(cov, max(chioma, tronco));
    }
  }
  return cov;
}

vec3 cielo(vec2 p) {
  float t = clamp((p.y - .42) / .58, 0., 1.);
  vec3 c = mix(uSkyHor, uSkyTop, smoothstep(0., 1., pow(t, .55)));
  vec2 d = p - uSun.xy;
  float dist = length(d * vec2(.75, 1.));
  c += uSunCol * uBloom * (exp(-dist * 7.) * .28 + exp(-dist * 26.) * .45);
  if (uSun.z > 0.) c = mix(c, uSunCol * 1.3 + .1, smoothstep(uSun.z * 1.08, uSun.z * .92, length(d)));
  // velature di nuvole, allungate
  float nv = f2(vec2(p.x * 1.4 + 3., p.y * 11.)) * smoothstep(.5, .64, p.y) * smoothstep(1., .72, p.y);
  nv = smoothstep(.46, .8, nv) * uClouds;
  vec3 colN = mix(mix(uSkyHor, uSkyTop, .35), uSunCol, exp(-dist * 2.8) * .7);
  c = mix(c, colN, nv * .55);
  // stelle
  if (uStars > 0.) {
    vec2 g = floor(gl_FragCoord.xy / 1.5);
    float s = h2(g + 71.);
    float st = smoothstep(.9972, 1., s) * (.35 + .65 * h2(g * 1.7 + 3.)) * smoothstep(.48, .8, p.y);
    float via = smoothstep(.55, .9, f2(p * vec2(3., 6.) + 9.)) * smoothstep(.55, .95, p.y);
    c += vec3(.95, .93, .88) * st * uStars * 1.4;
    c += vec3(.5, .52, .58) * via * uStars * .05;
  }
  // luna
  if (uMoon > 0.) {
    vec2 mp = vec2(-.5, .78);
    float md = length(p - mp);
    c += vec3(.62, .64, .68) * uMoon * (exp(-md * 7.) * .16 + exp(-md * 26.) * .2);
    float disco = smoothstep(.024, .0225, md);
    float cr = .84 + .16 * f2((p - mp) * 110. + 4.);
    c = mix(c, vec3(.95, .93, .87) * cr, disco * uMoon);
  }
  return c;
}

// Rilievo dei versanti: piccole ondulazioni illuminate dal lato del sole.
float rilievo(int i, vec2 p, float r) {
  vec2 u = vec2(p.x * 9., (r - p.y) * 26.) + float(i) * 13.;
  float a = f2(u);
  float gx = f2(u + vec2(.04, 0.)) - a;
  float gy = f2(u + vec2(0., .04)) - a;
  float lato = clamp((uSun.x - p.x) * 3., -1., 1.);
  return clamp(.5 + (gx * lato * 9. - gy * 6.), 0., 1.);
}

vec3 strato(int i, vec2 p, float r) {
  float d = float(i) / 4.;
  vec3 c = mix(uFar, uNear, pow(d, .85));
  // campi: toppe di colore come le colline coltivate
  float campi = f2(vec2(p.x * 12. + float(i) * 7., (r - p.y) * 30.));
  float toppe = floor(campi * 5.) / 5.;
  c *= .88 + .24 * mix(campi, toppe, .7) * (1. - d * .3);
  // volume dei versanti
  float sh = rilievo(i, p, r);
  c *= mix(1., .72 + .5 * sh, (.6 + uDay * .4) * mix(.25, 1., d));
  // luce radente
  c = mix(c, uLit, uDay * .3 * smoothstep(.45, .85, sh) * smoothstep(.3, .7, f2(vec2(p.x * 5., p.y * 9.) + float(i))) * d * (1. - d * .5) * 1.6);
  if (i == 4) c *= .5;
  // oliveti a filari sui versanti di mezzo
  if (i == 2 || i == 3) {
    float scala = i == 2 ? 1. : 1.9;
    vec2 g = vec2(p.x * 260. / scala, (r - p.y) * 520. / scala);
    vec2 cel = floor(g);
    vec2 fr = fract(g) - .5;
    float zona = smoothstep(.55, .7, f2(vec2(p.x * 5., (r - p.y) * 9.) + float(i) * 3.)) * smoothstep(r - .006, r - .02, p.y);
    float punto = smoothstep(.36, .2, length(fr * vec2(1., 1.6))) * step(.25, h2(cel));
    c = mix(c, c * .58, punto * zona);
  }
  // filari di vigna sul versante vicino
  if (i == 3) {
    float s = (r - p.y) * 70. + p.x * 14. + 2. * n1(p.x * 6.);
    float filare = smoothstep(.22, .5, abs(fract(s) - .5)) * (.7 + .3 * n1(p.x * 60.));
    float zona = smoothstep(-.6, -.35, p.x) * smoothstep(.55, .3, p.x) * smoothstep(r - .004, r - .03, p.y);
    c *= 1. - filare * zona * .25;
  }
  // nebbia di valle e foschia
  float nebbia = smoothstep(r - .004, r - .1 - .1 * (1. - d), p.y);
  c = mix(c, uFog, nebbia * mix(.6, .04, d));
  c = mix(c, uFog, uHaze * pow(1. - d, 1.6));
  // orlo di luce in controluce
  float orlo = smoothstep(r - .0045 * (1. + d * 2.), r, p.y);
  c = mix(c, uSunCol * 1.1, orlo * uBloom * .55 * exp(-abs(p.x - uSun.x) * 2.5) * (1. - d * .6));
  return c;
}

vec3 borgo(vec2 p, vec3 base, float px, inout float glow, out float copertura) {
  float suolo = cresta(2, BX) - .006;
  vec3 c = base;
  float edifici[18] = float[18](
    -.052, .026, .016,
    -.03, .024, .026,
    -.008, .03, .02,
    .013, .009, .046,
    .028, .028, .022,
    .052, .03, .014);
  float cov = 0.;
  vec3 col = base;
  for (int k = 0; k < 6; k++) {
    float ox = BX + edifici[k * 3];
    float w = edifici[k * 3 + 1];
    float h = edifici[k * 3 + 2];
    float dx = p.x - ox;
    float tetto = (k == 3) ? .003 : .007 * (1. - abs(dx) / (w * .5 + .002));
    float top = suolo + h + tetto;
    float dentro = smoothstep(w * .5 + px, w * .5 - px, abs(dx)) * smoothstep(top + px, top - px, p.y) * smoothstep(cresta(2, p.x) - .004 - px, cresta(2, p.x) - .004 + px, p.y);
    if (dentro <= 0.) continue;
    float lato = smoothstep(-.3, .3, dx / w) ; // facciata in luce a sinistra (sole a ovest)
    vec3 pietra = mix(uLit * .8, uLit * .52, lato) * mix(1., .5, 1. - uDay) * (.94 + .1 * h1(float(k) * 3.3));
    pietra = mix(pietra, base, .45 + .4 * (1. - uDay));
    float sottotetto = smoothstep(top - .003, top - .0015, p.y);
    pietra *= 1. - sottotetto * .35;
    // finestre
    vec2 fw = vec2((dx + w * .5) / .0055, (p.y - suolo) / .0075);
    vec2 cel = floor(fw);
    vec2 fr = fract(fw);
    float fin = step(.32, fr.x) * step(fr.x, .68) * step(.25, fr.y) * step(fr.y, .78);
    fin *= step(.9, fw.y) * step(fw.y, (h / .0075) - .6) * step(.8, fw.x) * step(fw.x, w / .0055 - .6);
    float accesa = step(.38, h2(cel + float(k) * 13.));
    pietra = mix(pietra, vec3(1., .74, .42) * 1.15, fin * accesa * uWindows);
    pietra = mix(pietra, pietra * .55, fin * (1. - accesa * uWindows) * .6);
    col = mix(col, pietra, dentro);
    cov = max(cov, dentro);
  }
  glow += uWindows * exp(-length((p - vec2(BX, suolo + .015)) * vec2(1., 1.6)) * 26.) * .5;
  // foschia sul borgo come sul suo strato
  col = mix(col, uFog, uHaze * pow(.5, 1.6) * .8);
  copertura = cov;
  return col;
}

vec3 luminarie(vec2 p, vec3 c, float px) {
  // due fili di lampadine: uno vicino e sfocato in alto, uno a fuoco sopra i tavoli
  for (int s = 0; s < 2; s++) {
    float fs = float(s);
    vec2 a = s == 0 ? vec2(-1.3, .9) : vec2(-1.2, .7);
    vec2 b = s == 0 ? vec2(1.5, .84) : vec2(1.3, .64);
    float sag = s == 0 ? .1 : .045;
    float passi = s == 0 ? 34. : 52.;
    float raggio = s == 0 ? .0075 : .0036;
    float t = clamp((p.x - a.x) / (b.x - a.x), 0., 1.);
    float yf = mix(a.y, b.y, t) - sag * 4. * t * (1. - t);
    c = mix(c, c * .35, smoothstep(px * (1.3 + (1. - fs) * .8), 0., abs(p.y - yf)) * .8);
    // l'aria scaldata dalle lampadine
    c += vec3(1., .7, .4) * uStrings * .05 * exp(-abs(p.y - yf + .02) * 14.);
    float k0 = floor(t * passi);
    for (int j = -1; j <= 1; j++) {
      float kk = k0 + float(j);
      float tk = (kk + .5 + (h1(kk * 5.1 + fs) - .5) * .35) / passi;
      if (tk < 0. || tk > 1.) continue;
      float rk = raggio * (.75 + .5 * h1(kk * 2.7 + fs * 11.));
      vec2 q = vec2(mix(a.x, b.x, tk), mix(a.y, b.y, tk) - sag * 4. * tk * (1. - tk) - rk * .7);
      float d = length((p - q) * vec2(1., s == 0 ? 1. : 1.));
      vec3 lc = mix(vec3(1., .74, .44), vec3(1., .86, .66), h1(kk * 91. + fs));
      float forza = uStrings * (.55 + .45 * h1(kk * 13. + fs * 3.));
      if (s == 2) {
        // bokeh: disco morbido con il bordo appena più luminoso
        float disco = smoothstep(rk, rk * .82, d);
        float bordo = smoothstep(rk * .6, rk * .9, d) * disco;
        c = mix(c, c + lc * forza * .5, disco * .35);
        c += lc * forza * (bordo * .03 + exp(-d / (rk * 1.3)) * .1);
      } else {
        float nucleo = smoothstep(rk, rk * .2, d);
        c += lc * forza * (nucleo * .9 + exp(-d / (rk * 2.5)) * .45 + exp(-d / (rk * 9.)) * .12);
      }
    }
  }
  return c;
}

// Rami d'olivo in primo piano, fuori fuoco, in un angolo dell'inquadratura.
float ramo(vec2 p, vec2 dove, float scala) {
  vec2 r = (p - dove) / scala;
  float cov = 0.;
  // il ramo: una curva che scende dall'angolo
  for (int b = 0; b < 3; b++) {
    float fb = float(b);
    float y0 = .05 - fb * .22;
    float curva = y0 - .18 * r.x * r.x - .04 * fb * r.x;
    float spess = .012 * (1. - clamp(r.x / 1.3, 0., 1.)) + .003;
    if (r.x > -.1 && r.x < 1.1 - fb * .2) cov = max(cov, smoothstep(spess + .05, spess - .01, abs(r.y - curva)) * .8);
    // foglie strette e lunghe, a coppie lungo il ramo
    for (int k = 0; k < 14; k++) {
      float fk = float(k);
      float t = fk / 13. * (1.05 - fb * .2);
      vec2 att = vec2(t, y0 - .18 * t * t - .04 * fb * t);
      float lato = mod(fk, 2.) * 2. - 1.;
      float ang = -.6 + lato * (.6 + .9 * h1(fk + fb * 7.)) - t * .7 + (h1(fk * 9.1 + fb) - .5) * .8;
      float L = .13 * (.7 + .5 * h1(fk * 3. + fb));
      vec2 dir = vec2(cos(ang), sin(ang));
      vec2 q = r - att;
      float u = dot(q, dir);
      float v = dot(q, vec2(-dir.y, dir.x));
      float w = .018 * sin(clamp(u / L, 0., 1.) * 3.14159);
      float foglia = smoothstep(-.05, .02, u) * smoothstep(L + .05, L - .02, u) * smoothstep(w + .055, w - .015, abs(v));
      cov = max(cov, foglia);
    }
  }
  return cov;
}

// Per la hero a piani: 0 tutto, 1 cielo e lontananze, 2 colle e borgo, 3 primo piano.
void stendi(inout vec3 c, inout float a, vec3 col, float cov, bool vivo) {
  if (!vivo) return;
  c = a < .002 ? col : mix(c, col, cov);
  a = max(a, cov);
}

void main() {
  vec2 q = gl_FragCoord.xy / uRes;
  float px = 1.2 / uRes.y * uZoom;
  vec2 p = vec2(uCx + (gl_FragCoord.x - uRes.x * .5) / uRes.y * uZoom, uCy + (q.y - .5) * uZoom);
  int S = int(uStrato);
  bool dietro = S == 0 || S == 1, mezzo = S == 0 || S == 2, avanti = S == 0 || S == 3;

  vec3 c = vec3(0.);
  float a = 0.;
  stendi(c, a, cielo(p), 1., dietro);
  float glow = 0.;

  float m = monti(p.x);
  if (p.y < m + px) {
    vec3 cm = mix(uFar * .96, uFog, .35 + uHaze * .5);
    float neve = smoothstep(m - .03, m - .006, p.y) * smoothstep(.49, .53, m) * .25;
    cm = mix(cm, uFog * 1.12, neve);
    float orlo = smoothstep(m - .004, m, p.y) * uBloom * exp(-abs(p.x - uSun.x) * 3.) * .7;
    cm = mix(cm, uSunCol, orlo);
    stendi(c, a, cm, smoothstep(m + px, m - px, p.y), dietro);
  }

  for (int i = 0; i < 5; i++) {
    bool vivo = i < 2 ? dietro : (i < 4 ? mezzo : avanti);
    float r = cresta(i, p.x);
    vec3 cs = strato(i, p, r);
    float cop = smoothstep(r + px, r - px, p.y);
    if (i == 1) cop = max(cop, alberi(1, p, .018, .35, .012, px));
    if (i == 2) cop = max(cop, alberi(2, p, .016, .42, .02, px));
    if (i == 3) cop = max(cop, alberi(3, p, .05, .5, .055, px));
    vec3 ombra = cs * (i < 3 ? .86 : .62);
    float soloAlbero = 1. - smoothstep(r + px, r - px, p.y);
    stendi(c, a, mix(cs, ombra, soloAlbero), cop, vivo);
    if (i == 2 && mezzo) {
      float cb;
      vec3 colB = borgo(p, c, px, glow, cb);
      stendi(c, a, colB, cb, true);
      // cipressi accanto al borgo
      for (int k = 0; k < 4; k++) {
        float tx = BX + vec4(-.078, -.066, .078, .09)[k];
        float H = vec4(.06, .048, .055, .042)[k];
        float base = cresta(2, tx) - .004;
        float t = (p.y - base) / H;
        if (t > 0. && t < 1.) {
          float W = H * .12 * pow(1. - t, .8) * smoothstep(-.05, .2, t) * (.85 + .3 * n1(t * 20. + float(k)));
          float cc = smoothstep(W + px, W - px, abs(p.x - tx));
          stendi(c, a, mix(uFar, uNear, .5) * .55, cc, true);
        }
      }
    }
  }

  if (mezzo) c += vec3(1., .72, .4) * glow;
  // luce del sole che "bagna" l'aria (bloom fotografico)
  float ds = length((p - uSun.xy) * vec2(.7, 1.));
  c += uSunCol * uBloom * exp(-ds * 4.) * .16 * a;

  if (uStrings > 0. && avanti) {
    vec3 c0 = c;
    c = luminarie(p, S == 0 ? c : vec3(0.), px);
    if (S != 0) { float l = max(c.r, max(c.g, c.b)); c = a > .002 ? c0 + c : c / max(l, .001); a = max(a, clamp(l, 0., 1.)); }
  }
  if (uRamo > 0. && avanti) {
    float rm = ramo(p, vec2(uCx - uRes.x / uRes.y * .5 * uZoom - .04, 1.04), .55);
    stendi(c, a, uNear * .42 + uSunCol * .06, rm * uRamo, true);
  }

  o = vec4(finitura(c, q, uGrain), S == 0 ? 1. : a);
}
`;

/* ------------------------------------------------------------------
   IL VIALE: due file di cipressi, ghiaia, ombre lunghe del tardo pomeriggio.
   ------------------------------------------------------------------ */
const viale = comune + /* glsl */ `
uniform float uZoom, uCy, uStrato, uGrain;

const float HZ = .56;      // orizzonte sullo schermo
const float F = 1.15;      // focale
const float HC = 1.65;     // altezza dell'occhio
const vec2 SOLE = normalize(vec2(.85, -.55)); // direzione delle ombre sul terreno (x, z)

vec3 cieloV(vec2 p) {
  float t = clamp((p.y - HZ) / (1. - HZ), 0., 1.);
  vec3 c = mix(vec3(.93, .86, .72), vec3(.66, .72, .74), pow(t, .7));
  c += vec3(1., .82, .55) * exp(-length((p - vec2(-.55, .62)) * vec2(.6, 1.)) * 3.) * .35;
  return c;
}

// Profilo di un cipresso alto H con base a terra in (X, Z).
float cipresso(vec2 p, float X, float Z, float H, float R, float seme, out float lato) {
  float xs = X * F / Z;
  float yb = HZ - HC * F / Z;
  float ht = H * F / Z;
  float t = (p.y - yb) / ht;
  lato = 0.;
  if (t < -.012 || t > 1.) return 0.;
  float px = 1.2 / 1000.;
  if (t < .008) {
    // il tronco, appena visibile sotto la chioma
    float wt = R * F / Z * .09;
    lato = 2.;
    return smoothstep(wt + px, wt - px, abs(p.x - xs));
  }
  float w = R * F / Z * pow(max(1. - t, 0.), .72) * mix(.25, 1., sqrt(smoothstep(.0, .14, t)));
  w *= .8 + .3 * f1(p.y / ht * 26. + seme * 13.) + .08 * n1(p.y / ht * 110. + seme);
  lato = (p.x - xs) / max(w, 1e-4);
  return smoothstep(w + px, w - px, abs(p.x - xs));
}

void main() {
  vec2 q = gl_FragCoord.xy / uRes;
  vec2 p = vec2((gl_FragCoord.x - uRes.x * .5) / uRes.y * uZoom + uCx, uCy + (q.y - .5) * uZoom);
  vec3 c = cieloV(p);
  vec3 nebbia = vec3(.86, .8, .68);

  // colline lontane oltre la fine del viale
  float colline = HZ + .018 + .02 * f1(p.x * 4. + 2.) + .015 * exp(-pow((p.x + .5) / .25, 2.));
  if (p.y < colline) c = mix(c, mix(vec3(.62, .62, .55), nebbia, .55), smoothstep(colline + .002, colline - .002, p.y));

  if (p.y < HZ) {
    float Z = HC * F / (HZ - p.y);
    float X = p.x * Z / F;
    // prato e ghiaia
    float trama = f2(vec2(X * 3., Z * 1.2));
    vec3 prato = mix(vec3(.36, .38, .22), vec3(.5, .5, .3), trama);
    prato *= .92 + .1 * sin(X * 1.6);
    vec3 ghiaia = mix(vec3(.86, .8, .68), vec3(.74, .67, .55), f2(vec2(X * 18., Z * 7.)));
    float bordo = smoothstep(1.35, 1.25, abs(X));
    vec3 terra = mix(prato, ghiaia, bordo);
    // ombre dei cipressi sul terreno
    float ombra = 0.;
    for (int k = 0; k < 22; k++) {
      for (int s = 0; s < 2; s++) {
        float TX = (s == 0 ? -3.3 : 3.3);
        float TZ = 3. + float(k) * 6.2;
        vec2 rel = vec2(X - TX, Z - TZ);
        float lungo = dot(rel, SOLE);
        float largo = abs(dot(rel, vec2(-SOLE.y, SOLE.x)));
        float L = 15.;
        float wid = .95 * pow(max(1. - lungo / L, 0.), .7);
        ombra = max(ombra, step(0., lungo) * smoothstep(wid + .25, wid - .1, largo) * step(lungo, L));
      }
    }
    vec3 luce = vec3(1.08, .98, .82);
    terra = mix(terra * luce, terra * vec3(.55, .58, .6), ombra * .85);
    float lontano = 1. - exp(-Z / 70.);
    c = mix(terra, nebbia, lontano);
  }

  // cipressi, dal fondo verso l'occhio
  for (int k = 21; k >= 0; k--) {
    for (int s = 0; s < 2; s++) {
      float TX = (s == 0 ? -3.3 : 3.3);
      float TZ = 3. + float(k) * 6.2;
      float seme = float(k * 2 + s);
      float H = 10.5 + 2.5 * h1(seme * 3.1);
      float lato;
      float cop = cipresso(p, TX + (h1(seme) - .5) * .3, TZ, H, .85 + .2 * h1(seme * 5.), seme, lato);
      if (cop <= 0.) continue;
      float fronda = f2(vec2(lato * 2.2 + seme, p.y * 260. / TZ * 6.));
      float ciuffi = smoothstep(.35, .75, f2(vec2(lato * 5. + seme * 3., p.y * 160. / TZ * 6.)));
      vec3 verde = mix(vec3(.1, .125, .075), vec3(.3, .32, .18), clamp(smoothstep(.5, -1., lato) * .85 + fronda * .35 - ciuffi * .25, 0., 1.));
      verde += vec3(.9, .7, .4) * .14 * smoothstep(-.2, -1., lato) * (.6 + .4 * ciuffi);
      if (lato > 1.5) verde = vec3(.16, .12, .08);
      float lontano = 1. - exp(-TZ / 70.);
      c = mix(c, mix(verde, nebbia, lontano), cop);
    }
  }

  o = vec4(finitura(c, q, uGrain), 1.);
}
`;

/* ------------------------------------------------------------------
   LUCI: lampadine sfocate nel buio, per la festa e per la sala.
   ------------------------------------------------------------------ */
const luci = comune + /* glsl */ `
uniform float uZoom, uCy, uGrain;
void main() {
  vec2 q = gl_FragCoord.xy / uRes;
  vec2 p = vec2((gl_FragCoord.x - uRes.x * .5) / uRes.y * uZoom + uCx, uCy + (q.y - .5) * uZoom);
  vec3 c = mix(vec3(.035, .03, .03), vec3(.1, .075, .055), smoothstep(1., .2, p.y));
  // tre piani di lampadine, sempre più sfocate verso l'occhio
  for (int piano = 0; piano < 3; piano++) {
    float fp = float(piano);
    float r = mix(.012, .085, fp / 2.);
    float y0 = mix(.72, .58, fp / 2.);
    float sag = mix(.08, .22, fp / 2.);
    float passo = mix(.06, .21, fp / 2.);
    float k0 = floor(p.x / passo);
    for (int j = -2; j <= 2; j++) {
      float k = k0 + float(j);
      float x = (k + .5 + (h1(k * 3.1 + fp) - .5) * .4) * passo;
      float y = y0 - sag * (1. - pow(x / 1.2, 2.)) + (fp - 1.) * .12 * sin(x * 2.);
      float rk = r * (.8 + .4 * h1(k * 7.3 + fp * 5.));
      float d = length(p - vec2(x, y));
      vec3 lc = mix(vec3(1., .66, .34), vec3(1., .85, .62), h1(k * 1.7 + fp));
      float forza = mix(1.4, .32, fp / 2.) * (.6 + .4 * h1(k * 9.1 + fp));
      if (piano == 0) {
        c += lc * forza * (smoothstep(rk, rk * .3, d) * .9 + exp(-d / (rk * 3.)) * .25);
      } else {
        float disco = smoothstep(rk, rk * .88, d);
        float bordo = smoothstep(rk * .55, rk * .95, d) * disco;
        c += lc * forza * (disco * .5 + bordo * .18);
      }
    }
  }
  o = vec4(finitura(c, q, uGrain), 1.);
}
`;

/* ------------------------------------------------------------------
   IL LINO: lenzuola stropicciate nella luce del mattino, con l'ombra
   della finestra. Per la suite.
   ------------------------------------------------------------------ */
const lino = comune + /* glsl */ `
uniform float uZoom, uCy, uGrain;
float pieghe(vec2 p) {
  float h = 0.;
  h += .5 * sin(p.x * 3.1 + 1.5 * f2(p * .8)) * .5;
  h += .3 * sin((p.x * .6 + p.y * 1.4) * 4.2 + 2. * f2(p * 1.3 + 4.));
  h += .06 * f2(p * 1.6);
  return h;
}
void main() {
  vec2 q = gl_FragCoord.xy / uRes;
  vec2 p = vec2((gl_FragCoord.x - uRes.x * .5) / uRes.y * uZoom + uCx, uCy + (q.y - .5) * uZoom) * 2.2;
  float e = .004;
  float h = pieghe(p);
  vec2 g = vec2(pieghe(p + vec2(e, 0.)) - h, pieghe(p + vec2(0., e)) - h) / e;
  vec3 n = normalize(vec3(-g * .22, 1.));
  vec3 l = normalize(vec3(-.6, .5, .62));
  float dif = clamp(dot(n, l), 0., 1.);
  float occl = .75 + .25 * smoothstep(-.6, .6, h);
  // ombra della finestra: quattro riquadri, bordi morbidi
  vec2 f = (p - vec2(-.2, .3)) * mat2(.92, .38, -.38, .92);
  vec2 cel = abs(fract(f * vec2(.9, .65)) - .5);
  float vetri = smoothstep(.43, .38, max(cel.x, cel.y)) * step(abs(f.x), 1.6) * step(abs(f.y), 2.);
  float luce = mix(.42, 1., vetri * (.85 + .15 * dif));
  vec3 caldo = vec3(1., .93, .82);
  vec3 c = vec3(.94, .92, .88) * (.35 + .75 * dif * luce) * occl * mix(vec3(.82, .84, .88), caldo, luce);
  o = vec4(finitura(c, q, uGrain), 1.);
}
`;

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/* Le ore del giorno. Colori scelti a mano, non fisici. */
const ore = {
  cerimonia: { // 17:00, luce alta e velata
    uSkyTop: '#9FB0B8', uSkyHor: '#E9E2D2', uSunCol: '#FFF1D6', uFog: '#DCD6C6', uFar: '#A9AFA2', uNear: '#4C5638', uLit: '#F2E6C8',
    uSun: [-.05, .84, .016], uBloom: .5, uStars: 0, uMoon: 0, uWindows: 0, uStrings: 0, uHaze: .5, uDay: 1, uClouds: .5, uGrain: .05, uRamo: .8,
  },
  aperitivo: { // 19:00, ora dorata
    uSkyTop: '#8E9CA0', uSkyHor: '#F0D9AE', uSunCol: '#FFD08A', uFog: '#E3CDA4', uFar: '#A79F86', uNear: '#46482C', uLit: '#F6D79E',
    uSun: [-.12, .53, .018], uBloom: .85, uStars: 0, uMoon: 0, uWindows: .15, uStrings: 0, uHaze: .5, uDay: .9, uClouds: .6, uGrain: .055, uRamo: 0,
  },
  ricevimento: { // 20:30, dopo il tramonto
    uSkyTop: '#2C3644', uSkyHor: '#C99A7C', uSunCol: '#D88E62', uFog: '#857A76', uFar: '#4F5158', uNear: '#1C2018', uLit: '#A88A74',
    uSun: [-.16, .41, 0], uBloom: .32, uStars: .1, uMoon: 0, uWindows: .9, uStrings: 0, uHaze: .45, uDay: .25, uClouds: .55, uGrain: .06,
  },
  festa: { // 22:30, le luci accese
    uSkyTop: '#0E131B', uSkyHor: '#2C303A', uSunCol: '#4A4244', uFog: '#2E3138', uFar: '#22252B', uNear: '#0B0D0A', uLit: '#4A4540',
    uSun: [-.16, .3, 0], uBloom: .12, uStars: .55, uMoon: 0, uWindows: 1.2, uStrings: 1, uHaze: .35, uDay: 0, uClouds: .25, uGrain: .07,
  },
  notte: { // 02:00, la luna sul Gran Sasso
    uSkyTop: '#070A10', uSkyHor: '#1C2330', uSunCol: '#4A5260', uFog: '#262D39', uFar: '#1A1F27', uNear: '#070908', uLit: '#3A3F48',
    uSun: [-.5, .78, 0], uBloom: .12, uStars: 1, uMoon: 1, uWindows: .55, uStrings: 0, uHaze: .3, uDay: 0, uClouds: .35, uGrain: .07,
  },
};

const scene = Object.fromEntries(Object.entries(ore).map(([k, v]) => [k, { frag: colle, uniforms: v, cx: .2 }]));
scene.viale = { frag: viale, uniforms: { uGrain: .05 }, cx: 0 };
scene.luci = { frag: luci, uniforms: { uGrain: .06 }, cx: 0 };
scene.lino = { frag: lino, uniforms: { uGrain: .04 }, cx: 0 };

const vert = `#version 300 es
in vec2 a; void main() { gl_Position = vec4(a, 0., 1.); }`;

export function dipingi(nome, w, h, { cx, cy = .5, zoom = 1, strato = 0, vig = 1 } = {}) {
  const scena = scene[nome];
  if (!scena) throw new Error(`Tavola sconosciuta: ${nome}`);
  const tela = document.createElement('canvas');
  tela.width = w;
  tela.height = h;
  const gl = tela.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, alpha: true });
  const prog = gl.createProgram();
  for (const [tipo, src] of [[gl.VERTEX_SHADER, vert], [gl.FRAGMENT_SHADER, scena.frag]]) {
    const sh = gl.createShader(tipo);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const set = (k, v) => {
    const u = gl.getUniformLocation(prog, k);
    if (!u) return;
    if (typeof v === 'string') gl.uniform3fv(u, rgb(v));
    else if (Array.isArray(v)) gl[`uniform${v.length}fv`](u, v);
    else gl.uniform1f(u, v);
  };
  set('uRes', [w, h]);
  set('uCx', Number.isFinite(cx) ? cx : scena.cx);
  set('uCy', cy);
  set('uZoom', zoom);
  set('uStrato', strato);
  set('uVig', strato ? 0 : vig);
  for (const [k, v] of Object.entries(scena.uniforms)) set(k, v);
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return tela;
}

export const nomi = Object.keys(scene);
