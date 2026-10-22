/* Fondi: la tovaglia di lino, il legno della spianatoia, la carta paglia. */
import { creaRumore, trama, rgb, lerp, clamp, forma, ombra } from './base.js';

/* Lino color crema con la trama dei fili e due pieghe morbide. */
export function lino(ctx, w, h, S, caso, { base = [238, 229, 213], fili = [140, 118, 86] } = {}) {
  const rum = creaRumore(caso.int(1, 1e9));
  // fondo con macchie larghe e quasi invisibili (la stoffa non è mai uniforme)
  trama(ctx, null, [0, 0, w, h], (x, y) => {
    const n = rum.fbm(x / (420 * S), y / (420 * S), 3);
    const k = 0.965 + (n - 0.5) * 0.07;
    return [base[0] * k, base[1] * k, base[2] * k, 255];
  }, { risoluzione: 6 });

  // i fili: trama e ordito
  ctx.save();
  ctx.lineCap = 'round';
  const passo = 3.4 * S;
  for (let y = 0; y < h; y += passo * caso.tra(0.75, 1.3)) {
    ctx.globalAlpha = caso.tra(0.035, 0.085);
    ctx.strokeStyle = rgb(fili);
    ctx.lineWidth = caso.tra(0.6, 1.5) * S;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + caso.tra(-1.5, 1.5) * S); ctx.stroke();
  }
  for (let x = 0; x < w; x += passo * caso.tra(0.75, 1.3)) {
    ctx.globalAlpha = caso.tra(0.025, 0.06);
    ctx.strokeStyle = rgb(fili);
    ctx.lineWidth = caso.tra(0.6, 1.4) * S;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + caso.tra(-1.5, 1.5) * S, h); ctx.stroke();
  }
  // fili più grossi qua e là (il lino ha i nodi)
  for (let i = 0; i < (w * h) / (9000 * S * S); i += 1) {
    const x = caso.tra(0, w); const y = caso.tra(0, h); const l = caso.tra(20, 90) * S;
    ctx.globalAlpha = caso.tra(0.05, 0.12);
    ctx.lineWidth = caso.tra(1.2, 2.2) * S;
    ctx.beginPath();
    if (caso.n() < 0.5) { ctx.moveTo(x, y); ctx.lineTo(x + l, y + caso.tra(-1, 1) * S); } else { ctx.moveTo(x, y); ctx.lineTo(x + caso.tra(-1, 1) * S, y + l); }
    ctx.stroke();
  }
  ctx.restore();

  // due pieghe: una fascia di luce e una d'ombra, larghissime
  for (let i = 0; i < 2; i += 1) {
    const x0 = caso.tra(0.1, 0.9) * w; const ang = caso.tra(-0.35, 0.35);
    ctx.save();
    ctx.translate(x0, h / 2);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(-140 * S, 0, 140 * S, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.45, 'rgba(255,252,244,0.22)');
    g.addColorStop(0.55, 'rgba(120,96,64,0.08)');
    g.addColorStop(1, 'rgba(120,96,64,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-140 * S, -h, 280 * S, h * 2);
    ctx.restore();
  }
}

/* Una riga blu sul bordo della tovaglia (il blu della Casetta). */
export function rigaTovaglia(ctx, w, h, S, { y = 0.9, spessore = 18, colore = [26, 58, 82], verticale = false, pos = null } = {}) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = rgb(colore);
  const p = pos ?? (verticale ? w * y : h * y);
  if (verticale) {
    ctx.fillRect(p, 0, spessore * S, h);
    ctx.fillRect(p + spessore * S + 7 * S, 0, 4 * S, h);
  } else {
    ctx.fillRect(0, p, w, spessore * S);
    ctx.fillRect(0, p + spessore * S + 7 * S, w, 4 * S);
  }
  ctx.restore();
}

/* Legno: anelli deformati dal rumore e fibre sottili. dir = verso delle fibre. */
export function coloreLegno(rum, { base = [176, 124, 78], scala = 1, dir = 0, contrasto = 1 } = {}) {
  const c = Math.cos(dir); const s = Math.sin(dir);
  return (x, y) => {
    const u = (x * c + y * s) / scala; const v = (-x * s + y * c) / scala;
    const n = rum.fbm(u * 0.0022, v * 0.018, 4);
    const anelli = Math.sin(v * 0.085 + n * 16);
    const fibra = rum.n2(u * 0.04, v * 0.9);
    const macchia = rum.fbm(u * 0.0008, v * 0.004, 2);
    let k = 0.86 + contrasto * (0.07 * anelli + 0.09 * (fibra - 0.5) + 0.12 * (macchia - 0.5));
    k = clamp(k, 0.55, 1.2);
    return [base[0] * k, base[1] * k * 0.995, base[2] * k * 0.985, 255];
  };
}

