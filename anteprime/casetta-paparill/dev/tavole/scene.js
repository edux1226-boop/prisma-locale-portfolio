/* Le altre tavole: la sala, la cucina, la homepage, l'immagine social,
   il piatto vuoto della pagina 404. */
import {
  TAU, clamp, cerchio, ellisse, forma, ombra, ombraInterna, luce, rgb, scala, mescola, creaRumore, trama,
  rettangoloTondo, curvaAperta,
} from './base.js';
import { lino, legno, tavolo, quadri, carta } from './fondi.js';
import {
  piatto, tagliere, forchetta, coltello, cucchiaino, calice, bottiglia, tovagliolo, cestino, tazzina,
  mattarello, BLU,
} from './stoviglie.js';
import {
  nidoPasta, sugo, polpetta, grattugiato, basilico, foglia, rosmarino, arrosticino, fettaPane, oliva,
  bocconotto, fettaSalame, spicchioFormaggio,
} from './cibi.js';

/* ---- Pezzi in più -------------------------------------------------------- */

function candela(ctx, cx, cy, r, S) {
  // il piattino, la cera, la fiamma vista dall'alto (un punto di luce)
  ombra(ctx, cerchio(cx, cy, r * 1.6), { dx: 6 * S, dy: 10 * S, sfoca: 10 * S, alfa: 0.25 });
  ctx.fillStyle = '#d9d2c4';
  ctx.fill(cerchio(cx, cy, r * 1.6));
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  g.addColorStop(0, '#fffaf0');
  g.addColorStop(1, '#e9dfcb');
  ctx.fillStyle = g;
  ctx.fill(cerchio(cx, cy, r));
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  luce(ctx, cx, cy, r * 2.6, r * 2.6, { alfa: 0.35, sfoca: r * 2, colore: [255, 190, 90] });
  luce(ctx, cx, cy, r * 0.5, r * 0.5, { alfa: 1, sfoca: r * 0.4, colore: [255, 240, 200] });
  ctx.restore();
}

function oliera(ctx, cx, cy, r, S) {
  ombra(ctx, cerchio(cx, cy, r), { dx: 10 * S, dy: 16 * S, sfoca: 14 * S, alfa: 0.3 });
  ctx.save();
  ctx.filter = `blur(${10 * S}px)`;
  ctx.fillStyle = 'rgba(180,160,40,0.25)';
  ctx.fill(ellisse(cx + r * 0.5, cy + r * 0.7, r * 0.9, r * 0.7));
  ctx.restore();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  g.addColorStop(0, 'rgba(230,220,120,0.95)');
  g.addColorStop(0.7, 'rgba(170,150,30,0.95)');
  g.addColorStop(1, 'rgba(110,100,20,0.95)');
  ctx.fillStyle = g;
  ctx.fill(cerchio(cx, cy, r));
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2.5 * S;
  ctx.stroke(cerchio(cx, cy, r));
  // il becco
  ctx.fillStyle = '#c9ccce';
  ctx.fill(cerchio(cx, cy, r * 0.3));
  ctx.fillStyle = '#8e9397';
  ctx.fill(rettangoloTondo(cx, cy - 5 * S, r * 0.9, 10 * S, 5 * S));
  luce(ctx, cx - r * 0.4, cy - r * 0.45, r * 0.3, r * 0.1, { alfa: 0.7, sfoca: 2 * S, rot: -0.7 });
}

function ciotolina(ctx, cx, cy, r, S, contenuto) {
  ombra(ctx, cerchio(cx, cy, r), { dx: 6 * S, dy: 10 * S, sfoca: 9 * S, alfa: 0.3 });
  ctx.fillStyle = '#f6f2ea';
  ctx.fill(cerchio(cx, cy, r));
  ctx.strokeStyle = rgb(BLU, 0.8);
  ctx.lineWidth = 2 * S;
  ctx.stroke(cerchio(cx, cy, r * 0.92));
  ombraInterna(ctx, cerchio(cx, cy, r * 0.82), { dx: 4 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.25, spessore: 12 * S });
  ctx.save();
  ctx.clip(cerchio(cx, cy, r * 0.8));
  contenuto?.(cx, cy, r * 0.8);
  ctx.restore();
}

/* Pane a fette nel cestino. */
function cestinoPane(ctx, cx, cy, rx, ry, S, caso, rot = 0) {
  cestino(ctx, cx, cy, rx, ry, S, caso, { rot });
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  tovagliolo(ctx, -rx * 0.1, -ry * 0.05, rx * 1.1, ry * 1.05, 0.15, S, caso.figlio('tov'));
  for (let i = 0; i < 4; i += 1) fettaPane(ctx, -rx * 0.3 + i * rx * 0.22, -ry * 0.1 + (i % 2) * ry * 0.18, rx * 0.36, ry * 0.42, 0.3 + i * 0.25, S, caso.figlio(`f${i}`));
  ctx.restore();
}

/* Un piatto piccolo di pasta, per le tavolate viste da lontano. */
function piattoPasta(ctx, cx, cy, R, S, caso) {
  const { conca } = piatto(ctx, cx, cy, R, S);
  nidoPasta(ctx, cx, cy, conca * 0.9, S, caso.figlio('n'), { fili: 70, spessore: 6 });
  sugo(ctx, cx, cy, conca * 0.5, S, caso.figlio('s'));
  for (let i = 0; i < 10; i += 1) polpetta(ctx, cx + caso.gauss() * conca * 0.3, cy + caso.gauss() * conca * 0.3, 9 * S, S, caso);
  grattugiato(ctx, cx, cy, conca * 0.2, S, caso, { n: 50 });
}

