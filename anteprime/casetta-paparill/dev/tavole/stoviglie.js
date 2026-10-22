/* Stoviglie viste dall'alto: piatti col filo blu, coccio, taglieri,
   posate, calici, bottiglie, cestini, tazzine. Luce da in alto a sinistra. */
import {
  TAU, cerchio, ellisse, rettangoloTondo, ombra, ombraInterna, luce, rgb, scala, creaRumore, trama, curvaAperta,
} from './base.js';
import { legno } from './fondi.js';

const BLU = [26, 58, 82];

/* Piatto di ceramica bianca con la tesa e un doppio filo blu. */
export function piatto(ctx, cx, cy, R, S, { fondo = 0.64, filo = true, tinta = [250, 248, 243] } = {}) {
  const esterno = cerchio(cx, cy, R);
  ombra(ctx, esterno, { dx: 10 * S, dy: 16 * S, sfoca: 22 * S, alfa: 0.32 });
  ombra(ctx, esterno, { dx: 3 * S, dy: 5 * S, sfoca: 5 * S, alfa: 0.25 });
  // la tesa
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.2, cx, cy, R);
  g.addColorStop(0, rgb(scala(tinta, 1.01)));
  g.addColorStop(0.75, rgb(tinta));
  g.addColorStop(1, rgb(scala(tinta, 0.9)));
  ctx.fillStyle = g;
  ctx.fill(esterno);
  // bordo esterno appena più scuro in basso a destra
  ctx.save();
  ctx.lineWidth = 2.2 * S;
  ctx.strokeStyle = 'rgba(120,100,80,0.25)';
  ctx.stroke(esterno);
  ctx.restore();
  if (filo) {
    ctx.save();
    ctx.strokeStyle = rgb(BLU, 0.9);
    ctx.lineWidth = 3.2 * S;
    ctx.stroke(cerchio(cx, cy, R * 0.915));
    ctx.lineWidth = 1.2 * S;
    ctx.stroke(cerchio(cx, cy, R * 0.885));
    ctx.restore();
  }
  // il fondo (conca): più scuro dove guarda via dalla luce
  const conca = cerchio(cx, cy, R * fondo);
  ctx.save();
  ctx.fillStyle = rgb(scala(tinta, 0.985));
  ctx.fill(conca);
  ctx.restore();
  ombraInterna(ctx, conca, { dx: -5 * S, dy: -7 * S, sfoca: 10 * S, alfa: 0.12, spessore: 22 * S, colore: [90, 70, 50] });
  ombraInterna(ctx, cerchio(cx, cy, R), { dx: -3 * S, dy: -4 * S, sfoca: 6 * S, alfa: 0.08, spessore: 10 * S });
  // smalto: riflesso lungo la tesa in alto a sinistra
  ctx.save();
  ctx.filter = `blur(${5 * S}px)`;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 7 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.8, Math.PI * 1.05, Math.PI * 1.42);
  ctx.stroke();
  ctx.restore();
  return { conca: R * fondo };
}

