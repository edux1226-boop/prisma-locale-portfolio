/* Lastre provvisorie dell'anteprima Vecchia Marina.

   Non sono fotografie: sono studi generati con uno shader, nella luce
   dell'Adriatico, da sostituire con gli scatti veri del ristorante.
   Il riferimento è la fotografia di mare in pellicola (orizzonti fermi,
   lunghe esposizioni, macro della materia), non l'illustrazione.

   Il mare è un unico modello fisico (onde, Fresnel, riflesso del cielo e
   del sole) inquadrato da altezze e ore diverse. Più la battigia,
   vista dall'alto. Niente piatti né cibo finti: per quelli servono le
   fotografie vere (vedi le tavole tipografiche nella pagina). */

const comune = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uSeed, uGrana, uVig;
out vec4 o;

#define PI 3.14159265

float h1(float n) { return fract(sin(n * 127.1 + uSeed) * 43758.5453); }
float h2(vec2 p) { vec3 q = fract(vec3(p.xyx) * .1031 + uSeed * .013); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 h22(vec2 p) { return vec2(h2(p), h2(p + 19.19)); }
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++) { s += a * n2(p); p = m * p; a *= .5; } return s; }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Voronoi: distanza dal punto più vicino, dal bordo, e id della cella.
vec3 voro(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float d1 = 9., d2 = 9.; vec2 id = vec2(0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(x, y); vec2 c = g + h22(i + g) * .9 + .05 - f;
    float d = dot(c, c);
    if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d;
  }
  return vec3(sqrt(d1), sqrt(d2) - sqrt(d1), h2(id));
}

// Sviluppo: curva morbida sulle luci, neri freddi sollevati, grana d'argento.
vec3 sviluppo(vec3 c, vec2 q) {
  c = c / (1. + c * .55) * 1.4;
  vec2 v = q - .5;
  c *= 1. - dot(v, v) * .7 * uVig;
  c = mix(vec3(.028, .04, .048), vec3(.975, .968, .95), clamp(c, 0., 1.));
  float lum = dot(c, vec3(.3, .55, .15));
  float g = (h2(gl_FragCoord.xy * 1.003) + h2(gl_FragCoord.xy * .5 + 7.) * .6 - .8);
  c += g * uGrana * (.35 + lum * (1. - lum) * 2.2);
  return clamp(c, 0., 1.);
}
`;

/* ------------------------------------------------------------------
   IL MARE: superficie fisica, ripresa da quote e ore diverse.
   ------------------------------------------------------------------ */
const mare = comune + /* glsl */ `
uniform vec3 uSun, uSkyTop, uSkyHor, uSunCol, uDeep, uLit;
uniform float uCamH, uPitch, uFov, uCalma, uFoschia, uLampare, uDisco, uStelle, uOnde, uGlitter;

float onde(vec2 p, float fp) {
  float h = 0.;
  float k = .12, a = .5;
  vec2 vento = normalize(vec2(.25, 1.));
  for (int i = 0; i < 40; i++) {
    float fi = float(i);
    vec2 d = rot((h1(fi) - .5) * 1.9) * vento;
    float x = dot(p, d) * k + h1(fi + 9.) * 6.283 + n2(p * k * .25 + fi) * 1.4;
    float w = pow(sin(x) * .5 + .5, 1.6) - .4;   // creste appena più strette dei cavi
    float filtro = clamp(1.6 - k * fp * 5., 0., 1.);
    filtro *= 1. - smoothstep(uCalma * .55, uCalma, k);
    h += a * w * filtro;
    k *= 1.19; a *= .84;
  }
  // increspature capillari, solo dove l'occhio le può vedere
  h += .05 * (fbm(p * 2.2) - .5) * clamp(1. - fp * 4., 0., 1.) * (1. - smoothstep(uCalma * .4, uCalma, 6.));
  return h * uOnde;
}

vec3 cielo(vec3 d) {
  float t = max(d.y, 0.);
  vec3 c = mix(uSkyHor, uSkyTop, pow(t, .42));
  float s = max(dot(d, uSun), 0.);
  c += uSunCol * (pow(s, 5000.) * 26. * uDisco + pow(s, 700.) * .7 * uDisco + pow(s, 12.) * .22 + pow(s, 2.) * .07);
  // foschia sull'orizzonte
  c = mix(c, uSkyHor * 1.04, exp(-t * 22.) * uFoschia);
  // stelle, solo se chieste
  if (uStelle > 0.) {
    vec2 sp = d.xy / max(d.z, .2) * 420.;
    float st = step(.9965, h2(floor(sp))) * smoothstep(.02, .2, t);
    c += st * uStelle * h2(floor(sp) + 3.);
  }
  // le lampare: barche da pesca sull'orizzonte
  if (uLampare > 0.) {
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float az = (h1(fi + 40.) - .5) * 1.2;
      vec2 q = vec2(atan(d.x, d.z) - az, d.y - .0016 - h1(fi + 3.) * .0012);
      float r = length(q * vec2(1., 1.6));
      float forza = .4 + h1(fi + 17.) * .8;
      c += vec3(1., .88, .66) * uLampare * forza * (exp(-r * 2600.) * 6. + exp(-r * 260.) * .1);
    }
  }
  return c;
}

