/* Lo specchio: un pelo d'acqua vivo, controluce, dietro "In tavola".
   È lo stesso modello di mare delle lastre (dev/marina/lastre.js),
   ridotto all'osso e messo in movimento: niente three.js, un solo
   triangolo e uno shader. Mezza risoluzione, 30 fotogrammi al secondo,
   fermo quando la sezione non si vede o la scheda è nascosta.
   L'orizzonte cade al 40% dall'alto, come nell'immagine ferma. */

const VERT = '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}';

const FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uT;
out vec4 o;

float h1(float n) { return fract(sin(n * 127.1 + 11.) * 43758.5453); }
float h2(vec2 p) { vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

const vec3 SOLE = normalize(vec3(-.1, .33, .94));

float onde(vec2 p, float fp) {
  float h = 0., k = .12, a = .5;
  vec2 vento = normalize(vec2(.25, 1.));
  for (int i = 0; i < 22; i++) {
    float fi = float(i);
    vec2 d = rot((h1(fi) - .5) * 1.9) * vento;
    float vel = sqrt(9.8 / k) * .22;          // le onde lunghe corrono di più
    float x = dot(p, d) * k + h1(fi + 9.) * 6.283 - uT * vel * k * 6.;
    float w = pow(sin(x) * .5 + .5, 1.6) - .4;
    h += a * w * clamp(1.6 - k * fp * 5., 0., 1.) * (1. - smoothstep(4.4, 8., k));
    k *= 1.24; a *= .82;
  }
  return h * 1.1;
}

vec3 cielo(vec3 d) {
  float t = max(d.y, 0.);
  vec3 c = mix(vec3(.82, .8, .76), vec3(.42, .48, .52), pow(t, .42));
  float s = max(dot(d, SOLE), 0.);
  c += vec3(1., .9, .74) * (pow(s, 700.) * .6 + pow(s, 12.) * .2);
  return mix(c, vec3(.85, .83, .79), exp(-t * 22.) * .9);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  // stessa inquadratura della lastra "risacca": camera a pelo d'acqua
  vec3 d = normalize(vec3(uv * .5, 1.));
  d.yz = rot(-.05) * d.yz;
  vec3 c;
  if (d.y >= -.0004) {
    c = cielo(d);
  } else {
    float t = .55 / -d.y;
    vec2 p = vec2(d.x, d.z) * t;
    float fp = t * (.5 / uRes.y) / sqrt(max(-d.y, .004));
    float e = max(.02, fp * .7);
    float h0 = onde(p, fp);
    vec3 n = normalize(vec3(-(onde(p + vec2(e, 0), fp) - h0) / e, 1., -(onde(p + vec2(0, e), fp) - h0) / e));
    vec3 r = reflect(d, n); r.y = abs(r.y);
    float fres = .02 + .98 * pow(1. - max(dot(n, -d), 0.), 5.);
    vec3 corpo = mix(vec3(.02, .06, .07), vec3(.07, .17, .18), clamp(h0 * .9 + .25, 0., 1.) * .5);
    c = mix(corpo, cielo(r), fres);
    c += vec3(1., .9, .74) * pow(max(dot(r, SOLE), 0.), 900.) * 11.;
    c = mix(c, cielo(normalize(vec3(d.x, .0005, d.z))) * .96, (1. - exp(-t * .0016 * .9)) * .85);
  }
  c = c / (1. + c * .55) * 1.4;
  c = mix(vec3(.028, .04, .048), vec3(.975, .968, .95), clamp(c, 0., 1.));
  c += (h2(gl_FragCoord.xy + fract(uT) * 91.) - .5) * .035;
  o = vec4(c, 1.);
}
`;

export function creaSpecchio(contenitore) {
  const tela = document.createElement('canvas');
  const gl = tela.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const shader = (tipo, src) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT);
  const fs = shader(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uT = gl.getUniformLocation(prog, 'uT');

  contenitore.append(tela);

  let scala = 0.5;
  const misura = () => {
    const w = Math.round(contenitore.clientWidth * scala);
    const h = Math.round(contenitore.clientHeight * scala);
    if (tela.width !== w || tela.height !== h) {
      tela.width = w; tela.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
  };
  const ro = new ResizeObserver(misura);
  ro.observe(contenitore);
  misura();

  let raf = 0;
  let attivo = false;
  let ultimo = 0;
  let lenti = 0;
  const t0 = performance.now();
  const disegna = (ora) => {
    raf = requestAnimationFrame(disegna);
    if (ora - ultimo < 32) return;                // circa 30 fotogrammi
    const dt = ora - ultimo;
    ultimo = ora;
    // se la macchina fatica, si scende di risoluzione; se fatica ancora, ci si ferma
    if (dt > 60) lenti += 1; else lenti = Math.max(0, lenti - 1);
    if (lenti > 20 && scala > 0.34) { scala = 0.34; lenti = 0; misura(); }
    else if (lenti > 20) { ferma(); contenitore.classList.remove('is-viva'); return; }
    gl.uniform1f(uT, (ora - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  function avvia() {
    if (attivo || document.hidden) return;
    attivo = true;
    raf = requestAnimationFrame(disegna);
  }
  function ferma() {
    attivo = false;
    cancelAnimationFrame(raf);
  }
  const visibilita = () => { if (document.hidden) ferma(); };
  document.addEventListener('visibilitychange', visibilita);
  tela.addEventListener('webglcontextlost', (e) => { e.preventDefault(); ferma(); contenitore.classList.remove('is-viva'); });

  // il primo fotogramma subito, così la dissolvenza parte da un'immagine vera
  gl.uniform1f(uT, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  return {
    avvia,
    ferma,
    distruggi() {
      ferma();
      ro.disconnect();
      document.removeEventListener('visibilitychange', visibilita);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      tela.remove();
    },
  };
}