/* Scodella o tegame di coccio: terracotta smaltata dentro. */
export function coccio(ctx, cx, cy, R, S, caso, { manici = false, interno = [150, 72, 36], esterno = [176, 94, 52] } = {}) {
  const corpo = cerchio(cx, cy, R);
  ombra(ctx, corpo, { dx: 11 * S, dy: 17 * S, sfoca: 22 * S, alfa: 0.36 });
  if (manici) {
    for (const lato of [-1, 1]) {
      const m = ellisse(cx + lato * R * 1.02, cy, R * 0.16, R * 0.22);
      ombra(ctx, m, { dx: 6 * S, dy: 9 * S, sfoca: 9 * S, alfa: 0.3 });
      ctx.fillStyle = rgb(esterno);
      ctx.fill(m);
      ctx.fillStyle = rgb(scala(esterno, 0.7));
      ctx.fill(ellisse(cx + lato * R * 1.06, cy, R * 0.07, R * 0.11));
    }
  }
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
  g.addColorStop(0, rgb(scala(esterno, 1.18)));
  g.addColorStop(0.8, rgb(esterno));
  g.addColorStop(1, rgb(scala(esterno, 0.78)));
  ctx.fillStyle = g;
  ctx.fill(corpo);
  // il labbro
  const labbro = cerchio(cx, cy, R * 0.9);
  ctx.save();
  ctx.lineWidth = 4 * S;
  ctx.strokeStyle = rgb(scala(esterno, 1.25), 0.7);
  ctx.stroke(labbro);
  ctx.restore();
  // l'interno smaltato
  const dentro = cerchio(cx, cy, R * 0.86);
  const gi = ctx.createRadialGradient(cx + R * 0.2, cy + R * 0.25, R * 0.05, cx, cy, R * 0.86);
  gi.addColorStop(0, rgb(scala(interno, 1.1)));
  gi.addColorStop(1, rgb(scala(interno, 0.72)));
  ctx.fillStyle = gi;
  ctx.fill(dentro);
  ombraInterna(ctx, dentro, { dx: 8 * S, dy: 12 * S, sfoca: 12 * S, alfa: 0.4, spessore: 26 * S, colore: [50, 20, 8] });
  // trama della terracotta sul bordo
  const rum = creaRumore(caso.int(1, 1e9));
  const anello = new Path2D();
  anello.arc(cx, cy, R, 0, TAU);
  anello.arc(cx, cy, R * 0.88, 0, TAU, true);
  trama(ctx, anello, [cx - R, cy - R, cx + R, cy + R], (x, y) => {
    const n = rum.fbm(x / (9 * S), y / (9 * S), 3);
    return [255, 240, 220, (n - 0.45) * 160];
  }, { risoluzione: 2, composizione: 'soft-light' });
  luce(ctx, cx - R * 0.6, cy - R * 0.62, R * 0.16, R * 0.035, { alfa: 0.35, sfoca: 4 * S, rot: -0.78 });
  return { interno: R * 0.86 };
}

/* Tagliere di legno con il manico forato. */
export function tagliere(ctx, x, y, w, h, S, caso, { r = 26, manico = 'destra', base = [184, 132, 84], rot = 0 } = {}) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  // un solo contorno: tavola e manico sono lo stesso pezzo di legno
  const R = r * S; const mh = Math.min(h * 0.26, 120 * S); const mw = 96 * S; const c = 18 * S;
  let p = new Path2D();
  p.moveTo(-w / 2 + R, -h / 2);
  p.lineTo(w / 2 - R, -h / 2);
  p.arcTo(w / 2, -h / 2, w / 2, -h / 2 + R, R);
  if (manico) {
    p.lineTo(w / 2, -mh / 2 - c);
    p.quadraticCurveTo(w / 2, -mh / 2, w / 2 + c, -mh / 2);
    p.lineTo(w / 2 + mw - mh / 2, -mh / 2);
    p.arc(w / 2 + mw - mh / 2, 0, mh / 2, -Math.PI / 2, Math.PI / 2);
    p.lineTo(w / 2 + c, mh / 2);
    p.quadraticCurveTo(w / 2, mh / 2, w / 2, mh / 2 + c);
  }
  p.lineTo(w / 2, h / 2 - R);
  p.arcTo(w / 2, h / 2, w / 2 - R, h / 2, R);
  p.lineTo(-w / 2 + R, h / 2);
  p.arcTo(-w / 2, h / 2, -w / 2, h / 2 - R, R);
  p.lineTo(-w / 2, -h / 2 + R);
  p.arcTo(-w / 2, -h / 2, -w / 2 + R, -h / 2, R);
  p.closePath();
  if (manico === 'sinistra') {
    const specchio = new Path2D();
    specchio.addPath(p, new DOMMatrix([-1, 0, 0, 1, 0, 0]));
    p = specchio;
  }
  ombra(ctx, p, { dx: 10 * S, dy: 16 * S, sfoca: 20 * S, alfa: 0.35 });
  ombra(ctx, p, { dx: 3 * S, dy: 5 * S, sfoca: 4 * S, alfa: 0.3 });
  legno(ctx, p, [-w / 2 - 130 * S, -h / 2, w / 2 + 130 * S, h / 2], S, caso, { base, dir: 0.02 });
  if (manico) {
    const fx = (manico === 'sinistra' ? -1 : 1) * (w / 2 + mw - mh / 2);
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fill(cerchio(fx, 0, 13 * S));
  }
  // smusso: luce sul bordo in alto a sinistra, ombra in basso a destra
  ctx.save();
  ctx.clip(p);
  ctx.lineWidth = 6 * S;
  ctx.strokeStyle = 'rgba(255,235,200,0.35)';
  ctx.translate(2 * S, 3 * S);
  ctx.stroke(p);
  ctx.restore();
  ctx.save();
  ctx.clip(p);
  ctx.lineWidth = 8 * S;
  ctx.strokeStyle = 'rgba(50,25,10,0.3)';
  ctx.translate(-3 * S, -4 * S);
  ctx.stroke(p);
  ctx.restore();
  ctx.restore();
}

