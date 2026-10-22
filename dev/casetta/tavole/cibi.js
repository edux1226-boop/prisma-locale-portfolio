/* Il cibo, dipinto dall'alto: pasta, sughi, polpette, carne alla brace,
   pane, formaggi, erbe, dolci. Ogni funzione disegna nel contesto dato. */
import {
  TAU, lerp, clamp, cerchio, ellisse, forma, curvaAperta, ombra, luce, rgb, scala, mescola,
  creaRumore, trama, rettangoloTondo,
} from './base.js';

/* ---- Pasta -------------------------------------------------------------- */

/* Un nido di spaghetti alla chitarra: fili che girano attorno al centro,
   ognuno con la sua ombra e il suo riflesso. */
export function nidoPasta(ctx, cx, cy, R, S, caso, {
  colore = [232, 188, 104], spessore = 7, fili = 90, schiaccia = 0.94, lucido = 0.45, irregolare = 0.12,
} = {}) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const verso = caso.segno();
  for (let i = 0; i < fili; i += 1) {
    const sopra = i / fili;
    // ogni filo gira attorno a un centro un po' spostato, su un'ellisse
    // inclinata: il nido viene arruffato invece che a cerchi concentrici
    const ox = cx + caso.gauss() * R * 0.12; const oy = cy + caso.gauss() * R * 0.12;
    const rot = caso.tra(0, TAU); const ell = caso.tra(0.72, 1);
    const a0 = caso.tra(0, TAU);
    const giri = caso.tra(0.3, 0.85);
    const r0 = R * caso.tra(0.25, 1) * lerp(1, 0.7, sopra);
    const r1 = R * caso.tra(0.1, 0.9) * lerp(1, 0.55, sopra);
    const punti = [];
    const N = 26;
    for (let k = 0; k <= N; k += 1) {
      const t = k / N;
      const a = a0 + verso * giri * TAU * t;
      const rr = lerp(r0, r1, t) * (1 + irregolare * Math.sin(t * 7 + i * 1.7));
      const ex = Math.cos(a) * rr; const ey = Math.sin(a) * rr * ell;
      punti.push([
        ox + ex * Math.cos(rot) - ey * Math.sin(rot),
        oy + (ex * Math.sin(rot) + ey * Math.cos(rot)) * schiaccia,
      ]);
    }
    const p = curvaAperta(punti);
    const tono = lerp(0.82, 1.08, sopra) * caso.tra(0.95, 1.04);
    const w = spessore * S * caso.tra(0.85, 1.15);
    ctx.shadowColor = 'rgba(90,45,10,0.5)';
    ctx.shadowBlur = 3.5 * S;
    ctx.shadowOffsetX = 1.4 * S;
    ctx.shadowOffsetY = 2.4 * S;
    ctx.strokeStyle = rgb(scala(colore, tono));
    ctx.lineWidth = w;
    ctx.stroke(p);
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.translate(-w * 0.2, -w * 0.22);
    ctx.strokeStyle = `rgba(255,246,222,${lucido * caso.tra(0.6, 1)})`;
    ctx.lineWidth = w * 0.32;
    ctx.stroke(p);
    ctx.restore();
  }
  ctx.restore();
}

/* Pasta alla mugnaia: un filo grosso e irregolare, avvolto su se stesso.
   Ogni tratto è un'unica curva (niente giunture), spessa e un po' storta. */
export function mugnaia(ctx, cx, cy, R, S, caso, { colore = [226, 182, 112] } = {}) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const tratti = 34;
  for (let i = 0; i < tratti; i += 1) {
    const sopra = i / tratti;
    const ox = cx + caso.gauss() * R * 0.1; const oy = cy + caso.gauss() * R * 0.1;
    const a0 = caso.tra(0, TAU);
    const arco = caso.tra(0.7, 1.5) * Math.PI;
    const r0 = R * caso.tra(0.3, 0.98) * lerp(1, 0.72, sopra);
    const r1 = r0 * caso.tra(0.7, 1.1);
    const N = 16;
    const punti = [];
    for (let k = 0; k <= N; k += 1) {
      const t = k / N;
      const a = a0 + arco * t;
      const rr = lerp(r0, r1, t) * (1 + 0.07 * Math.sin(t * 9 + i));
      punti.push([ox + Math.cos(a) * rr, oy + Math.sin(a) * rr * 0.95]);
    }
    const p = curvaAperta(punti);
    const w = caso.tra(15, 21) * S;
    const tono = lerp(0.84, 1.06, sopra);
    ctx.shadowColor = 'rgba(80,40,12,0.5)';
    ctx.shadowBlur = 6 * S;
    ctx.shadowOffsetX = 2.4 * S;
    ctx.shadowOffsetY = 4 * S;
    ctx.strokeStyle = rgb(scala(colore, tono));
    ctx.lineWidth = w;
    ctx.stroke(p);
    ctx.shadowColor = 'transparent';
    // un secondo passaggio più stretto e spostato: lo spessore non è uniforme
    ctx.save();
    ctx.translate(caso.tra(-2, 2) * S, caso.tra(-2, 2) * S);
    ctx.strokeStyle = rgb(scala(colore, tono * 1.03));
    ctx.lineWidth = w * caso.tra(0.65, 0.85);
    ctx.stroke(p);
    ctx.restore();
    ctx.save();
    ctx.translate(-w * 0.2, -w * 0.22);
    ctx.strokeStyle = 'rgba(255,240,210,0.42)';
    ctx.lineWidth = w * 0.26;
    ctx.stroke(p);
    ctx.restore();
  }
  ctx.restore();
}

/* ---- Sughi --------------------------------------------------------------- */