void main() {
  vec3 col = vec3(0);
  float pixAng = uFov / uRes.y;
  for (int sy = 0; sy < 2; sy++) for (int sx = 0; sx < 2; sx++) {
    vec2 fc = gl_FragCoord.xy + (vec2(sx, sy) + .5) / 2. - .5;
    vec2 uv = (fc - .5 * uRes) / uRes.y;
    vec3 d = normalize(vec3(uv * uFov, 1.));
    d.yz = rot(-uPitch) * d.yz;
    vec3 c;
    if (d.y >= -.0004) {
      c = cielo(d);
    } else {
      float t = uCamH / -d.y;
      vec2 p = vec2(d.x, d.z) * t;
      float fp = t * pixAng / sqrt(max(-d.y, .004));
      float e = max(.02, fp * .7);
      float h0 = onde(p, fp);
      vec3 n = normalize(vec3(-(onde(p + vec2(e, 0), fp) - h0) / e, 1., -(onde(p + vec2(0, e), fp) - h0) / e));
      n = normalize(mix(n, vec3(0, 1, 0), smoothstep(.0, 1., fp * .08)));
      vec3 r = reflect(d, n);
      r.y = abs(r.y);
      float fres = .02 + .98 * pow(1. - max(dot(n, -d), 0.), 5.);
      vec3 corpo = mix(uDeep, uLit, clamp(h0 * .9 + .25, 0., 1.) * .5 + max(dot(n, uSun), 0.) * .15);
      c = mix(corpo, cielo(r), fres);
      // scintille: il sole spezzato dalle onde
      float s = max(dot(r, uSun), 0.);
      c += uSunCol * pow(s, 900.) * 14. * uGlitter;
      // lontananza: l'acqua sfuma nella foschia dell'orizzonte
      float lont = 1. - exp(-t * .0016 * uFoschia);
      c = mix(c, cielo(normalize(vec3(d.x, .0005, d.z))) * .96, lont * .85);
    }
    col += c;
  }
  col /= 4.;
  o = vec4(sviluppo(col, gl_FragCoord.xy / uRes), 1.);
}
`;

/* ------------------------------------------------------------------
   LA BATTIGIA, vista dall'alto: sabbia asciutta, sabbia bagnata, il velo
   d'acqua che si ritira e il pizzo di schiuma.
   ------------------------------------------------------------------ */
const battigia = comune + /* glsl */ `
uniform float uRiva;
void main() {
  vec2 q = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / uRes.y * 3.;   // metri
  p = rot(-.18) * p;
  float riva = uRiva + .35 * fbm(vec2(p.y * .5, 3.)) + .1 * sin(p.y * 1.3);
  float x = p.x - riva;                       // < 0 acqua, > 0 sabbia
  float grana = fbm(p * 90.) * .6 + h2(gl_FragCoord.xy) * .4;
  vec3 asciutta = vec3(.80, .74, .63) * (.86 + grana * .22);
  vec3 bagnata = vec3(.47, .43, .37) * (.9 + grana * .14);
  // la sabbia bagnata si asciuga a chiazze verso la terra
  float umido = 1. - smoothstep(.0, 1.3 + fbm(p * 1.7) * .8, x);
  vec3 sabbia = mix(asciutta, bagnata, umido);
  // increspature lasciate dall'onda
  float inc = sin(p.x * 34. + fbm(p * 3.) * 9.) * .5 + .5;
  sabbia *= 1. - inc * .06 * umido;
  // lucentezza del cielo sulla sabbia bagnata
  sabbia += vec3(.55, .62, .66) * umido * .18 * smoothstep(.2, .9, fbm(p * 2.2 + 4.));
  // piccoli fori di bolle
  vec3 v = voro(p * 28.);
  sabbia *= 1. - smoothstep(.07, .02, v.x) * step(.82, v.z) * .5 * umido;

  // il velo d'acqua
  float prof = clamp(-x * .7, 0., 1.);
  vec3 acqua = mix(sabbia * vec3(.78, .88, .9), vec3(.12, .25, .29), smoothstep(0., 1., prof));
  float onda = fbm(p * vec2(1.4, 3.6) + 9.);
  acqua += vec3(.6, .68, .7) * pow(onda, 3.) * .5 * (1. - prof * .5);
  vec3 c = mix(sabbia, acqua, smoothstep(.0, -.05, x));

  // il pizzo di schiuma: celle sottili lungo il bordo e qualche filo nell'acqua
  vec3 cel = voro(p * vec2(9., 5.) + fbm(p * 4.) * 1.5);
  float filo = smoothstep(.05, .0, cel.y) * .7;
  float bordo = exp(-pow((x + .04) / .06, 2.));
  float dentro = smoothstep(-.1, -.5, x) * smoothstep(-2.4, -.7, x) * smoothstep(.45, .7, fbm(p * vec2(.8, 2.) + 2.));
  float schiuma = clamp(filo * bordo * 1.1 + bordo * .75 * smoothstep(.35, .75, fbm(p * vec2(6., 16.))), 0., 1.);
  c = mix(c, vec3(.96, .96, .93), schiuma * .92);
  c *= 1.0 + .06 * (q.y - .5);
  o = vec4(sviluppo(c * 1.05, q), 1.);
}
`;

/* Ogni lastra: shader e parametri. I colori sono lineari, prima dello sviluppo. */
const v3 = (r, g, b) => [r, g, b];
const sole = (az, el) => {
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
};

export const scene = {
  // la superficie dell'acqua dall'alto, controluce: l'apertura del sito
  superficie: [mare, {
    uSun: sole(4, 24), uSkyTop: v3(.32, .4, .44), uSkyHor: v3(.7, .74, .74), uSunCol: v3(1, .95, .85),
    uDeep: v3(.012, .045, .058), uLit: v3(.04, .14, .16),
    uCamH: 4, uPitch: .5, uFov: .55, uCalma: 12, uFoschia: .3, uLampare: 0, uDisco: 1, uStelle: 0, uOnde: 1.5, uGlitter: 1.2,
    uGrana: .035, uVig: 1,
  }],
  // l'orizzonte all'alba, lunga esposizione: il mare come una lastra
  alba: [mare, {
    uSun: sole(0, 3.2), uSkyTop: v3(.38, .44, .5), uSkyHor: v3(.86, .82, .76), uSunCol: v3(1, .82, .62),
    uDeep: v3(.05, .08, .1), uLit: v3(.1, .15, .17),
    uCamH: 3, uPitch: 0, uFov: .55, uCalma: 1.5, uFoschia: 1, uLampare: 0, uDisco: .35, uStelle: 0, uOnde: .25, uGlitter: .2,
    uGrana: .03, uVig: .6,
  }],
  // mezzogiorno grigio: per la storia e i contatti
  piombo: [mare, {
    uSun: sole(30, 40), uSkyTop: v3(.5, .53, .55), uSkyHor: v3(.74, .75, .74), uSunCol: v3(.5, .5, .48),
    uDeep: v3(.06, .09, .1), uLit: v3(.12, .17, .18),
    uCamH: 2.5, uPitch: .04, uFov: .5, uCalma: 2.2, uFoschia: .9, uLampare: 0, uDisco: 0, uStelle: 0, uOnde: .3, uGlitter: 0,
    uGrana: .03, uVig: .5,
  }],
  // le due di notte: le lampare sull'orizzonte
  notte: [mare, {
    uSun: sole(-20, -12), uSkyTop: v3(.004, .01, .016), uSkyHor: v3(.03, .05, .065), uSunCol: v3(0, 0, 0),
    uDeep: v3(.002, .006, .009), uLit: v3(.006, .016, .02),
    uCamH: 2.2, uPitch: .02, uFov: .5, uCalma: 4, uFoschia: .7, uLampare: 5, uDisco: 0, uStelle: 0, uOnde: .3, uGlitter: 0,
    uGrana: .045, uVig: .8,
  }],
  battigia: [battigia, { uRiva: -.2, uGrana: .03, uVig: .5 }],
  // la sera: il sole è alle spalle, dietro la collina; il mare prende il rosa
  sera: [mare, {
    uSun: sole(180, 2), uSkyTop: v3(.3, .33, .42), uSkyHor: v3(.78, .66, .64), uSunCol: v3(0, 0, 0),
    uDeep: v3(.06, .07, .1), uLit: v3(.12, .12, .16),
    uCamH: 2.6, uPitch: .03, uFov: .5, uCalma: 2.4, uFoschia: .8, uLampare: 0, uDisco: 0, uStelle: 0, uOnde: .32, uGlitter: 0,
    uGrana: .03, uVig: .6, uSeed: 7,
  }],
  // la risacca a pelo d'acqua, controluce
  risacca: [mare, {
    uSun: sole(-6, 19), uSkyTop: v3(.42, .48, .52), uSkyHor: v3(.82, .8, .76), uSunCol: v3(1, .9, .74),
    uDeep: v3(.02, .06, .07), uLit: v3(.07, .17, .18),
    uCamH: .55, uPitch: .05, uFov: .5, uCalma: 8, uFoschia: .9, uLampare: 0, uDisco: .8, uStelle: 0, uOnde: 1.1, uGlitter: 1,
    uGrana: .035, uVig: .7, uSeed: 11,
  }],
};

export function dipingi(nome, w, h, extra = {}) {
  const [frag, par] = scene[nome];
  const tela = document.createElement('canvas');
  tela.width = w; tela.height = h;
  const gl = tela.getContext('webgl2', { preserveDrawingBuffer: true });
  const sh = (tipo, src) => {
    const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tutti = { uRes: [w, h], uSeed: 1, ...par, ...extra };
  for (const [k, v] of Object.entries(tutti)) {
    const loc = gl.getUniformLocation(prog, k);
    if (!loc) continue;
    if (Array.isArray(v)) gl[`uniform${v.length}fv`](loc, v);
    else gl.uniform1f(loc, v);
  }
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return tela;
}

export const nomi = Object.keys(scene);