/* Posate d'acciaio: forchetta, coltello, cucchiaio. */
function acciaio(ctx, path, x0, y0, x1, y1, S) {
  ombra(ctx, path, { dx: 5 * S, dy: 8 * S, sfoca: 6 * S, alfa: 0.3 });
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#f4f4f2');
  g.addColorStop(0.35, '#b9bcbf');
  g.addColorStop(0.55, '#eef0f1');
  g.addColorStop(1, '#8e9397');
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = 'rgba(70,74,78,0.35)';
  ctx.lineWidth = 1 * S;
  ctx.stroke(path);
}

export function forchetta(ctx, x, y, L, ang, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  const l = L; const wM = 13 * S;
  p.moveTo(0, -wM * 0.55);
  p.bezierCurveTo(l * 0.35, -wM * 0.75, l * 0.55, -6 * S, l * 0.62, -6 * S);
  p.lineTo(l * 0.62, 6 * S);
  p.bezierCurveTo(l * 0.55, 6 * S, l * 0.35, wM * 0.75, 0, wM * 0.55);
  p.closePath();
  // la testa e i rebbi
  const t0 = l * 0.6; const tw = 15 * S;
  p.moveTo(t0, -6 * S);
  p.bezierCurveTo(t0 + 40 * S, -tw, t0 + 70 * S, -tw, t0 + 74 * S, -tw);
  for (let k = 0; k < 4; k += 1) {
    const y0 = -tw + k * (tw * 2) / 4;
    p.lineTo(t0 + 74 * S + 70 * S, y0 + 1.5 * S);
    p.lineTo(t0 + 74 * S + 70 * S, y0 + (tw * 2) / 4 - 2.5 * S);
    p.lineTo(t0 + 76 * S, y0 + (tw * 2) / 4 - 0.5 * S);
  }
  p.lineTo(t0 + 74 * S, tw);
  p.bezierCurveTo(t0 + 70 * S, tw, t0 + 40 * S, tw, t0, 6 * S);
  p.closePath();
  acciaio(ctx, p, 0, -tw, 0, tw, S);
  ctx.restore();
}

export function coltello(ctx, x, y, L, ang, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  const l = L;
  p.moveTo(0, -9 * S);
  p.lineTo(l * 0.55, -8 * S);
  p.lineTo(l * 0.58, -11 * S);
  p.bezierCurveTo(l * 0.8, -12 * S, l * 0.98, -6 * S, l, 2 * S);
  p.lineTo(l * 0.58, 7 * S);
  p.lineTo(l * 0.55, 9 * S);
  p.lineTo(0, 9 * S);
  p.closePath();
  acciaio(ctx, p, 0, -12 * S, 0, 12 * S, S);
  ctx.restore();
}