/* Sugo di pomodoro lucido: una o più macchie, con i pezzetti e i riflessi. */
export function sugo(ctx, cx, cy, r, S, caso, { colore = [184, 44, 26], ragu = false, irregolare = 0.28 } = {}) {
  const p = forma(cx, cy, r, r * caso.tra(0.85, 1), irregolare, caso, { rot: caso.tra(0, TAU) });
  ctx.save();
  ctx.shadowColor = 'rgba(70,15,5,0.45)';
  ctx.shadowBlur = 8 * S;
  ctx.shadowOffsetX = 2 * S;
  ctx.shadowOffsetY = 4 * S;
  const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.05, cx, cy, r * 1.1);
  g.addColorStop(0, rgb(scala(colore, 1.28)));
  g.addColorStop(0.55, rgb(colore));
  g.addColorStop(1, rgb(scala(colore, 0.7)));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  ctx.save();
  ctx.clip(p);
  // olio in superficie, arancio e trasparente
  for (let i = 0; i < 7; i += 1) {
    ctx.fillStyle = `rgba(240,120,40,${caso.tra(0.12, 0.28)})`;
    ctx.fill(forma(cx + caso.gauss() * r * 0.6, cy + caso.gauss() * r * 0.6, caso.tra(6, 22) * S, caso.tra(5, 16) * S, 0.3, caso));
  }
  // pezzetti: pomodoro o carne macinata
  const n = Math.round((r * r) / (90 * S * S) * (ragu ? 1.5 : 0.7));
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * r * 0.7; const y = cy + caso.gauss() * r * 0.7;
    const s = caso.tra(2, ragu ? 7 : 5) * S;
    ctx.fillStyle = ragu
      ? rgb(caso.scegli([[96, 34, 18], [120, 50, 26], [80, 28, 14]]), 0.9)
      : rgb(caso.scegli([[150, 26, 16], [205, 70, 40]]), 0.7);
    ctx.fill(forma(x, y, s, s * caso.tra(0.6, 1), 0.4, caso));
  }
  ctx.restore();
  // riflessi bianchi
  for (let i = 0; i < 5; i += 1) {
    luce(ctx, cx - r * caso.tra(0, 0.5), cy - r * caso.tra(0, 0.5), caso.tra(4, 11) * S, caso.tra(2, 4) * S, { alfa: caso.tra(0.35, 0.7), sfoca: 1.5 * S, rot: -0.6 });
  }
  return p;
}

/* Gocce e strisciate di sugo sul piatto. */
export function gocceSugo(ctx, cx, cy, R, S, caso, { colore = [180, 42, 24], n = 6 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const a = caso.tra(0, TAU); const d = R * caso.tra(0.85, 1.05);
    const x = cx + Math.cos(a) * d; const y = cy + Math.sin(a) * d;
    const s = caso.tra(4, 12) * S;
    ctx.save();
    ctx.shadowColor = 'rgba(80,20,10,0.35)';
    ctx.shadowBlur = 3 * S;
    ctx.shadowOffsetY = 1.5 * S;
    ctx.fillStyle = rgb(colore, 0.92);
    ctx.fill(forma(x, y, s, s * 0.8, 0.3, caso));
    ctx.restore();
    luce(ctx, x - s * 0.3, y - s * 0.3, s * 0.3, s * 0.15, { alfa: 0.6, sfoca: 0.8 * S });
  }
}

/* ---- Polpette, palline, sfere ------------------------------------------- */

export function polpetta(ctx, x, y, r, S, caso, { colore = [126, 60, 34], salsa = [176, 40, 24], ruvida = 1 } = {}) {
  const p = forma(x, y, r, r * caso.tra(0.9, 1.04), 0.07, caso);
  ctx.save();
  ctx.shadowColor = 'rgba(50,15,5,0.55)';
  ctx.shadowBlur = r * 0.5;
  ctx.shadowOffsetX = r * 0.22;
  ctx.shadowOffsetY = r * 0.32;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.05);
  g.addColorStop(0, rgb(scala(colore, 1.45)));
  g.addColorStop(0.55, rgb(colore));
  g.addColorStop(1, rgb(scala(colore, 0.62)));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  ctx.save();
  ctx.clip(p);
  for (let i = 0; i < 12 * ruvida; i += 1) {
    ctx.fillStyle = caso.n() < 0.5 ? 'rgba(60,25,10,0.35)' : 'rgba(220,170,120,0.25)';
    ctx.fill(cerchio(x + caso.gauss() * r * 0.6, y + caso.gauss() * r * 0.6, caso.tra(0.6, 1.8) * S));
  }
  if (salsa) {
    const gs = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    gs.addColorStop(0.45, rgb(salsa, 0));
    gs.addColorStop(1, rgb(salsa, 0.6));
    ctx.fillStyle = gs;
    ctx.fill(p);
  }
  ctx.restore();
  luce(ctx, x - r * 0.38, y - r * 0.42, r * 0.28, r * 0.15, { alfa: 0.42, sfoca: r * 0.12, rot: -0.7 });
}

/* Ceci: sferette beige col beccuccio. */
export function cece(ctx, x, y, r, S, caso) {
  const p = forma(x, y, r, r * 0.95, 0.08, caso);
  ctx.save();
  ctx.shadowColor = 'rgba(70,40,15,0.45)';
  ctx.shadowBlur = r * 0.45;
  ctx.shadowOffsetX = r * 0.2;
  ctx.shadowOffsetY = r * 0.3;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#f2dcae');
  g.addColorStop(0.7, '#d9b37a');
  g.addColorStop(1, '#ad8250');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  const a = caso.tra(0, TAU);
  ctx.strokeStyle = 'rgba(140,100,55,0.6)';
  ctx.lineWidth = 1.2 * S;
  ctx.beginPath();
  ctx.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.3, a + 1.2, a + 3.4);
  ctx.stroke();
}

/* ---- Formaggio, erbe, condimenti ---------------------------------------- */

/* Pecorino grattugiato: fiocchi chiari con la loro ombrina. */
export function grattugiato(ctx, cx, cy, R, S, caso, { n = 140, colore = [244, 234, 206] } = {}) {
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * R; const y = cy + caso.gauss() * R;
    const s = caso.tra(1.4, 3.6) * S;
    const p = forma(x, y, s, s * caso.tra(0.4, 0.9), 0.5, caso, { punti: 8, rot: caso.tra(0, TAU) });
    ctx.save();
    ctx.shadowColor = 'rgba(60,40,20,0.35)';
    ctx.shadowBlur = 1.2 * S;
    ctx.shadowOffsetX = 0.8 * S;
    ctx.shadowOffsetY = 1.2 * S;
    ctx.fillStyle = rgb(scala(colore, caso.tra(0.94, 1.03)));
    ctx.fill(p);
    ctx.restore();
  }
}

/* Foglia di basilico (o di alloro, con un altro verde). */
export function foglia(ctx, x, y, lung, larg, ang, S, { colore = [56, 116, 46], lucida = true } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  p.moveTo(0, 0);
  p.bezierCurveTo(lung * 0.22, -larg * 1.05, lung * 0.78, -larg * 0.85, lung, 0);
  p.bezierCurveTo(lung * 0.78, larg * 0.85, lung * 0.22, larg * 1.05, 0, 0);
  ctx.save();
  ctx.shadowColor = 'rgba(20,40,10,0.45)';
  ctx.shadowBlur = 4 * S;
  ctx.shadowOffsetX = 2 * S;
  ctx.shadowOffsetY = 3 * S;
  const g = ctx.createLinearGradient(0, -larg, 0, larg);
  g.addColorStop(0, rgb(scala(colore, 1.25)));
  g.addColorStop(0.5, rgb(colore));
  g.addColorStop(1, rgb(scala(colore, 0.72)));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  ctx.strokeStyle = rgb(scala(colore, 1.5), 0.6);
  ctx.lineWidth = 1.3 * S;
  ctx.beginPath(); ctx.moveTo(lung * 0.04, 0); ctx.quadraticCurveTo(lung * 0.5, -larg * 0.08, lung * 0.95, 0); ctx.stroke();
  ctx.lineWidth = 0.8 * S;
  for (let k = 1; k < 5; k += 1) {
    const t = k / 5.5;
    for (const lato of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(lung * t, 0);
      ctx.quadraticCurveTo(lung * (t + 0.08), lato * larg * 0.4, lung * (t + 0.14), lato * larg * 0.62);
      ctx.stroke();
    }
  }
  if (lucida) {
    ctx.save();
    ctx.clip(p);
    luce(ctx, lung * 0.45, -larg * 0.35, lung * 0.28, larg * 0.22, { alfa: 0.25, sfoca: 2 * S });
    ctx.restore();
  }
  ctx.restore();
}

