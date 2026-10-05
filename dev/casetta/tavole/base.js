/* Strumenti di base per le tavole illustrate della Casetta: caso con seme,
   rumore, curve morbide, ombre, luci e trame dipinte pixel per pixel.
   Tutto è deterministico: la stessa tavola esce sempre identica. */

export const TAU = Math.PI * 2;
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t) => t * t * (3 - 2 * t);

export function mulberry32(seme) {
  let s = seme >>> 0;
  return function caso() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(testo) {
  let h = 2166136261;
  for (const c of String(testo)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export class Caso {
  constructor(seme) { this.r = mulberry32(typeof seme === 'string' ? hash(seme) : seme); }
  n() { return this.r(); }
  tra(a, b) { return a + (b - a) * this.r(); }
  int(a, b) { return Math.floor(this.tra(a, b + 1)); }
  scegli(lista) { return lista[Math.floor(this.r() * lista.length)]; }
  segno() { return this.r() < 0.5 ? -1 : 1; }
  gauss() { let u = 0; for (let i = 0; i < 4; i += 1) u += this.r(); return (u - 2) / 2; }
  figlio(etichetta) { return new Caso(hash(`${this.r()}-${etichetta}`)); }
}

/* Rumore a valori 2D con interpolazione morbida e somma di ottave. */
export function creaRumore(seme) {
  const r = mulberry32(seme);
  const perm = new Uint16Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i -= 1) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i += 1) perm[i] = p[i & 255];
  const val = Float32Array.from({ length: 256 }, () => r());
  const v = (x, y) => val[perm[(x & 255) + perm[y & 255]]];
  function n2(x, y) {
    const xi = Math.floor(x); const yi = Math.floor(y);
    const xf = smooth(x - xi); const yf = smooth(y - yi);
    const a = v(xi, yi); const b = v(xi + 1, yi); const c = v(xi, yi + 1); const d = v(xi + 1, yi + 1);
    return lerp(lerp(a, b, xf), lerp(c, d, xf), yf);
  }
  function fbm(x, y, ottave = 4) {
    let s = 0; let amp = 0.5; let f = 1; let norma = 0;
    for (let i = 0; i < ottave; i += 1) { s += amp * n2(x * f, y * f); norma += amp; amp *= 0.5; f *= 2.03; }
    return s / norma;
  }
  return { n2, fbm };
}

/* Curve morbide (Catmull-Rom) chiuse e aperte. */
export function curvaChiusa(punti) {
  const path = new Path2D();
  const n = punti.length;
  for (let i = 0; i < n; i += 1) {
    const p0 = punti[(i - 1 + n) % n]; const p1 = punti[i]; const p2 = punti[(i + 1) % n]; const p3 = punti[(i + 2) % n];
    if (i === 0) path.moveTo(p1[0], p1[1]);
    path.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1],
    );
  }
  path.closePath();
  return path;
}

export function curvaAperta(punti, path = new Path2D()) {
  const n = punti.length;
  path.moveTo(punti[0][0], punti[0][1]);
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = punti[Math.max(0, i - 1)]; const p1 = punti[i]; const p2 = punti[i + 1]; const p3 = punti[Math.min(n - 1, i + 2)];
    path.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1],
    );
  }
  return path;
}

/* Una macchia organica: raggio modulato da poche armoniche (bordo morbido). */
export function forma(cx, cy, rx, ry, irregolare, caso, { punti = 28, rot = 0 } = {}) {
  const armoniche = [2, 3, 4, 5, 7].map((k) => [k, caso.tra(-1, 1) / k ** 0.6, caso.tra(0, TAU)]);
  const lista = [];
  for (let i = 0; i < punti; i += 1) {
    const a = (i / punti) * TAU;
    let m = 1;
    for (const [k, amp, fase] of armoniche) m += irregolare * amp * Math.sin(k * a + fase);
    const x = Math.cos(a) * rx * m; const y = Math.sin(a) * ry * m;
    lista.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return curvaChiusa(lista);
}

export function cerchio(cx, cy, r) {
  const p = new Path2D();
  p.arc(cx, cy, r, 0, TAU);
  return p;
}

export function ellisse(cx, cy, rx, ry, rot = 0) {
  const p = new Path2D();
  p.ellipse(cx, cy, rx, ry, rot, 0, TAU);
  return p;
}

export function rettangoloTondo(x, y, w, h, r) {
  const p = new Path2D();
  p.roundRect(x, y, w, h, r);
  return p;
}

export const rgb = ([r, g, b], a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
export const mescola = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t));
export const scala = (c, k) => c.map((v) => clamp(v * k, 0, 255));