export function cucchiaino(ctx, x, y, L, ang, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  p.moveTo(0, -4 * S);
  p.lineTo(L * 0.62, -3 * S);
  p.lineTo(L * 0.62, 3 * S);
  p.lineTo(0, 4 * S);
  p.closePath();
  p.addPath(ellisse(L * 0.8, 0, L * 0.2, L * 0.13));
  acciaio(ctx, p, 0, -L * 0.13, 0, L * 0.13, S);
  luce(ctx, L * 0.76, -L * 0.04, L * 0.08, L * 0.03, { alfa: 0.7, sfoca: 2 * S });
  ctx.restore();
}

/* Calice visto dall'alto: piede, bevanda, riflessi, e la luce colorata
   che il vino proietta sulla tovaglia. */
export function calice(ctx, cx, cy, R, S, { vino = [110, 14, 32], livello = 0.62, vuoto = false } = {}) {
  // il colore che passa attraverso il vetro
  if (!vuoto) {
    ctx.save();
    ctx.filter = `blur(${14 * S}px)`;
    ctx.fillStyle = rgb(vino, 0.28);
    ctx.fill(ellisse(cx + R * 0.55, cy + R * 0.75, R * 0.9, R * 0.75));
    ctx.restore();
  }
  ombra(ctx, cerchio(cx, cy, R * 0.95), { dx: 10 * S, dy: 16 * S, sfoca: 16 * S, alfa: 0.18 });
  // piede (più largo, appena visibile)
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2 * S;
  ctx.stroke(cerchio(cx + 3 * S, cy + 4 * S, R * 0.82));
  ctx.restore();
  // coppa
  const coppa = cerchio(cx, cy, R);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fill(coppa);
  if (!vuoto) {
    const rv = R * (0.55 + livello * 0.35);
    const g = ctx.createRadialGradient(cx - rv * 0.3, cy - rv * 0.3, rv * 0.1, cx, cy, rv);
    g.addColorStop(0, rgb(scala(vino, 1.45), 0.95));
    g.addColorStop(0.7, rgb(vino, 0.96));
    g.addColorStop(1, rgb(scala(vino, 0.7), 0.98));
    ctx.fillStyle = g;
    ctx.fill(cerchio(cx, cy, rv));
    ctx.save();
    ctx.strokeStyle = rgb(scala(vino, 1.6), 0.5);
    ctx.lineWidth = 2 * S;
    ctx.stroke(cerchio(cx, cy, rv));
    ctx.restore();
    luce(ctx, cx - rv * 0.35, cy - rv * 0.4, rv * 0.32, rv * 0.12, { alfa: 0.45, sfoca: 4 * S, rot: -0.7 });
  }
  // orlo del vetro con due riflessi
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2.4 * S;
  ctx.stroke(coppa);
  ctx.strokeStyle = 'rgba(80,80,80,0.25)';
  ctx.lineWidth = 1 * S;
  ctx.stroke(cerchio(cx + 1.5 * S, cy + 2 * S, R));
  ctx.lineWidth = 4 * S;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.filter = `blur(${1.5 * S}px)`;
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, Math.PI * 1.08, Math.PI * 1.38); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, Math.PI * 0.12, Math.PI * 0.22); ctx.stroke();
  ctx.restore();
}