export function basilico(ctx, x, y, S, caso, { scala: k = 1, foglie = 3 } = {}) {
  const ang0 = caso.tra(0, TAU);
  for (let i = 0; i < foglie; i += 1) {
    const a = ang0 + (i / foglie) * TAU + caso.tra(-0.3, 0.3);
    foglia(ctx, x, y, caso.tra(48, 66) * S * k, caso.tra(19, 25) * S * k, a, S);
  }
}

/* Rametto di rosmarino: stelo e aghi alternati. */
export function rosmarino(ctx, x, y, lung, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(20,30,10,0.4)';
  ctx.shadowBlur = 3 * S;
  ctx.shadowOffsetX = 1.5 * S;
  ctx.shadowOffsetY = 2.5 * S;
  ctx.strokeStyle = '#6b5a3a';
  ctx.lineWidth = 3 * S;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(lung * 0.5, -lung * 0.04, lung, 0); ctx.stroke();
  for (let t = 0.06; t < 1; t += 0.035) {
    for (const lato of [-1, 1]) {
      const l = caso.tra(15, 22) * S * (1 - t * 0.35);
      const a = lato * caso.tra(0.5, 0.85);
      ctx.save();
      ctx.translate(lung * t, -lung * 0.04 * Math.sin(t * Math.PI));
      ctx.rotate(a);
      ctx.fillStyle = caso.n() < 0.6 ? '#3f5e35' : '#56774a';
      ctx.beginPath(); ctx.ellipse(l / 2, 0, l / 2, 2.4 * S, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

/* Peperoncino: fettine ad anello e scaglie. */
export function peperoncino(ctx, cx, cy, R, S, caso, { n = 18 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * R; const y = cy + caso.gauss() * R;
    if (caso.n() < 0.4) {
      ctx.save();
      ctx.shadowColor = 'rgba(60,10,5,0.35)';
      ctx.shadowBlur = 1.5 * S;
      ctx.shadowOffsetY = 1 * S;
      ctx.strokeStyle = '#c0261a';
      ctx.lineWidth = 2.4 * S;
      ctx.beginPath(); ctx.ellipse(x, y, 5 * S, 4.2 * S, caso.tra(0, TAU), 0, TAU); ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = caso.scegli(['#b8231a', '#d63a22', '#8f1a12']);
      ctx.fill(forma(x, y, caso.tra(1.4, 3) * S, caso.tra(1, 2) * S, 0.4, caso, { punti: 6 }));
    }
  }
}

/* Filo d'olio: una linea verde oro lucida. */
export function olio(ctx, punti, S) {
  const p = curvaAperta(punti);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(176,160,40,0.55)';
  ctx.lineWidth = 7 * S;
  ctx.stroke(p);
  ctx.strokeStyle = 'rgba(255,250,200,0.55)';
  ctx.lineWidth = 2 * S;
  ctx.translate(-1.5 * S, -1.5 * S);
  ctx.stroke(p);
  ctx.restore();
}

/* Sale grosso. */
export function sale(ctx, cx, cy, R, S, caso, { n = 60 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * R; const y = cy + caso.gauss() * R;
    const s = caso.tra(1, 2.6) * S;
    ctx.fillStyle = `rgba(255,255,255,${caso.tra(0.65, 0.95)})`;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(caso.tra(0, TAU));
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  }
}

/* ---- Carne --------------------------------------------------------------- */

/* Un arrosticino: lo spiedino di legno e i cubetti alternati di magro e grasso. */
export function arrosticino(ctx, x0, y0, x1, y1, S, caso, { cubetti = 12, lato = 21, crudo = false } = {}) {
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const L = Math.hypot(x1 - x0, y1 - y0);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(ang);
  // lo spiedino
  ctx.save();
  ctx.shadowColor = 'rgba(40,20,5,0.45)';
  ctx.shadowBlur = 4 * S;
  ctx.shadowOffsetX = 2 * S;
  ctx.shadowOffsetY = 3.5 * S;
  ctx.fillStyle = crudo ? '#e8d3a8' : '#d9b981';
  ctx.fillRect(0, -2.6 * S, L, 5.2 * S);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,240,210,0.6)';
  ctx.fillRect(0, -2.6 * S, L, 1.4 * S);
  if (!crudo) {
    // la parte vicina alla carne è annerita dalla brace
    const g = ctx.createLinearGradient(L * 0.05, 0, L * 0.25, 0);
    g.addColorStop(0, 'rgba(60,30,10,0)');
    g.addColorStop(1, 'rgba(60,30,10,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(L * 0.05, -2.6 * S, L * 0.25, 5.2 * S);
  }
  // i cubetti: fitti, quasi quadrati, la carne copre due terzi dello spiedino
  const l = lato * S;
  const passo = l * 0.86;
  const n = Math.max(cubetti, Math.round((L * 0.66) / passo));
  let x = L * 0.27;
  const pezzi = [];
  for (let i = 0; i < n; i += 1) {
    const grasso = caso.n() < (crudo ? 0.24 : 0.2);
    const w = l * caso.tra(0.88, 1.06); const h = l * caso.tra(0.92, 1.12);
    const p = new Path2D();
    p.roundRect(x, -h / 2 + caso.tra(-1.5, 1.5) * S, w, h, 3.5 * S);
    pezzi.push({ p, x, w, h, grasso, rot: caso.tra(-0.12, 0.12) });
    x += passo;
  }
  // ombra unica della fila, poi i cubetti uno sull'altro
  const fila = new Path2D();
  fila.roundRect(L * 0.27, -l * 0.55, x - L * 0.27 + l * 0.14, l * 1.1, 5 * S);
  ombra(ctx, fila, { dx: 3 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.5 });
  for (const { p, x: px, w, h, grasso, rot } of pezzi) {
    let base;
    if (crudo) base = grasso ? [240, 222, 200] : [170, 48, 50];
    else base = grasso ? [196, 132, 62] : [116, 56, 28];
    ctx.save();
    ctx.translate(px + w / 2, 0);
    ctx.rotate(rot);
    ctx.translate(-(px + w / 2), 0);
    const g = ctx.createLinearGradient(px, -h / 2, px + w, h / 2);
    g.addColorStop(0, rgb(scala(base, crudo ? 1.1 : 1.35)));
    g.addColorStop(0.45, rgb(base));
    g.addColorStop(1, rgb(scala(base, crudo ? 0.82 : 0.5)));
    ctx.fillStyle = g;
    ctx.fill(p);
    ctx.save();
    ctx.clip(p);
    if (!crudo) {
      // bordi abbrustoliti e qualche crosticina
      ctx.lineWidth = 3 * S;
      ctx.strokeStyle = 'rgba(45,18,6,0.55)';
      ctx.stroke(p);
      for (let k = 0; k < 3; k += 1) {
        ctx.fillStyle = 'rgba(40,16,5,0.55)';
        ctx.fill(cerchio(px + caso.tra(0, w), caso.tra(-h / 2, h / 2), caso.tra(1, 2.6) * S));
      }
    } else {
      ctx.strokeStyle = 'rgba(255,240,235,0.5)';
      ctx.lineWidth = 1.4 * S;
      ctx.beginPath(); ctx.moveTo(px, caso.tra(-h / 3, h / 3)); ctx.lineTo(px + w, caso.tra(-h / 3, h / 3)); ctx.stroke();
    }
    ctx.restore();
    luce(ctx, px + w * 0.32, -h * 0.22, w * 0.18, h * 0.09, { alfa: crudo ? 0.3 : 0.4, sfoca: 1.2 * S });
    ctx.restore();
  }
  ctx.restore();
}

/* Costoletta d'agnello: l'osso, il grasso, la noce di carne con la griglia. */
export function costoletta(ctx, x, y, scalaK, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(scalaK, scalaK);
  const s = S;
  // l'osso
  const osso = new Path2D();
  osso.moveTo(40 * s, -8 * s);
  osso.bezierCurveTo(90 * s, -10 * s, 140 * s, -6 * s, 168 * s, -11 * s);
  osso.bezierCurveTo(182 * s, -13 * s, 186 * s, 9 * s, 170 * s, 9 * s);
  osso.bezierCurveTo(140 * s, 6 * s, 90 * s, 10 * s, 40 * s, 9 * s);
  osso.closePath();
  ombra(ctx, osso, { dx: 4 * s, dy: 7 * s, sfoca: 6 * s, alfa: 0.4 });
  const go = ctx.createLinearGradient(0, -12 * s, 0, 12 * s);
  go.addColorStop(0, '#f6ead2');
  go.addColorStop(0.6, '#dcc39b');
  go.addColorStop(1, '#a8875c');
  ctx.fillStyle = go;
  ctx.fill(osso);
  // la noce, con il bordo di grasso
  const carne = forma(0, 0, 66 * s, 48 * s, 0.12, caso);
  ctx.save();
  ctx.shadowColor = 'rgba(40,15,5,0.55)';
  ctx.shadowBlur = 10 * s;
  ctx.shadowOffsetX = 4 * s;
  ctx.shadowOffsetY = 7 * s;
  ctx.fillStyle = '#c99556';
  ctx.fill(carne);
  ctx.restore();
  const noce = forma(-4 * s, 2 * s, 54 * s, 37 * s, 0.14, caso);
  const g = ctx.createRadialGradient(-20 * s, -14 * s, 4 * s, 0, 0, 60 * s);
  g.addColorStop(0, '#a35f35');
  g.addColorStop(0.6, '#7b4122');
  g.addColorStop(1, '#4e2612');
  ctx.fillStyle = g;
  ctx.fill(noce);
  // i segni della griglia
  ctx.save();
  ctx.clip(carne);
  ctx.strokeStyle = 'rgba(30,12,4,0.7)';
  ctx.lineWidth = 5 * s;
  ctx.lineCap = 'round';
  for (let k = -2; k <= 2; k += 1) {
    ctx.beginPath(); ctx.moveTo(-60 * s + k * 34 * s, -60 * s); ctx.lineTo(-10 * s + k * 34 * s, 60 * s); ctx.stroke();
  }
  ctx.restore();
  luce(ctx, -22 * s, -16 * s, 20 * s, 8 * s, { alfa: 0.3, sfoca: 3 * s, rot: -0.5 });
  ctx.restore();
}

/* Salsiccia: capsula bruna e lucida, con le righe della griglia. */
export function salsiccia(ctx, x0, y0, x1, y1, raggio, S, caso) {
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const L = Math.hypot(x1 - x0, y1 - y0);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(ang);
  const p = rettangoloTondo(0, -raggio, L, raggio * 2, raggio);
  ombra(ctx, p, { dx: 4 * S, dy: 8 * S, sfoca: 8 * S, alfa: 0.45 });
  const g = ctx.createLinearGradient(0, -raggio, 0, raggio);
  g.addColorStop(0, '#b0683a');
  g.addColorStop(0.35, '#8a4826');
  g.addColorStop(1, '#4a2210');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  ctx.strokeStyle = 'rgba(30,10,3,0.6)';
  ctx.lineWidth = 5 * S;
  for (let k = 1; k < L / (34 * S); k += 1) {
    ctx.beginPath(); ctx.moveTo(k * 34 * S, -raggio); ctx.lineTo(k * 34 * S - 14 * S, raggio); ctx.stroke();
  }
  ctx.restore();
  luce(ctx, L * 0.4, -raggio * 0.45, L * 0.3, raggio * 0.16, { alfa: 0.45, sfoca: 2 * S });
  ctx.restore();
}

/* Fetta di pancetta alla brace: strisce rosa e bianche, bordi croccanti. */
export function pancetta(ctx, x, y, lung, larg, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const punti = [];
  for (let i = 0; i <= 10; i += 1) punti.push([i / 10 * lung, Math.sin(i * 1.1) * 7 * S]);
  const sopra = punti.map(([px, py]) => [px, py - larg / 2]);
  const sotto = punti.map(([px, py]) => [px, py + larg / 2]).reverse();
  const p = new Path2D();
  p.moveTo(...sopra[0]);
  for (const q of sopra.slice(1)) p.lineTo(...q);
  for (const q of sotto) p.lineTo(...q);
  p.closePath();
  ombra(ctx, p, { dx: 3 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.4 });
  ctx.save();
  ctx.clip(p);
  const strisce = [[200, 120, 92], [236, 210, 180], [176, 92, 66], [230, 200, 168], [190, 104, 78]];
  strisce.forEach((c, i) => {
    ctx.fillStyle = rgb(c);
    ctx.fillRect(0, -larg / 2 + (i * larg) / strisce.length - 2 * S, lung, larg / strisce.length + 4 * S);
  });
  const g = ctx.createLinearGradient(0, -larg / 2, 0, larg / 2);
  g.addColorStop(0, 'rgba(90,40,15,0.45)');
  g.addColorStop(0.5, 'rgba(90,40,15,0)');
  g.addColorStop(1, 'rgba(90,40,15,0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(0, -larg, lung, larg * 2);
  ctx.restore();
  ctx.restore();
}

/* ---- Patate, verdure ----------------------------------------------------- */

export function patata(ctx, x, y, r, S, caso) {
  const p = forma(x, y, r, r * caso.tra(0.7, 0.95), 0.2, caso, { rot: caso.tra(0, TAU), punti: 14 });
  ctx.save();
  ctx.shadowColor = 'rgba(60,30,8,0.5)';
  ctx.shadowBlur = r * 0.35;
  ctx.shadowOffsetX = r * 0.15;
  ctx.shadowOffsetY = r * 0.28;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#f5d27e');
  g.addColorStop(0.6, '#dda548');
  g.addColorStop(1, '#a8661f');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  ctx.save();
  ctx.clip(p);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = 'rgba(140,70,15,0.45)';
    ctx.fill(forma(x + caso.gauss() * r * 0.5, y + caso.gauss() * r * 0.5, caso.tra(2, 6) * S, caso.tra(1.5, 4) * S, 0.4, caso));
  }
  ctx.restore();
  luce(ctx, x - r * 0.3, y - r * 0.35, r * 0.3, r * 0.12, { alfa: 0.45, sfoca: 1.5 * S, rot: -0.6 });
}

/* Verdure di campo ripassate: foglie scure, lucide d'olio. */
export function verdureCampo(ctx, cx, cy, R, S, caso, { n = 70 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const a = caso.tra(0, TAU); const d = R * Math.sqrt(caso.n()) * 0.95;
    const x = cx + Math.cos(a) * d; const y = cy + Math.sin(a) * d;
    const verde = caso.scegli([[38, 78, 34], [52, 96, 42], [30, 62, 30], [66, 104, 48]]);
    const p = forma(x, y, caso.tra(16, 34) * S, caso.tra(8, 16) * S, 0.45, caso, { rot: caso.tra(0, TAU) });
    ctx.save();
    ctx.shadowColor = 'rgba(10,25,5,0.5)';
    ctx.shadowBlur = 4 * S;
    ctx.shadowOffsetX = 1.5 * S;
    ctx.shadowOffsetY = 2.5 * S;
    ctx.fillStyle = rgb(verde);
    ctx.fill(p);
    ctx.restore();
    if (caso.n() < 0.4) luce(ctx, x - 4 * S, y - 3 * S, caso.tra(5, 10) * S, 2 * S, { alfa: 0.3, sfoca: 1.2 * S, rot: caso.tra(0, TAU) });
  }
}

export function aglio(ctx, cx, cy, R, S, caso, { n = 8 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * R; const y = cy + caso.gauss() * R;
    const p = ellisse(x, y, caso.tra(5, 8) * S, caso.tra(3.5, 5) * S, caso.tra(0, TAU));
    ctx.save();
    ctx.shadowColor = 'rgba(60,40,20,0.35)';
    ctx.shadowBlur = 2 * S;
    ctx.shadowOffsetY = 1.5 * S;
    ctx.fillStyle = caso.n() < 0.5 ? '#f3e7c4' : '#e6c98c';
    ctx.fill(p);
    ctx.restore();
  }
}

/* Fetta di zucchina o di melanzana grigliata. */
export function grigliata(ctx, x, y, rx, ry, ang, S, { buccia = '#3f6b2c', polpa = '#d8d39a' } = {}) {
  const p = ellisse(x, y, rx, ry, ang);
  ombra(ctx, p, { dx: 3 * S, dy: 5 * S, sfoca: 5 * S, alfa: 0.35 });
  ctx.fillStyle = buccia;
  ctx.fill(p);
  ctx.fillStyle = polpa;
  ctx.fill(ellisse(x, y, rx * 0.88, ry * 0.85, ang));
  ctx.save();
  ctx.clip(p);
  ctx.strokeStyle = 'rgba(40,25,8,0.6)';
  ctx.lineWidth = 4 * S;
  for (let k = -3; k <= 3; k += 1) {
    ctx.beginPath(); ctx.moveTo(x + k * 16 * S - rx, y - ry); ctx.lineTo(x + k * 16 * S + rx * 0.4, y + ry); ctx.stroke();
  }
  ctx.restore();
}

/* ---- Pane, crespelle, pasta ripiena ------------------------------------- */

/* Fetta di pane casereccio, abbrustolita se serve. */
export function fettaPane(ctx, x, y, rx, ry, ang, S, caso, { tostata = false } = {}) {
  const p = forma(x, y, rx, ry, 0.12, caso, { rot: ang });
  ombra(ctx, p, { dx: 5 * S, dy: 9 * S, sfoca: 9 * S, alfa: 0.38 });
  ctx.fillStyle = tostata ? '#8a531f' : '#9b6328';
  ctx.fill(p);
  const mollica = forma(x, y, rx * 0.86, ry * 0.82, 0.14, caso, { rot: ang });
  const rum = creaRumore(caso.int(1, 1e9));
  trama(ctx, mollica, [x - rx, y - ry - rx * 0.3, x + rx, y + ry + rx * 0.3], (px, py) => {
    const n = rum.fbm(px / (6 * S), py / (6 * S), 3);
    const buchi = n < 0.36 ? 0.78 : 1;
    let base = tostata ? [222, 172, 104] : [238, 216, 170];
    if (tostata) {
      const t = rum.fbm(px / (30 * S), py / (30 * S), 2);
      base = mescola(base, [176, 112, 52], clamp((t - 0.4) * 2.2));
    }
    return [base[0] * buchi, base[1] * buchi, base[2] * buchi, 255];
  }, { risoluzione: 1.5 });
  if (tostata) {
    ctx.save();
    ctx.clip(mollica);
    ctx.strokeStyle = 'rgba(90,45,12,0.22)';
    ctx.lineWidth = 6 * S;
    for (let k = -2; k <= 2; k += 1) {
      ctx.beginPath(); ctx.moveTo(x + k * 34 * S - rx, y - ry * 1.5); ctx.lineTo(x + k * 34 * S + rx, y + ry * 1.5); ctx.stroke();
    }
    // l'olio
    luce(ctx, x - rx * 0.2, y - ry * 0.2, rx * 0.5, ry * 0.3, { alfa: 0.18, sfoca: 6 * S, colore: [255, 230, 120] });
    ctx.restore();
  }
}

/* Crespella arrotolata (scrippella) vista dall'alto: un cilindro chiaro
   con le macchioline bruciate e la spirale alle estremità. */
export function scrippella(ctx, x, y, lung, raggio, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = rettangoloTondo(-lung / 2, -raggio, lung, raggio * 2, raggio * 0.9);
  ombra(ctx, p, { dx: 4 * S, dy: 7 * S, sfoca: 7 * S, alfa: 0.35 });
  const g = ctx.createLinearGradient(0, -raggio, 0, raggio);
  g.addColorStop(0, '#fbe9b4');
  g.addColorStop(0.4, '#efd18a');
  g.addColorStop(1, '#c79a4e');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  for (let i = 0; i < 16; i += 1) {
    ctx.fillStyle = `rgba(150,90,30,${caso.tra(0.15, 0.35)})`;
    ctx.fill(forma(caso.tra(-lung / 2, lung / 2), caso.tra(-raggio, raggio), caso.tra(2, 5) * S, caso.tra(1.5, 4) * S, 0.4, caso));
  }
  ctx.restore();
  for (const lato of [-1, 1]) {
    ctx.strokeStyle = 'rgba(160,110,50,0.55)';
    ctx.lineWidth = 1.5 * S;
    ctx.beginPath();
    ctx.ellipse(lato * (lung / 2 - raggio * 0.35), 0, raggio * 0.3, raggio * 0.85, 0, 0, TAU);
    ctx.stroke();
  }
  luce(ctx, 0, -raggio * 0.45, lung * 0.35, raggio * 0.15, { alfa: 0.4, sfoca: 2 * S });
  ctx.restore();
}

/* Raviolo quadrato con il bordo pizzicato e il ripieno in rilievo. */
export function raviolo(ctx, x, y, lato, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const h = lato / 2;
  const bordo = new Path2D();
  const passi = 9;
  const dente = 3 * S;
  const lati = [[-h, -h, h, -h], [h, -h, h, h], [h, h, -h, h], [-h, h, -h, -h]];
  bordo.moveTo(-h, -h);
  for (const [ax, ay, bx, by] of lati) {
    for (let k = 1; k <= passi; k += 1) {
      const t = k / passi;
      const nx = -(by - ay) / lato; const ny = (bx - ax) / lato;
      const off = k % 2 ? dente : 0;
      bordo.lineTo(lerp(ax, bx, t) - nx * off, lerp(ay, by, t) - ny * off);
    }
  }
  bordo.closePath();
  ombra(ctx, bordo, { dx: 3 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.4 });
  ctx.fillStyle = '#f0d590';
  ctx.fill(bordo);
  ctx.strokeStyle = 'rgba(170,120,50,0.5)';
  ctx.lineWidth = 1.2 * S;
  ctx.strokeRect(-h * 0.78, -h * 0.78, h * 1.56, h * 1.56);
  const cupola = forma(0, 0, h * 0.62, h * 0.6, 0.08, caso);
  const g = ctx.createRadialGradient(-h * 0.25, -h * 0.25, 1, 0, 0, h * 0.7);
  g.addColorStop(0, '#fff3cf');
  g.addColorStop(0.7, '#f1d78f');
  g.addColorStop(1, '#d5af62');
  ctx.save();
  ctx.shadowColor = 'rgba(120,80,20,0.35)';
  ctx.shadowBlur = 5 * S;
  ctx.shadowOffsetX = 2 * S;
  ctx.shadowOffsetY = 3 * S;
  ctx.fillStyle = g;
  ctx.fill(cupola);
  ctx.restore();
  luce(ctx, -h * 0.22, -h * 0.25, h * 0.25, h * 0.12, { alfa: 0.45, sfoca: 2 * S, rot: -0.6 });
  ctx.restore();
}

/* Sagne: losanghe di pasta di acqua e farina, un po' storte. */
export function sagna(ctx, x, y, lato, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  const j = () => caso.tra(-2.5, 2.5) * S;
  p.moveTo(-lato + j(), j());
  p.lineTo(j(), -lato * 0.55 + j());
  p.lineTo(lato + j(), j());
  p.lineTo(j(), lato * 0.55 + j());
  p.closePath();
  ctx.save();
  ctx.shadowColor = 'rgba(90,50,15,0.45)';
  ctx.shadowBlur = 4 * S;
  ctx.shadowOffsetX = 2 * S;
  ctx.shadowOffsetY = 3 * S;
  ctx.fillStyle = rgb(scala([236, 204, 140], caso.tra(0.92, 1.04)));
  ctx.fill(p);
  ctx.restore();
  luce(ctx, -lato * 0.2, -lato * 0.12, lato * 0.35, lato * 0.08, { alfa: 0.35, sfoca: 1.5 * S });
  ctx.restore();
}

/* ---- Salumi e formaggi --------------------------------------------------- */

export function fettaSalame(ctx, x, y, r, S, caso, { tipo = 'salame' } = {}) {
  const p = forma(x, y, r, r * caso.tra(0.9, 1), 0.05, caso);
  ombra(ctx, p, { dx: 3 * S, dy: 5 * S, sfoca: 5 * S, alfa: 0.35 });
  const base = tipo === 'ventricina' ? [196, 72, 38] : [150, 34, 42];
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, rgb(scala(base, 1.18)));
  g.addColorStop(1, rgb(scala(base, 0.85)));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  const n = tipo === 'ventricina' ? 26 : 34;
  for (let i = 0; i < n; i += 1) {
    const a = caso.tra(0, TAU); const d = r * Math.sqrt(caso.n()) * 0.9;
    const s = caso.tra(1.8, tipo === 'ventricina' ? 5.5 : 4) * S;
    ctx.fillStyle = tipo === 'ventricina' ? 'rgba(250,220,190,0.85)' : 'rgba(250,236,226,0.92)';
    ctx.fill(forma(x + Math.cos(a) * d, y + Math.sin(a) * d, s, s * caso.tra(0.6, 1), 0.3, caso, { punti: 8 }));
  }
  if (tipo === 'ventricina') {
    for (let i = 0; i < 40; i += 1) {
      ctx.fillStyle = 'rgba(150,30,10,0.5)';
      ctx.fill(cerchio(x + caso.gauss() * r * 0.6, y + caso.gauss() * r * 0.6, caso.tra(0.5, 1.4) * S));
    }
  }
  ctx.restore();
  ctx.strokeStyle = tipo === 'ventricina' ? 'rgba(120,40,20,0.5)' : 'rgba(225,215,205,0.8)';
  ctx.lineWidth = 2.4 * S;
  ctx.stroke(p);
}

/* Lonza o capocollo: fetta ovale rosa scuro col bordo bianco, piegata. */
export function fettaLonza(ctx, x, y, rx, ry, ang, S, caso) {
  const p = forma(x, y, rx, ry, 0.08, caso, { rot: ang });
  ombra(ctx, p, { dx: 3 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.35 });
  ctx.fillStyle = '#efe0d2';
  ctx.fill(p);
  const dentro = forma(x + 3 * S, y + 2 * S, rx * 0.82, ry * 0.75, 0.1, caso, { rot: ang });
  const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 1, x, y, rx);
  g.addColorStop(0, '#c7525a');
  g.addColorStop(1, '#8e2836');
  ctx.fillStyle = g;
  ctx.fill(dentro);
  ctx.save();
  ctx.clip(dentro);
  for (let i = 0; i < 10; i += 1) {
    ctx.strokeStyle = 'rgba(245,225,220,0.45)';
    ctx.lineWidth = caso.tra(0.8, 2) * S;
    ctx.beginPath();
    ctx.moveTo(x + caso.gauss() * rx, y + caso.gauss() * ry);
    ctx.lineTo(x + caso.gauss() * rx, y + caso.gauss() * ry);
    ctx.stroke();
  }
  ctx.restore();
  // la piega: metà in ombra
  ctx.save();
  ctx.clip(p);
  ctx.translate(x, y);
  ctx.rotate(ang + 0.4);
  const gp = ctx.createLinearGradient(-rx, 0, rx, 0);
  gp.addColorStop(0.45, 'rgba(60,15,20,0)');
  gp.addColorStop(0.55, 'rgba(60,15,20,0.3)');
  gp.addColorStop(1, 'rgba(60,15,20,0.05)');
  ctx.fillStyle = gp;
  ctx.fillRect(-rx * 1.5, -ry * 1.5, rx * 3, ry * 3);
  ctx.restore();
}

/* Spicchio di pecorino: crosta brunita e pasta chiara con gli occhietti. */
export function spicchioFormaggio(ctx, x, y, lato, ang, S, caso, { pasta = [240, 226, 184], crosta = [168, 128, 76] } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  p.moveTo(0, -lato * 0.32);
  p.lineTo(lato, -lato * 0.06);
  p.quadraticCurveTo(lato * 1.04, lato * 0.12, lato, lato * 0.3);
  p.lineTo(0, lato * 0.32);
  p.closePath();
  ombra(ctx, p, { dx: 5 * S, dy: 8 * S, sfoca: 7 * S, alfa: 0.4 });
  ctx.fillStyle = rgb(pasta);
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  ctx.fillStyle = rgb(crosta);
  ctx.fillRect(lato * 0.9, -lato, lato * 0.3, lato * 2);
  const g = ctx.createLinearGradient(0, 0, lato, 0);
  g.addColorStop(0, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(120,90,40,0.15)');
  ctx.fillStyle = g;
  ctx.fillRect(0, -lato, lato, lato * 2);
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = 'rgba(170,140,90,0.45)';
    ctx.fill(ellisse(caso.tra(lato * 0.1, lato * 0.85), caso.tra(-lato * 0.2, lato * 0.2), caso.tra(1, 2.6) * S, caso.tra(0.8, 2) * S));
  }
  ctx.restore();
  ctx.restore();
}

/* Miele in ciotolina: ambra lucida. */
export function ciotolaMiele(ctx, cx, cy, R, S, { colore = [214, 140, 30] } = {}) {
  const c = cerchio(cx, cy, R);
  ombra(ctx, c, { dx: 6 * S, dy: 10 * S, sfoca: 9 * S, alfa: 0.3 });
  ctx.fillStyle = '#f5f1e8';
  ctx.fill(c);
  const m = cerchio(cx, cy, R * 0.8);
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 1, cx, cy, R * 0.8);
  g.addColorStop(0, rgb(scala(colore, 1.35)));
  g.addColorStop(1, rgb(scala(colore, 0.75)));
  ctx.fillStyle = g;
  ctx.fill(m);
  luce(ctx, cx - R * 0.35, cy - R * 0.38, R * 0.3, R * 0.12, { alfa: 0.7, sfoca: 1.5 * S, rot: -0.7 });
}

export function noce(ctx, x, y, r, ang, S, caso) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = forma(0, 0, r, r * 0.8, 0.12, caso);
  ombra(ctx, p, { dx: 2 * S, dy: 4 * S, sfoca: 3 * S, alfa: 0.4 });
  ctx.fillStyle = '#a36f3a';
  ctx.fill(p);
  ctx.strokeStyle = 'rgba(70,40,15,0.7)';
  ctx.lineWidth = 1.4 * S;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(caso.tra(-r, r) * 0.7, caso.tra(-r, r) * 0.6);
    ctx.quadraticCurveTo(caso.tra(-r, r) * 0.5, caso.tra(-r, r) * 0.5, caso.tra(-r, r) * 0.7, caso.tra(-r, r) * 0.6);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, -r * 0.75); ctx.lineTo(0, r * 0.75); ctx.stroke();
  ctx.restore();
}