/* Ombra portata morbida: la luce viene sempre da in alto a sinistra.
   Si disegna la forma fuori dalla tela e se ne tiene solo l'ombra
   (shadowBlur è molto più veloce del filtro blur). */
const LONTANO = 20000;
export function ombra(ctx, path, { dx = 8, dy = 12, sfoca = 16, alfa = 0.3, colore = [52, 34, 20] } = {}) {
  ctx.save();
  const m = ctx.getTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowColor = rgb(colore, alfa);
  ctx.shadowBlur = sfoca * 2;
  ctx.shadowOffsetX = LONTANO + dx * Math.hypot(m.a, m.b);
  ctx.shadowOffsetY = dy * Math.hypot(m.c, m.d);
  ctx.translate(-LONTANO, 0);
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  ctx.fillStyle = '#000';
  ctx.fill(path);
  ctx.restore();
}

/* Ombra interna lungo il bordo (conche, scodelle, piatti fondi). */
export function ombraInterna(ctx, path, { dx = 6, dy = 9, sfoca = 14, alfa = 0.35, colore = [60, 36, 20], spessore = 30 } = {}) {
  ctx.save();
  ctx.clip(path);
  const m = ctx.getTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowColor = rgb(colore, alfa);
  ctx.shadowBlur = sfoca * 2;
  ctx.shadowOffsetX = LONTANO + dx;
  ctx.shadowOffsetY = dy;
  ctx.translate(-LONTANO, 0);
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  ctx.lineWidth = spessore;
  ctx.strokeStyle = '#000';
  ctx.stroke(path);
  ctx.restore();
}

/* Un riflesso di luce: ellisse chiara che sfuma ai bordi. */
export function luce(ctx, x, y, rx, ry, { alfa = 0.5, sfoca = 6, rot = 0, colore = [255, 255, 255] } = {}) {
  if (rx <= 0 || ry <= 0) return;
  const R = rx + sfoca;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(1, (ry + sfoca) / R);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, rgb(colore, alfa));
  g.addColorStop(Math.max(0.05, (rx - sfoca * 0.5) / R), rgb(colore, alfa * 0.85));
  g.addColorStop(1, rgb(colore, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function tela(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

/* Trama pixel per pixel dentro un rettangolo, ritagliata da una forma. */
export function trama(ctx, path, [x0, y0, x1, y1], colore, { risoluzione = 1, composizione = 'source-over', alfa = 1 } = {}) {
  const w = Math.ceil((x1 - x0) / risoluzione); const h = Math.ceil((y1 - y0) / risoluzione);
  if (w <= 0 || h <= 0) return;
  const c = tela(w, h);
  const cx = c.getContext('2d');
  const img = cx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const [r, g, b, a = 255] = colore(x0 + x * risoluzione, y0 + y * risoluzione);
      const i = (y * w + x) * 4;
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
    }
  }
  cx.putImageData(img, 0, 0);
  ctx.save();
  if (path) ctx.clip(path);
  ctx.globalCompositeOperation = composizione;
  ctx.globalAlpha = alfa;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, x0, y0, x1 - x0, y1 - y0);
  ctx.restore();
}

/* Grana leggera su tutta la tavola: dà la carta senza sporcare i colori. */
export function grana(ctx, w, h, caso, { alfa = 0.05, passo = 2 } = {}) {
  const c = tela(w / passo, h / passo);
  const cx = c.getContext('2d');
  const img = cx.createImageData(c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + caso.gauss() * 90;
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alfa;
  ctx.drawImage(c, 0, 0, w, h);
  ctx.restore();
}

/* Vignettatura calda: i bordi si scuriscono appena, come in una foto. */
export function vignetta(ctx, w, h, { forza = 0.28, colore = [40, 24, 12], cx = 0.5, cy = 0.5 } = {}) {
  const g = ctx.createRadialGradient(w * cx, h * cy, Math.min(w, h) * 0.25, w * cx, h * cy, Math.hypot(w, h) * 0.62);
  g.addColorStop(0, rgb(colore, 0));
  g.addColorStop(1, rgb(colore, forza));
  ctx.save();
  ctx.fillStyle = g;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/* Luce della finestra: un velo caldo da in alto a sinistra. */
export function lucePrincipale(ctx, w, h, { forza = 0.16 } = {}) {
  const g = ctx.createLinearGradient(0, 0, w * 0.9, h);
  g.addColorStop(0, `rgba(255,236,200,${forza})`);
  g.addColorStop(0.5, 'rgba(255,236,200,0)');
  g.addColorStop(1, `rgba(30,20,40,${forza * 0.6})`);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