/* Bottiglia vista dall'alto: vetro scuro, collo, capsula. */
export function bottiglia(ctx, cx, cy, R, S, { vetro = [28, 52, 34], capsula = [120, 22, 34] } = {}) {
  const corpo = cerchio(cx, cy, R);
  ombra(ctx, corpo, { dx: 18 * S, dy: 26 * S, sfoca: 18 * S, alfa: 0.38 });
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  g.addColorStop(0, rgb(scala(vetro, 2.2)));
  g.addColorStop(0.6, rgb(vetro));
  g.addColorStop(1, rgb(scala(vetro, 0.6)));
  ctx.fillStyle = g;
  ctx.fill(corpo);
  // spalla e collo
  ctx.fillStyle = rgb(scala(vetro, 1.4), 0.9);
  ctx.fill(cerchio(cx, cy, R * 0.55));
  const gc = ctx.createRadialGradient(cx - R * 0.12, cy - R * 0.12, R * 0.02, cx, cy, R * 0.34);
  gc.addColorStop(0, rgb(scala(capsula, 1.7)));
  gc.addColorStop(1, rgb(capsula));
  ctx.fillStyle = gc;
  ctx.fill(cerchio(cx, cy, R * 0.34));
  ctx.strokeStyle = rgb(scala(capsula, 0.6), 0.6);
  ctx.lineWidth = 1.5 * S;
  ctx.stroke(cerchio(cx, cy, R * 0.24));
  luce(ctx, cx - R * 0.5, cy - R * 0.45, R * 0.28, R * 0.1, { alfa: 0.5, sfoca: 3 * S, rot: -0.75 });
}