export function oliva(ctx, x, y, r, S, caso, { colore = [62, 44, 58] } = {}) {
  const p = ellisse(x, y, r, r * 0.78, caso.tra(0, TAU));
  ombra(ctx, p, { dx: 2 * S, dy: 4 * S, sfoca: 3 * S, alfa: 0.4 });
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, rgb(scala(colore, 1.8)));
  g.addColorStop(1, rgb(colore));
  ctx.fillStyle = g;
  ctx.fill(p);
  luce(ctx, x - r * 0.35, y - r * 0.3, r * 0.3, r * 0.14, { alfa: 0.6, sfoca: 1 * S, rot: -0.7 });
}

/* ---- Dolci --------------------------------------------------------------- */

/* Bocconotto: cestino di frolla dal bordo ondulato, zucchero a velo. */
export function bocconotto(ctx, x, y, r, S, caso) {
  const onde = 16;
  const punti = [];
  for (let i = 0; i < onde * 4; i += 1) {
    const a = (i / (onde * 4)) * TAU;
    const m = 1 + 0.06 * Math.cos(a * onde);
    punti.push([x + Math.cos(a) * r * m, y + Math.sin(a) * r * m]);
  }
  const p = curvaAperta([...punti, punti[0]]);
  p.closePath();
  ombra(ctx, p, { dx: 6 * S, dy: 10 * S, sfoca: 10 * S, alfa: 0.4 });
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, '#f2c780');
  g.addColorStop(0.7, '#d99a4c');
  g.addColorStop(1, '#a4652a');
  ctx.fillStyle = g;
  ctx.fill(p);
  // le scanalature
  ctx.save();
  ctx.clip(p);
  ctx.strokeStyle = 'rgba(120,70,25,0.35)';
  ctx.lineWidth = 2 * S;
  for (let i = 0; i < onde; i += 1) {
    const a = (i / onde) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78);
    ctx.lineTo(x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05);
    ctx.stroke();
  }
  ctx.restore();
  // la cupola
  const cupola = cerchio(x, y, r * 0.74);
  const gc = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 1, x, y, r * 0.74);
  gc.addColorStop(0, '#f6d394');
  gc.addColorStop(1, '#cf8f45');
  ctx.fillStyle = gc;
  ctx.fill(cupola);
  // zucchero a velo
  ctx.save();
  ctx.clip(p);
  for (let i = 0; i < 260; i += 1) {
    const a = caso.tra(0, TAU); const d = r * Math.sqrt(caso.n());
    ctx.fillStyle = `rgba(255,255,255,${caso.tra(0.35, 0.9)})`;
    ctx.fill(cerchio(x + Math.cos(a) * d - r * 0.1, y + Math.sin(a) * d - r * 0.1, caso.tra(0.6, 1.8) * S));
  }
  ctx.restore();
}