export function legno(ctx, path, box, S, caso, opzioni = {}) {
  const rum = creaRumore(caso.int(1, 1e9));
  trama(ctx, path, box, coloreLegno(rum, { scala: S, ...opzioni }), { risoluzione: opzioni.risoluzione ?? 1 });
}

/* Assi di legno di un tavolo, una accanto all'altra. */
export function tavolo(ctx, w, h, S, caso, { base = [150, 98, 58], assi = 5, verticali = false } = {}) {
  const n = assi;
  for (let i = 0; i < n; i += 1) {
    const p = new Path2D();
    const tinta = base.map((v) => v * caso.tra(0.9, 1.08));
    if (verticali) {
      const x0 = (i / n) * w; const x1 = ((i + 1) / n) * w;
      p.rect(x0, 0, x1 - x0, h);
      legno(ctx, p, [x0, 0, x1, h], S, caso, { base: tinta, dir: Math.PI / 2, risoluzione: 1 });
      ctx.fillStyle = 'rgba(40,22,10,0.55)';
      ctx.fillRect(x1 - 1.5 * S, 0, 3 * S, h);
    } else {
      const y0 = (i / n) * h; const y1 = ((i + 1) / n) * h;
      p.rect(0, y0, w, y1 - y0);
      legno(ctx, p, [0, y0, w, y1], S, caso, { base: tinta, dir: 0, risoluzione: 1 });
      ctx.fillStyle = 'rgba(40,22,10,0.55)';
      ctx.fillRect(0, y1 - 1.5 * S, w, 3 * S);
      ctx.fillStyle = 'rgba(255,230,190,0.12)';
      ctx.fillRect(0, y0 + 1.5 * S, w, 1.5 * S);
    }
  }
}

/* Carta paglia stropicciata, con le pieghe e qualche macchia d'unto. */
export function carta(ctx, punti, S, caso, { base = [214, 190, 150] } = {}) {
  const path = new Path2D();
  path.moveTo(...punti[0]);
  for (const p of punti.slice(1)) path.lineTo(...p);
  path.closePath();
  ombra(ctx, path, { dx: 5 * S, dy: 9 * S, sfoca: 12 * S, alfa: 0.25 });
  const rum = creaRumore(caso.int(1, 1e9));
  const xs = punti.map((p) => p[0]); const ys = punti.map((p) => p[1]);
  trama(ctx, path, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], (x, y) => {
    const n = rum.fbm(x / (90 * S), y / (90 * S), 3);
    const pieghe = Math.abs(Math.sin((x + y * 0.6) / (110 * S) + n * 5));
    const k = 0.95 + n * 0.05 + pieghe * 0.035;
    return [base[0] * k, base[1] * k, base[2] * k, 255];
  }, { risoluzione: 2 });
  ctx.save();
  ctx.clip(path);
  for (let i = 0; i < 9; i += 1) {
    const x = lerp(Math.min(...xs), Math.max(...xs), caso.n()); const y = lerp(Math.min(...ys), Math.max(...ys), caso.n());
    ctx.strokeStyle = caso.n() < 0.5 ? 'rgba(255,248,230,0.35)' : 'rgba(110,80,40,0.18)';
    ctx.lineWidth = caso.tra(1, 2.2) * S;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + caso.tra(-200, 200) * S, y + caso.tra(-120, 120) * S); ctx.stroke();
  }
  for (let i = 0; i < 3; i += 1) {
    const x = lerp(Math.min(...xs), Math.max(...xs), caso.tra(0.15, 0.85)); const y = lerp(Math.min(...ys), Math.max(...ys), caso.tra(0.15, 0.85));
    ctx.fillStyle = 'rgba(150,100,40,0.08)';
    ctx.fill(forma(x, y, caso.tra(20, 60) * S, caso.tra(16, 40) * S, 0.4, caso));
  }
  ctx.restore();
  return path;
}

/* Tovaglia a quadri (per la sala): quadri blu e bianchi che si sovrappongono. */
export function quadri(ctx, w, h, S, caso, { lato = 46, colore = [26, 58, 82], fondo = [244, 240, 232], rot = 0 } = {}) {
  ctx.save();
  ctx.fillStyle = rgb(fondo);
  ctx.fillRect(0, 0, w, h);
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rot);
  const L = lato * S;
  const n = Math.ceil(Math.hypot(w, h) / L / 2) + 1;
  ctx.fillStyle = rgb(colore, 0.42);
  for (let i = -n; i <= n; i += 2) ctx.fillRect(i * L, -n * L, L, 2 * n * L);
  for (let j = -n; j <= n; j += 2) ctx.fillRect(-n * L, j * L, 2 * n * L, L);
  ctx.restore();
  // trama del cotone
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.8 * S;
  for (let y = 0; y < h; y += 3 * S) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
}