/* La spianatoia: legno chiaro su tutta la tavola, infarinato. */
function spianatoia(ctx, w, h, S, caso, { farina = 0.5 } = {}) {
  const tutto = new Path2D();
  tutto.rect(0, 0, w, h);
  legno(ctx, tutto, [0, 0, w, h], S, caso.figlio('legno'), { base: [214, 170, 112], dir: 0.03, contrasto: 0.8 });
  const rum = creaRumore(caso.int(1, 1e9));
  trama(ctx, null, [0, 0, w, h], (x, y) => {
    const n = rum.fbm(x / (120 * S), y / (120 * S), 4);
    const a = clamp((n - (1 - farina)) * 3) * 200;
    return [250, 246, 238, a];
  }, { risoluzione: 3 });
  for (let i = 0; i < 900 * farina; i += 1) {
    ctx.fillStyle = `rgba(255,253,248,${caso.tra(0.3, 0.8)})`;
    ctx.fill(cerchio(caso.tra(0, w), caso.tra(0, h), caso.tra(0.7, 2.2) * S));
  }
}

function uovo(ctx, x, y, r, S, caso) {
  // albume trasparente e tuorlo lucido
  ctx.fillStyle = 'rgba(255,250,235,0.55)';
  ctx.fill(forma(x + r * 0.2, y + r * 0.1, r * 2, r * 1.7, 0.2, caso));
  ctx.save();
  ctx.shadowColor = 'rgba(120,70,0,0.45)';
  ctx.shadowBlur = r * 0.4;
  ctx.shadowOffsetX = r * 0.15;
  ctx.shadowOffsetY = r * 0.25;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, '#ffd66b');
  g.addColorStop(0.7, '#f5a623');
  g.addColorStop(1, '#d9800c');
  ctx.fillStyle = g;
  ctx.fill(cerchio(x, y, r));
  ctx.restore();
  luce(ctx, x - r * 0.35, y - r * 0.35, r * 0.28, r * 0.14, { alfa: 0.8, sfoca: r * 0.08, rot: -0.7 });
}

function guscio(ctx, x, y, r, ang, S) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const p = new Path2D();
  p.moveTo(-r, 0);
  p.bezierCurveTo(-r, -r * 1.2, r, -r * 1.2, r, 0);
  p.lineTo(r * 0.6, r * 0.12); p.lineTo(r * 0.3, -r * 0.05); p.lineTo(0, r * 0.15); p.lineTo(-r * 0.35, -r * 0.02); p.lineTo(-r * 0.7, r * 0.12);
  p.closePath();
  ombra(ctx, p, { dx: 4 * S, dy: 7 * S, sfoca: 6 * S, alfa: 0.3 });
  const g = ctx.createLinearGradient(0, -r, 0, r * 0.2);
  g.addColorStop(0, '#f3e2c7');
  g.addColorStop(1, '#d5b48c');
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
}

/* La chitarra: telaio di legno con le corde d'acciaio. */
function strumentoChitarra(ctx, x, y, w, h, S, caso) {
  const telaio = rettangoloTondo(x, y, w, h, 10 * S);
  ombra(ctx, telaio, { dx: 12 * S, dy: 18 * S, sfoca: 18 * S, alfa: 0.4 });
  legno(ctx, telaio, [x, y, x + w, y + h], S, caso.figlio('telaio'), { base: [150, 96, 52], dir: Math.PI / 2 });
  const dentro = rettangoloTondo(x + 34 * S, y + 30 * S, w - 68 * S, h - 60 * S, 4 * S);
  ctx.fillStyle = 'rgba(40,22,8,0.8)';
  ctx.fill(dentro);
  ctx.save();
  ctx.clip(dentro);
  const n = Math.floor((w - 68 * S) / (7 * S));
  for (let i = 0; i <= n; i += 1) {
    const cx = x + 34 * S + i * 7 * S;
    ctx.strokeStyle = 'rgba(40,40,40,0.6)';
    ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.moveTo(cx + 1.5 * S, y); ctx.lineTo(cx + 1.5 * S, y + h); ctx.stroke();
    ctx.strokeStyle = '#d9dcde';
    ctx.lineWidth = 1.4 * S;
    ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h); ctx.stroke();
  }
  ctx.restore();
  // le traverse coi chiodini
  for (const yy of [y + 15 * S, y + h - 15 * S]) {
    for (let i = 0; i <= n; i += 3) {
      ctx.fillStyle = '#9ea3a6';
      ctx.fill(cerchio(x + 34 * S + i * 7 * S, yy, 2.4 * S));
    }
  }
}

/* La sfoglia: un grande foglio irregolare di pasta all'uovo. */
function sfoglia(ctx, cx, cy, rx, ry, S, caso, { rot = 0, colore = [244, 214, 140] } = {}) {
  const p = forma(cx, cy, rx, ry, 0.07, caso, { rot, punti: 36 });
  ombra(ctx, p, { dx: 4 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.25 });
  const rum = creaRumore(caso.int(1, 1e9));
  trama(ctx, p, [cx - rx * 1.3, cy - ry * 1.3, cx + rx * 1.3, cy + ry * 1.3], (x, y) => {
    const n = rum.fbm(x / (40 * S), y / (40 * S), 4);
    const k = 0.94 + n * 0.1;
    return [colore[0] * k, colore[1] * k, colore[2] * k, 255];
  }, { risoluzione: 2 });
  ctx.save();
  ctx.clip(p);
  for (let i = 0; i < 400; i += 1) {
    ctx.fillStyle = `rgba(255,252,240,${caso.tra(0.2, 0.6)})`;
    ctx.fill(cerchio(cx + caso.gauss() * rx * 0.6, cy + caso.gauss() * ry * 0.6, caso.tra(0.6, 1.8) * S));
  }
  ctx.restore();
  return p;
}