/* Fetta di torta vista dall'alto, con lo spessore a strati su un lato. */
export function fettaTorta(ctx, cx, cy, R, ang, apertura, S, caso, {
  sopra = [246, 238, 222], strati = [[232, 186, 98], [92, 52, 30], [244, 222, 170], [232, 186, 98]], spessore: spess = 38,
} = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  const punta = [-R * 0.5, 0];
  const a = apertura / 2;
  const top = new Path2D();
  top.moveTo(...punta);
  top.lineTo(punta[0] + Math.cos(-a) * R, Math.sin(-a) * R);
  top.arc(punta[0], 0, R, -a, a);
  top.closePath();
  // lo spessore: il lato lungo in basso mostra gli strati
  const spessore = spess * S;
  const lato = new Path2D();
  const bx = punta[0] + Math.cos(a) * R; const by = Math.sin(a) * R;
  lato.moveTo(...punta);
  lato.lineTo(bx, by);
  lato.lineTo(bx, by + spessore);
  lato.lineTo(punta[0], spessore);
  lato.closePath();
  const tutto = new Path2D();
  tutto.addPath(top);
  tutto.addPath(lato);
  ombra(ctx, tutto, { dx: 8 * S, dy: 14 * S, sfoca: 14 * S, alfa: 0.4 });
  ctx.save();
  ctx.clip(lato);
  strati.forEach((c, i) => {
    ctx.fillStyle = rgb(c);
    ctx.save();
    ctx.translate(0, (i * spessore) / strati.length);
    ctx.beginPath();
    ctx.moveTo(punta[0], 0); ctx.lineTo(bx, by); ctx.lineTo(bx, by + spessore); ctx.lineTo(punta[0], spessore);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
  const g = ctx.createRadialGradient(punta[0] + R * 0.3, -R * 0.1, 2, punta[0] + R * 0.5, 0, R);
  g.addColorStop(0, rgb(scala(sopra, 1.02)));
  g.addColorStop(1, rgb(scala(sopra, 0.92)));
  ctx.fillStyle = g;
  ctx.fill(top);
  ctx.restore();
  return { punta, R };
}

/* Scaglie di cioccolato e lamelle di mandorla tostata. */
export function scaglieCioccolato(ctx, cx, cy, R, S, caso, { n = 30 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * R; const y = cy + caso.gauss() * R;
    ctx.save();
    ctx.shadowColor = 'rgba(30,15,5,0.35)';
    ctx.shadowBlur = 1.5 * S;
    ctx.shadowOffsetY = 1.2 * S;
    ctx.fillStyle = caso.scegli(['#4a2a18', '#5e3820', '#3a1f10']);
    ctx.fill(forma(x, y, caso.tra(2, 6) * S, caso.tra(1.2, 3) * S, 0.4, caso, { rot: caso.tra(0, TAU), punti: 10 }));
    ctx.restore();
  }
}

export function mandorle(ctx, cx, cy, R, S, caso, { n = 14 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const x = cx + caso.gauss() * R; const y = cy + caso.gauss() * R;
    const p = ellisse(x, y, caso.tra(7, 10) * S, caso.tra(3.5, 5) * S, caso.tra(0, TAU));
    ctx.save();
    ctx.shadowColor = 'rgba(60,35,10,0.35)';
    ctx.shadowBlur = 2 * S;
    ctx.shadowOffsetY = 1.5 * S;
    ctx.fillStyle = caso.scegli(['#e8c48e', '#d9a865', '#f0d4a6']);
    ctx.fill(p);
    ctx.restore();
  }
}

/* ---- Tartufo -------------------------------------------------------------- */

export function lamellaTartufo(ctx, x, y, r, S, caso) {
  const p = forma(x, y, r, r * caso.tra(0.75, 0.95), 0.12, caso, { rot: caso.tra(0, TAU) });
  ctx.save();
  ctx.shadowColor = 'rgba(30,20,10,0.4)';
  ctx.shadowBlur = 2.5 * S;
  ctx.shadowOffsetX = 1 * S;
  ctx.shadowOffsetY = 2 * S;
  ctx.fillStyle = '#3e3029';
  ctx.fill(p);
  ctx.restore();
  ctx.save();
  ctx.clip(p);
  ctx.strokeStyle = 'rgba(214,196,176,0.55)';
  ctx.lineWidth = 0.9 * S;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + caso.gauss() * r, y + caso.gauss() * r);
    ctx.bezierCurveTo(x + caso.gauss() * r, y + caso.gauss() * r, x + caso.gauss() * r, y + caso.gauss() * r, x + caso.gauss() * r, y + caso.gauss() * r);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(25,18,14,0.6)';
  ctx.lineWidth = 1.5 * S;
  ctx.stroke(p);
}

export function tartufoIntero(ctx, x, y, r, S, caso) {
  const p = forma(x, y, r, r * 0.88, 0.1, caso, { punti: 40 });
  ombra(ctx, p, { dx: 6 * S, dy: 10 * S, sfoca: 10 * S, alfa: 0.45 });
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, '#4f4038');
  g.addColorStop(1, '#16110e');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  for (let i = 0; i < 160; i += 1) {
    const a = caso.tra(0, TAU); const d = r * Math.sqrt(caso.n());
    const px = x + Math.cos(a) * d; const py = y + Math.sin(a) * d;
    ctx.fillStyle = caso.n() < 0.5 ? 'rgba(110,90,78,0.4)' : 'rgba(5,3,2,0.45)';
    ctx.fill(cerchio(px, py, caso.tra(1.2, 3) * S));
  }
  ctx.restore();
}