/* Tovagliolo di lino piegato, con la riga blu. */
export function tovagliolo(ctx, x, y, w, h, ang, S, caso, { tinta = [246, 241, 231] } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = rettangoloTondo(-w / 2, -h / 2, w, h, 6 * S);
  ombra(ctx, p, { dx: 6 * S, dy: 10 * S, sfoca: 10 * S, alfa: 0.22 });
  ctx.fillStyle = rgb(tinta);
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  ctx.fillStyle = rgb(BLU, 0.85);
  ctx.fillRect(-w / 2, h / 2 - 40 * S, w, 9 * S);
  ctx.fillRect(-w / 2, h / 2 - 26 * S, w, 3 * S);
  // la piega
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.4)');
  g.addColorStop(0.48, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(120,100,70,0.16)');
  g.addColorStop(0.53, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(120,100,70,0.08)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  for (let i = 0; i < 30; i += 1) {
    ctx.strokeStyle = 'rgba(140,120,90,0.07)';
    ctx.lineWidth = 1 * S;
    const yy = -h / 2 + caso.n() * h;
    ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy + caso.tra(-2, 2) * S); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/* Cestino di vimini ovale con il tovagliolo dentro. */
export function cestino(ctx, cx, cy, rx, ry, S, caso, { rot = 0 } = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const fuori = ellisse(0, 0, rx, ry);
  ombra(ctx, fuori, { dx: 10 * S, dy: 16 * S, sfoca: 18 * S, alfa: 0.35 });
  ctx.fillStyle = '#a7743f';
  ctx.fill(fuori);
  // intreccio: anelli di segmenti chiari e scuri
  for (let k = 0; k < 7; k += 1) {
    const f = 1 - k * 0.035;
    const segmenti = 46;
    for (let i = 0; i < segmenti; i += 1) {
      const a0 = (i / segmenti) * TAU + (k % 2) * (TAU / segmenti / 2);
      ctx.strokeStyle = i % 2 ? 'rgba(90,55,22,0.55)' : 'rgba(225,180,120,0.65)';
      ctx.lineWidth = 6.5 * S;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * f, ry * f, 0, a0, a0 + TAU / segmenti * 0.9);
      ctx.stroke();
    }
  }
  const dentro = ellisse(0, 0, rx * 0.74, ry * 0.7);
  ctx.fillStyle = '#5c3a18';
  ctx.fill(dentro);
  ombraInterna(ctx, dentro, { dx: 8 * S, dy: 10 * S, sfoca: 10 * S, alfa: 0.5, spessore: 20 * S });
  ctx.restore();
}

/* Tazzina da caffè con piattino, vista dall'alto. */
export function tazzina(ctx, cx, cy, R, S, { manico = 0.4 } = {}) {
  const piattino = cerchio(cx, cy, R * 1.7);
  ombra(ctx, piattino, { dx: 7 * S, dy: 11 * S, sfoca: 12 * S, alfa: 0.25 });
  ctx.fillStyle = '#f7f4ee';
  ctx.fill(piattino);
  ctx.strokeStyle = rgb(BLU, 0.8);
  ctx.lineWidth = 2 * S;
  ctx.stroke(cerchio(cx, cy, R * 1.58));
  ombraInterna(ctx, cerchio(cx, cy, R * 1.25), { dx: -3 * S, dy: -4 * S, sfoca: 6 * S, alfa: 0.12, spessore: 10 * S });
  // manico
  const mx = cx + Math.cos(manico) * R * 1.12; const my = cy + Math.sin(manico) * R * 1.12;
  const m = ellisse(mx, my, R * 0.36, R * 0.16, manico);
  ombra(ctx, m, { dx: 4 * S, dy: 6 * S, sfoca: 5 * S, alfa: 0.3 });
  ctx.fillStyle = '#f2eee6';
  ctx.fill(m);
  const tazza = cerchio(cx, cy, R);
  ombra(ctx, tazza, { dx: 5 * S, dy: 8 * S, sfoca: 7 * S, alfa: 0.3 });
  ctx.fillStyle = '#fbf9f5';
  ctx.fill(tazza);
  // il caffè con la crema
  const caffe = cerchio(cx, cy, R * 0.82);
  const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.05, cx, cy, R * 0.82);
  g.addColorStop(0, '#d9a25e');
  g.addColorStop(0.55, '#b9773a');
  g.addColorStop(1, '#6e3c17');
  ctx.fillStyle = g;
  ctx.fill(caffe);
  ctx.save();
  ctx.clip(caffe);
  ctx.strokeStyle = 'rgba(240,200,140,0.5)';
  ctx.lineWidth = 3 * S;
  ctx.beginPath();
  for (let a = 0; a < TAU * 1.6; a += 0.2) {
    const r = R * (0.1 + a * 0.06);
    const px = cx + Math.cos(a) * r; const py = cy + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
  luce(ctx, cx - R * 0.45, cy - R * 0.55, R * 0.25, R * 0.08, { alfa: 0.6, sfoca: 2 * S, rot: -0.7 });
}

/* Mattarello: cilindro di legno lungo, con l'ombra. */
export function mattarello(ctx, x0, y0, x1, y1, raggio, S, caso) {
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const L = Math.hypot(x1 - x0, y1 - y0);
  const p = rettangoloTondo(0, -raggio, L, raggio * 2, raggio);
  ctx.save();
  ctx.translate(x0 + 14 * S, y0 + 22 * S);
  ctx.rotate(ang);
  ctx.filter = `blur(${12 * S}px)`;
  ctx.fillStyle = 'rgba(50,30,15,0.38)';
  ctx.fill(rettangoloTondo(0, -raggio, L, raggio * 2, raggio));
  ctx.restore();
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, -raggio, 0, raggio);
  g.addColorStop(0, '#f0cf9c');
  g.addColorStop(0.3, '#d9a96a');
  g.addColorStop(0.75, '#a46e3a');
  g.addColorStop(1, '#6e4520');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 14; i += 1) {
    ctx.strokeStyle = caso.n() < 0.5 ? '#7a4d22' : '#f3d6a8';
    ctx.lineWidth = caso.tra(0.8, 1.8) * S;
    const yy = caso.tra(-raggio * 0.8, raggio * 0.8);
    ctx.beginPath(); ctx.moveTo(caso.tra(0, L * 0.3), yy); ctx.lineTo(caso.tra(L * 0.5, L), yy + caso.tra(-1, 1) * S); ctx.stroke();
  }
  ctx.restore();
}

/* Un rametto di qualcosa che non è cibo ma decora: spago, cartellino... */
export function spago(ctx, punti, S) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 3 * S;
  ctx.shadowColor = 'rgba(40,25,10,0.35)';
  ctx.shadowBlur = 3 * S;
  ctx.shadowOffsetY = 2 * S;
  ctx.stroke(curvaAperta(punti));
  ctx.restore();
}

export { BLU };