/* La canala: la griglia lunga e stretta degli arrosticini, con la brace. */
function canala(ctx, x, y, w, h, S, caso) {
  const corpo = rettangoloTondo(x, y, w, h, 6 * S);
  ombra(ctx, corpo, { dx: 12 * S, dy: 18 * S, sfoca: 18 * S, alfa: 0.45 });
  ctx.fillStyle = '#2b2b2c';
  ctx.fill(corpo);
  const dentro = rettangoloTondo(x + 14 * S, y + 14 * S, w - 28 * S, h - 28 * S, 3 * S);
  const rum = creaRumore(caso.int(1, 1e9));
  trama(ctx, dentro, [x, y, x + w, y + h], (px, py) => {
    const n = rum.fbm(px / (14 * S), py / (14 * S), 4);
    const m = rum.fbm(px / (60 * S), py / (60 * S), 2);
    const brace = clamp((n - 0.42) * 2.6) * (0.6 + m * 0.6);
    const c = mescola(mescola([22, 18, 16], [150, 30, 8], clamp(brace * 1.4)), [255, 170, 60], clamp((brace - 0.55) * 2.2));
    return [...c, 255];
  }, { risoluzione: 2 });
  // il bagliore sopra la brace
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.clip(dentro);
  luce(ctx, x + w / 2, y + h / 2, w * 0.45, h * 0.6, { alfa: 0.25, sfoca: 30 * S, colore: [255, 120, 40] });
  ctx.restore();
  ctx.strokeStyle = '#5a5b5d';
  ctx.lineWidth = 3 * S;
  ctx.stroke(corpo);
}

/* ---- Le scene ------------------------------------------------------------- */

export const SCENE = {
  /* La homepage, orizzontale: il piatto a destra, a sinistra spazio per il testo. */
  hero(ctx, w, h, S, caso) {
    const verticale = h > w;
    lino(ctx, w, h, S, caso.figlio('lino'));
    if (verticale) {
      const cx = w * 0.5; const cy = h * 0.27; const R = w * 0.42;
      cestinoPane(ctx, w * 0.06, h * 0.06, 230 * S, 170 * S, S, caso.figlio('pane'), 0.4);
      calice(ctx, w * 0.9, h * 0.07, 78 * S, S);
      forchetta(ctx, w * 0.93, h * 0.62, 330 * S, -Math.PI / 2 - 0.05, S);
      piattoGrande(ctx, cx, cy, R, S, caso);
      basilico(ctx, w * 0.9, h * 0.42, S, caso, { foglie: 3, scala: 1.2 });
      ciotolina(ctx, w * 0.16, h * 0.44, 62 * S, S, (x, y, r) => grattugiato(ctx, x, y, r * 0.5, S, caso, { n: 220 }));
    } else {
      const cx = w * 0.69; const cy = h * 0.52; const R = h * 0.37;
      tovagliolo(ctx, w * 0.44, h * 0.62, 260 * S, 520 * S, 0.06, S, caso.figlio('tov'));
      forchetta(ctx, w * 0.445, h * 0.9, 380 * S, -Math.PI / 2 + 0.06, S);
      cestinoPane(ctx, w * 0.97, h * 0.93, 260 * S, 190 * S, S, caso.figlio('pane'), -0.3);
      calice(ctx, w * 0.92, h * 0.16, 84 * S, S);
      piattoGrande(ctx, cx, cy, R, S, caso);
      ciotolina(ctx, w * 0.56, h * 0.11, 64 * S, S, (x, y, r) => grattugiato(ctx, x, y, r * 0.5, S, caso, { n: 220 }));
      basilico(ctx, w * 0.9, h * 0.62, S, caso, { foglie: 3, scala: 1.2 });
      for (let i = 0; i < 4; i += 1) foglia(ctx, w * caso.tra(0.2, 0.36), h * caso.tra(0.15, 0.85), 60 * S, 24 * S, caso.tra(0, TAU), S);
    }
  },

  'tavola-per-due'(ctx, w, h, S, caso) {
    quadri(ctx, w, h, S, caso, { lato: 52, rot: 0 });
    const posti = [[w * 0.28, h * 0.5, -1], [w * 0.72, h * 0.5, 1]];
    bottiglia(ctx, w * 0.5, h * 0.2, 58 * S, S);
    candela(ctx, w * 0.5, h * 0.78, 30 * S, S);
    cestinoPane(ctx, w * 0.5, h * 0.48, 120 * S, 88 * S, S, caso.figlio('pane'));
    for (const [x, y, lato] of posti) {
      piatto(ctx, x, y, 175 * S, S);
      tovagliolo(ctx, x, y, 120 * S, 190 * S, lato * 0.12, S, caso.figlio(`t${lato}`));
      forchetta(ctx, x - lato * 215 * S, y + 150 * S, 290 * S, -Math.PI / 2, S);
      coltello(ctx, x + lato * 215 * S, y + 150 * S, 280 * S, -Math.PI / 2, S);
      calice(ctx, x + lato * 150 * S, y - 200 * S, 52 * S, S);
    }
  },

  tavolata(ctx, w, h, S, caso) {
    tavolo(ctx, w, h, S, caso.figlio('tavolo'), { base: [140, 92, 56], assi: 6 });
    // il runner di lino al centro
    ctx.save();
    const runner = new Path2D();
    runner.rect(0, h * 0.34, w, h * 0.32);
    ombra(ctx, runner, { dx: 0, dy: 6 * S, sfoca: 8 * S, alfa: 0.25 });
    ctx.clip(runner);
    lino(ctx, w, h, S, caso.figlio('runner'));
    ctx.fillStyle = rgb(BLU, 0.85);
    ctx.fillRect(0, h * 0.36, w, 8 * S);
    ctx.fillRect(0, h * 0.635, w, 8 * S);
    ctx.restore();
    tagliere(ctx, w * 0.36, h * 0.38, w * 0.28, h * 0.22, S, caso.figlio('tagliere'), { manico: false, r: 16 });
    for (let i = 0; i < 6; i += 1) fettaSalame(ctx, w * 0.395 + i * 36 * S, h * 0.44, 32 * S, S, caso);
    for (let i = 0; i < 2; i += 1) spicchioFormaggio(ctx, w * 0.42 + i * 110 * S, h * 0.535, 100 * S, -0.1, S, caso);
    bottiglia(ctx, w * 0.22, h * 0.5, 44 * S, S);
    bottiglia(ctx, w * 0.8, h * 0.48, 44 * S, S, { vetro: [40, 60, 30], capsula: [190, 160, 70] });
    cestinoPane(ctx, w * 0.11, h * 0.5, 90 * S, 66 * S, S, caso.figlio('pane'));
    for (let i = 0; i < 3; i += 1) {
      for (const lato of [-1, 1]) {
        const x = w * (0.2 + i * 0.3); const y = h * 0.5 + lato * h * 0.34;
        piattoPasta(ctx, x, y, 118 * S, S, caso.figlio(`p${i}${lato}`));
        calice(ctx, x + 125 * S, y - lato * 110 * S, 38 * S, S);
        forchetta(ctx, x - 145 * S, y + 90 * S, 200 * S, -Math.PI / 2, S);
      }
    }
  },

  calici(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    bottiglia(ctx, w * 0.8, h * 0.24, 80 * S, S);
    calice(ctx, w * 0.3, h * 0.33, 140 * S, S, { vino: [104, 12, 30] });
    calice(ctx, w * 0.56, h * 0.6, 140 * S, S, { vino: [214, 70, 82], livello: 0.55 });
    calice(ctx, w * 0.24, h * 0.74, 130 * S, S, { vino: [236, 206, 120], livello: 0.5 });
    // il tappo e il cavatappi
    const tappo = rettangoloTondo(w * 0.7, h * 0.66, 70 * S, 30 * S, 8 * S);
    ombra(ctx, tappo, { dx: 4 * S, dy: 7 * S, sfoca: 6 * S, alfa: 0.35 });
    ctx.fillStyle = '#c8a26b';
    ctx.fill(tappo);
    ctx.fillStyle = 'rgba(120,20,40,0.6)';
    ctx.fill(rettangoloTondo(w * 0.7, h * 0.66, 14 * S, 30 * S, 6 * S));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#8e9397';
    ctx.lineWidth = 5 * S;
    ctx.shadowColor = 'rgba(40,30,20,0.4)';
    ctx.shadowBlur = 5 * S;
    ctx.shadowOffsetY = 4 * S;
    ctx.beginPath();
    for (let t = 0; t < 1; t += 0.02) {
      const x = w * 0.72 + t * 170 * S; const y = h * 0.8 + Math.sin(t * 30) * 9 * S;
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#5a3a20';
    ctx.fill(rettangoloTondo(w * 0.66, h * 0.77, 70 * S, 22 * S, 10 * S));
    ctx.restore();
  },

  'pane-olio'(ctx, w, h, S, caso) {
    tavolo(ctx, w, h, S, caso.figlio('tavolo'), { base: [150, 100, 60], assi: 4 });
    tovagliolo(ctx, w * 0.42, h * 0.5, 520 * S, 360 * S, -0.05, S, caso.figlio('tov'));
    cestinoPane(ctx, w * 0.38, h * 0.48, 270 * S, 200 * S, S, caso.figlio('pane'), -0.1);
    oliera(ctx, w * 0.78, h * 0.3, 70 * S, S);
    ciotolina(ctx, w * 0.78, h * 0.72, 92 * S, S, (x, y, r) => {
      for (let i = 0; i < 14; i += 1) oliva(ctx, x + caso.gauss() * r * 0.4, y + caso.gauss() * r * 0.4, 16 * S, S, caso, { colore: caso.n() < 0.5 ? [62, 44, 58] : [96, 104, 40] });
    });
    rosmarino(ctx, w * 0.62, h * 0.9, 220 * S, -0.2, S, caso);
  },

  cantina(ctx, w, h, S, caso) {
    // lo scaffale visto di fronte, con i fondi delle bottiglie
    const tutto = new Path2D();
    tutto.rect(0, 0, w, h);
    legno(ctx, tutto, [0, 0, w, h], S, caso.figlio('legno'), { base: [96, 60, 34], dir: Math.PI / 2 });
    const cella = 132 * S;
    const nx = Math.ceil(w / cella) + 1; const ny = Math.ceil(h / cella) + 1;
    for (let j = 0; j < ny; j += 1) {
      for (let i = 0; i < nx; i += 1) {
        const x = i * cella - (j % 2) * cella * 0.5; const y = j * cella * 0.86;
        const buco = cerchio(x, y, cella * 0.46);
        ctx.fillStyle = '#1a0f08';
        ctx.fill(buco);
        if (caso.n() < 0.08) continue;
        const vetro = caso.scegli([[22, 46, 28], [40, 26, 16], [28, 40, 22], [60, 40, 18]]);
        const r = cella * 0.38;
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r);
        g.addColorStop(0, rgb(scala(vetro, 2.6)));
        g.addColorStop(0.6, rgb(vetro));
        g.addColorStop(1, rgb(scala(vetro, 0.5)));
        ctx.fillStyle = g;
        ctx.fill(cerchio(x, y, r));
        ctx.fillStyle = rgb(scala(vetro, 0.55));
        ctx.fill(cerchio(x, y, r * 0.42));
        ctx.strokeStyle = rgb(scala(vetro, 2), 0.6);
        ctx.lineWidth = 2 * S;
        ctx.stroke(cerchio(x, y, r * 0.42));
        luce(ctx, x - r * 0.45, y - r * 0.4, r * 0.32, r * 0.1, { alfa: 0.55, sfoca: 2 * S, rot: -0.8, colore: [255, 230, 190] });
      }
    }
    // luce calda dall'alto
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,200,120,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },

  luci(ctx, w, h, S, caso) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0e1d2b');
    g.addColorStop(1, '#1d2f3d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 70; i += 1) {
      const r = caso.tra(20, 90) * S;
      luce(ctx, caso.tra(0, w), caso.tra(h * 0.3, h), r, r, { alfa: caso.tra(0.12, 0.4), sfoca: r * 0.25, colore: caso.scegli([[255, 190, 100], [255, 160, 70], [255, 220, 150]]) });
    }
    // il filo di lampadine, a fuoco
    for (const [y0, fase] of [[h * 0.16, 0], [h * 0.34, 0.5]]) {
      ctx.strokeStyle = 'rgba(30,24,18,0.9)';
      ctx.lineWidth = 2.5 * S;
      const punti = [];
      for (let t = 0; t <= 1.0001; t += 0.05) punti.push([t * w, y0 + Math.sin(t * Math.PI * 2 + fase) * 40 * S + Math.sin(t * Math.PI) * 60 * S]);
      ctx.stroke(curvaAperta(punti));
      for (let k = 1; k < 10; k += 1) {
        const t = k / 10 + fase * 0.05;
        const x = t * w; const y = y0 + Math.sin(t * Math.PI * 2 + fase) * 40 * S + Math.sin(t * Math.PI) * 60 * S + 22 * S;
        luce(ctx, x, y, 46 * S, 46 * S, { alfa: 0.35, sfoca: 30 * S, colore: [255, 180, 80] });
        luce(ctx, x, y, 11 * S, 15 * S, { alfa: 1, sfoca: 3 * S, colore: [255, 236, 190] });
      }
    }
    ctx.restore();
  },

  caffe(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    tovagliolo(ctx, w * 0.16, h * 0.78, 300 * S, 220 * S, 0.12, S, caso.figlio('tov'));
    tazzina(ctx, w * 0.36, h * 0.38, 96 * S, S, { manico: 0.5 });
    tazzina(ctx, w * 0.6, h * 0.66, 96 * S, S, { manico: -2.6 });
    cucchiaino(ctx, w * 0.1, h * 0.56, 190 * S, 0.25, S);
    piatto(ctx, w * 0.8, h * 0.3, 150 * S, S);
    bocconotto(ctx, w * 0.8, h * 0.3, 78 * S, S, caso);
    for (let i = 0; i < 30; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${caso.tra(0.4, 0.9)})`;
      ctx.fill(cerchio(w * 0.8 + caso.gauss() * 70 * S, h * 0.3 + caso.gauss() * 70 * S, caso.tra(0.6, 1.5) * S));
    }
  },

  'casetta-sera'(ctx, w, h, S, caso) {
    // il cielo dopo il tramonto
    const cielo = ctx.createLinearGradient(0, 0, 0, h * 0.8);
    cielo.addColorStop(0, '#13283c');
    cielo.addColorStop(0.55, '#3d4b66');
    cielo.addColorStop(0.85, '#c9876a');
    cielo.addColorStop(1, '#e8b27a');
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = `rgba(255,250,235,${caso.tra(0.2, 0.8)})`;
      ctx.fill(cerchio(caso.tra(0, w), caso.tra(0, h * 0.4), caso.tra(0.5, 1.6) * S));
    }
    luce(ctx, w * 0.82, h * 0.16, 26 * S, 26 * S, { alfa: 0.95, sfoca: 3 * S, colore: [255, 246, 220] });
    luce(ctx, w * 0.82, h * 0.16, 70 * S, 70 * S, { alfa: 0.2, sfoca: 40 * S, colore: [255, 246, 220] });
    // le colline
    const colline = [[0.62, '#2c3a4a'], [0.7, '#24303c'], [0.8, '#1b252e']];
    for (const [y, c] of colline) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 20 * S) ctx.lineTo(x, h * y + Math.sin(x / (230 * S) + y * 9) * 30 * S + Math.sin(x / (90 * S)) * 8 * S);
      ctx.lineTo(w, h);
      ctx.fill();
    }
    // la casetta di pietra
    const cx = w * 0.46; const base = h * 0.86; const lw = 520 * S; const lh = 330 * S;
    const muro = new Path2D();
    muro.rect(cx - lw / 2, base - lh, lw, lh);
    const rum = creaRumore(caso.int(1, 1e9));
    trama(ctx, muro, [cx - lw / 2, base - lh, cx + lw / 2, base], (x, y) => {
      const n = rum.fbm(x / (22 * S), y / (16 * S), 3);
      const pietre = Math.abs(Math.sin(x / (34 * S) + Math.floor(y / (26 * S)) * 1.7)) < 0.08 || (y % (26 * S)) < 2 * S;
      const c = mescola([196, 162, 120], [150, 116, 82], n);
      const k = pietre ? 0.72 : 1;
      return [c[0] * k, c[1] * k, c[2] * k, 255];
    }, { risoluzione: 1.5 });
    // ombra della sera sul muro (luce calda da destra)
    const om = ctx.createLinearGradient(cx - lw / 2, 0, cx + lw / 2, 0);
    om.addColorStop(0, 'rgba(20,30,50,0.45)');
    om.addColorStop(1, 'rgba(20,30,50,0.15)');
    ctx.fillStyle = om;
    ctx.fill(muro);
    // il tetto di coppi
    const tetto = new Path2D();
    tetto.moveTo(cx - lw / 2 - 40 * S, base - lh + 6 * S);
    tetto.lineTo(cx, base - lh - 170 * S);
    tetto.lineTo(cx + lw / 2 + 40 * S, base - lh + 6 * S);
    tetto.closePath();
    ctx.fillStyle = '#8a3d24';
    ctx.fill(tetto);
    ctx.save();
    ctx.clip(tetto);
    for (let y = base - lh - 170 * S; y < base - lh + 10 * S; y += 18 * S) {
      ctx.strokeStyle = 'rgba(50,18,8,0.55)';
      ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.moveTo(cx - lw, y); ctx.lineTo(cx + lw, y); ctx.stroke();
      for (let x = cx - lw; x < cx + lw; x += 26 * S) {
        ctx.fillStyle = 'rgba(200,110,70,0.25)';
        ctx.fill(ellisse(x + ((y / (18 * S)) % 2) * 13 * S, y + 9 * S, 10 * S, 7 * S));
      }
    }
    ctx.restore();
    // il comignolo e il fumo
    ctx.fillStyle = '#6e3a22';
    ctx.fillRect(cx + 120 * S, base - lh - 150 * S, 44 * S, 110 * S);
    ctx.fillStyle = '#4a2616';
    ctx.fillRect(cx + 112 * S, base - lh - 160 * S, 60 * S, 16 * S);
    for (let i = 0; i < 6; i += 1) luce(ctx, cx + 150 * S + i * 18 * S, base - lh - 190 * S - i * 34 * S, 26 * S + i * 6 * S, 18 * S + i * 4 * S, { alfa: 0.12, sfoca: 14 * S, colore: [220, 225, 235] });
    // finestre accese e porta ad arco
    const finestra = (fx, fy, fw, fh) => {
      const f = rettangoloTondo(fx, fy, fw, fh, 4 * S);
      ctx.fillStyle = '#4a2c18';
      ctx.fill(rettangoloTondo(fx - 7 * S, fy - 7 * S, fw + 14 * S, fh + 14 * S, 5 * S));
      const g = ctx.createRadialGradient(fx + fw / 2, fy + fh * 0.6, 2, fx + fw / 2, fy + fh / 2, fh);
      g.addColorStop(0, '#ffe7a3');
      g.addColorStop(1, '#f2a541');
      ctx.fillStyle = g;
      ctx.fill(f);
      ctx.strokeStyle = '#4a2c18';
      ctx.lineWidth = 4 * S;
      ctx.beginPath(); ctx.moveTo(fx + fw / 2, fy); ctx.lineTo(fx + fw / 2, fy + fh); ctx.moveTo(fx, fy + fh / 2); ctx.lineTo(fx + fw, fy + fh / 2); ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      luce(ctx, fx + fw / 2, fy + fh / 2, fw * 1.3, fh * 1.1, { alfa: 0.22, sfoca: 30 * S, colore: [255, 190, 90] });
      ctx.restore();
    };
    finestra(cx - 205 * S, base - lh + 80 * S, 84 * S, 96 * S);
    finestra(cx + 120 * S, base - lh + 80 * S, 84 * S, 96 * S);
    const porta = new Path2D();
    porta.moveTo(cx - 52 * S, base);
    porta.lineTo(cx - 52 * S, base - 150 * S);
    porta.arc(cx, base - 150 * S, 52 * S, Math.PI, 0);
    porta.lineTo(cx + 52 * S, base);
    porta.closePath();
    ctx.fillStyle = '#5a321a';
    ctx.fill(porta);
    ctx.strokeStyle = 'rgba(30,15,6,0.6)';
    ctx.lineWidth = 3 * S;
    for (let k = -1; k <= 1; k += 1) { ctx.beginPath(); ctx.moveTo(cx + k * 18 * S, base); ctx.lineTo(cx + k * 18 * S, base - 180 * S); ctx.stroke(); }
    // la lanterna accanto alla porta
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    luce(ctx, cx + 82 * S, base - 170 * S, 70 * S, 70 * S, { alfa: 0.35, sfoca: 40 * S, colore: [255, 180, 80] });
    luce(ctx, cx + 82 * S, base - 170 * S, 10 * S, 13 * S, { alfa: 1, sfoca: 3 * S, colore: [255, 236, 190] });
    ctx.restore();
    // ulivo e vasi
    for (const [ox, oy, r] of [[cx - lw / 2 - 150 * S, base - 120 * S, 110 * S], [cx + lw / 2 + 140 * S, base - 90 * S, 90 * S]]) {
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(ox - 8 * S, oy, 16 * S, base - oy);
      for (let i = 0; i < 26; i += 1) {
        ctx.fillStyle = caso.scegli(['#2f3f2c', '#3e5238', '#4a5e40']);
        ctx.fill(forma(ox + caso.gauss() * r * 0.6, oy - r * 0.4 + caso.gauss() * r * 0.4, r * 0.35, r * 0.25, 0.3, caso));
      }
    }
    ctx.fillStyle = '#1d1a16';
    ctx.fillRect(0, base, w, h - base);
  },

  /* ---- Cucina ---------------------------------------------------------- */
  'farina-uova'(ctx, w, h, S, caso) {
    spianatoia(ctx, w, h, S, caso, { farina: 0.35 });
    const cx = w * 0.46; const cy = h * 0.5;
    const monte = forma(cx, cy, 330 * S, 300 * S, 0.12, caso, { punti: 36 });
    ombra(ctx, monte, { dx: 10 * S, dy: 14 * S, sfoca: 18 * S, alfa: 0.25 });
    const rum = creaRumore(caso.int(1, 1e9));
    trama(ctx, monte, [cx - 400 * S, cy - 380 * S, cx + 400 * S, cy + 380 * S], (x, y) => {
      const d = Math.hypot(x - cx, y - cy) / (330 * S);
      const n = rum.fbm(x / (8 * S), y / (8 * S), 3);
      // il cratere: un anello più chiaro, il fondo in ombra
      const cratere = Math.exp(-((d - 0.62) ** 2) / 0.03);
      const k = 0.9 + cratere * 0.1 - clamp(0.45 - d) * 0.25 + (n - 0.5) * 0.05 + (x - cx) / (900 * S) * 0.04;
      return [252 * k, 249 * k, 242 * k, 255];
    }, { risoluzione: 1.5 });
    uovo(ctx, cx - 40 * S, cy - 30 * S, 44 * S, S, caso);
    uovo(ctx, cx + 50 * S, cy + 10 * S, 44 * S, S, caso);
    uovo(ctx, cx - 10 * S, cy + 70 * S, 44 * S, S, caso);
    guscio(ctx, w * 0.84, h * 0.24, 48 * S, 0.4, S);
    guscio(ctx, w * 0.88, h * 0.4, 46 * S, 2.6, S);
    forchetta(ctx, w * 0.8, h * 0.92, 300 * S, -1.9, S);
  },

  sfoglia(ctx, w, h, S, caso) {
    spianatoia(ctx, w, h, S, caso, { farina: 0.45 });
    sfoglia(ctx, w * 0.44, h * 0.52, 420 * S, 330 * S, S, caso, { rot: 0.2 });
    mattarello(ctx, w * 0.02, h * 0.86, w * 0.98, h * 0.18, 34 * S, S, caso);
  },

  chitarra(ctx, w, h, S, caso) {
    spianatoia(ctx, w, h, S, caso, { farina: 0.4 });
    const x = w * 0.08; const y = h * 0.1; const cw = w * 0.56; const ch = h * 0.8;
    strumentoChitarra(ctx, x, y, cw, ch, S, caso);
    // la sfoglia appoggiata sulle corde, e la parte già tagliata sotto
    sfoglia(ctx, x + cw * 0.5, y + ch * 0.4, cw * 0.36, ch * 0.3, S, caso, { rot: 0.05 });
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 80; i += 1) {
      const px = w * 0.7 + caso.tra(0, w * 0.25); const py = h * 0.15 + caso.tra(0, h * 0.7);
      const L = caso.tra(120, 260) * S; const a = Math.PI / 2 + caso.tra(-0.25, 0.25);
      ctx.shadowColor = 'rgba(90,50,15,0.4)';
      ctx.shadowBlur = 3 * S;
      ctx.shadowOffsetY = 2 * S;
      ctx.strokeStyle = rgb(scala([240, 206, 130], caso.tra(0.92, 1.05)));
      ctx.lineWidth = 6 * S;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + caso.tra(-30, 30) * S, py + L * 0.5, px + Math.cos(a) * L * 0.2, py + Math.sin(a) * L);
      ctx.stroke();
    }
    ctx.restore();
    mattarello(ctx, w * 0.1, h * 0.97, w * 0.6, h * 0.94, 26 * S, S, caso);
  },

  spiedini(ctx, w, h, S, caso) {
    const tutto = new Path2D();
    tutto.rect(0, 0, w, h);
    legno(ctx, tutto, [0, 0, w, h], S, caso.figlio('legno'), { base: [196, 150, 98], dir: 0.02 });
    // il mucchio di cubetti crudi
    const rum = creaRumore(caso.int(1, 1e9));
    for (let i = 0; i < 110; i += 1) {
      const a = caso.tra(0, TAU); const d = 230 * S * Math.sqrt(caso.n());
      const x = w * 0.7 + Math.cos(a) * d; const y = h * 0.42 + Math.sin(a) * d * 0.8;
      const l = caso.tra(22, 28) * S;
      const grasso = caso.n() < 0.22;
      const p = rettangoloTondo(x, y, l, l * caso.tra(0.85, 1.1), 4 * S);
      ombra(ctx, p, { dx: 2 * S, dy: 4 * S, sfoca: 3 * S, alfa: 0.45 });
      ctx.fillStyle = grasso ? '#efe0cf' : rgb(mescola([176, 48, 50], [140, 30, 36], rum.n2(x / 30, y / 30)));
      ctx.fill(p);
      luce(ctx, x + l * 0.3, y + l * 0.25, l * 0.2, l * 0.1, { alfa: 0.35, sfoca: 1.5 * S });
    }
    for (let i = 0; i < 6; i += 1) {
      const y0 = h * (0.2 + i * 0.12);
      arrosticino(ctx, w * 0.04, y0, w * 0.48, y0 - 40 * S, S, caso, { crudo: true, lato: 24 });
    }
    // spiedini ancora vuoti
    ctx.save();
    for (let i = 0; i < 9; i += 1) {
      ctx.shadowColor = 'rgba(40,20,5,0.4)';
      ctx.shadowBlur = 4 * S;
      ctx.shadowOffsetY = 3 * S;
      ctx.strokeStyle = '#ead8b0';
      ctx.lineWidth = 5 * S;
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.8 + i * 9 * S); ctx.lineTo(w * 0.96, h * 0.77 + i * 9 * S); ctx.stroke();
    }
    ctx.restore();
    coltello(ctx, w * 0.08, h * 0.92, 380 * S, -0.08, S);
  },

  brace(ctx, w, h, S, caso) {
    const tutto = new Path2D();
    tutto.rect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2a2522');
    g.addColorStop(1, '#151210');
    ctx.fillStyle = g;
    ctx.fill(tutto);
    const cx0 = w * 0.32; const cw = w * 0.36;
    canala(ctx, cx0, -20 * S, cw, h + 40 * S, S, caso);
    for (let i = 0; i < 9; i += 1) {
      const y = h * (0.08 + i * 0.1);
      arrosticino(ctx, w * 0.1, y, w * 0.86, y + caso.tra(-6, 6) * S, S, caso, { lato: 24 });
    }
    // il fumo
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 14; i += 1) luce(ctx, cx0 + caso.tra(0, cw), caso.tra(0, h), caso.tra(60, 140) * S, caso.tra(30, 70) * S, { alfa: 0.06, sfoca: 40 * S, rot: caso.tra(0, TAU), colore: [230, 230, 235] });
    ctx.restore();
  },

  'dolci-forno'(ctx, w, h, S, caso) {
    tavolo(ctx, w, h, S, caso.figlio('tavolo'), { base: [170, 120, 74], assi: 5 });
    const teglia = rettangoloTondo(w * 0.06, h * 0.08, w * 0.88, h * 0.84, 22 * S);
    ombra(ctx, teglia, { dx: 12 * S, dy: 18 * S, sfoca: 18 * S, alfa: 0.45 });
    const gt = ctx.createLinearGradient(0, h * 0.08, 0, h * 0.92);
    gt.addColorStop(0, '#5d5f62');
    gt.addColorStop(1, '#2f3133');
    ctx.fillStyle = gt;
    ctx.fill(teglia);
    carta(ctx, [[w * 0.09, h * 0.13], [w * 0.91, h * 0.12], [w * 0.92, h * 0.88], [w * 0.08, h * 0.89]], S, caso.figlio('carta'), { base: [236, 226, 206] });
    for (let j = 0; j < 3; j += 1) {
      for (let i = 0; i < 4; i += 1) bocconotto(ctx, w * (0.2 + i * 0.2), h * (0.25 + j * 0.25), 74 * S, S, caso);
    }
  },

  /* Il piatto vuoto della pagina 404. */
  'piatto-vuoto'(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    piatto(ctx, w * 0.5, h * 0.5, h * 0.4, S);
    forchetta(ctx, w * 0.16, h * 0.86, 360 * S, -Math.PI / 2 + 0.04, S);
    coltello(ctx, w * 0.84, h * 0.86, 340 * S, -Math.PI / 2 - 0.04, S);
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = 'rgba(176,44,26,0.85)';
      ctx.fill(forma(w * 0.5 + caso.gauss() * 60 * S, h * 0.5 + caso.gauss() * 60 * S, caso.tra(3, 8) * S, caso.tra(2, 6) * S, 0.3, caso));
    }
  },
};

/* Il piatto grande della homepage: chitarra con le pallottine. */
function piattoGrande(ctx, cx, cy, R, S, caso) {
  const { conca } = piatto(ctx, cx, cy, R, S);
  nidoPasta(ctx, cx, cy, conca * 0.98, S, caso.figlio('nido'), { fili: 170, spessore: 8.5 });
  sugo(ctx, cx + 6 * S, cy - 4 * S, conca * 0.55, S, caso.figlio('sugo'), { irregolare: 0.3 });
  nidoPasta(ctx, cx, cy, conca * 0.6, S, caso.figlio('sopra'), { fili: 12, spessore: 8.5 });
  for (let i = 0; i < 28; i += 1) {
    const a = caso.tra(0, TAU); const d = conca * 0.6 * Math.sqrt(caso.n());
    polpetta(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, caso.tra(12, 15) * S, S, caso);
  }
  grattugiato(ctx, cx - 6 * S, cy - 8 * S, conca * 0.24, S, caso, { n: 220 });
  basilico(ctx, cx + conca * 0.24, cy - conca * 0.3, S, caso, { foglie: 2, scala: 1.1 });
}

/* L'immagine per le anteprime social (1200×630): piatto, nome, luogo. */
SCENE.og = function og(ctx, w, h, S, caso) {
  SCENE.hero(ctx, w, h, S, caso);
  const g = ctx.createLinearGradient(0, 0, w * 0.75, 0);
  g.addColorStop(0, 'rgba(17,40,58,0.94)');
  g.addColorStop(0.55, 'rgba(17,40,58,0.82)');
  g.addColorStop(1, 'rgba(17,40,58,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c9a66b';
  ctx.font = `600 ${22 * S}px Inter`;
  ctx.fillText('ROSETO DEGLI ABRUZZI · CUCINA TERAMANA', 64 * S, 150 * S);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${92 * S}px "Playfair Display"`;
  ctx.fillText('La Casetta', 60 * S, 270 * S);
  ctx.font = `italic 500 ${70 * S}px "Playfair Display"`;
  ctx.fillText('di Paparill', 64 * S, 360 * S);
  ctx.fillStyle = '#c3ccd3';
  ctx.font = `500 ${26 * S}px Inter`;
  ctx.fillText('Pasta fatta in casa · Arrosticini · Dolci della casa', 64 * S, 440 * S);
};
