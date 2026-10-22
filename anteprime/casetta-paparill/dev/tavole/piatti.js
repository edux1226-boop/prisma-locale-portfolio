/* I piatti del menu, tutti con la stessa messa in scena: tovaglia di lino,
   vista dall'alto, luce da sinistra, tovagliolo con la riga blu e posata
   a destra. Così la pagina del menu sembra un servizio fotografico solo. */
import {
  TAU, cerchio, forma, ombra, creaRumore, trama, clamp, mescola,
} from './base.js';
import { lino, carta } from './fondi.js';
import {
  piatto, coccio, tagliere, forchetta, coltello, cucchiaino, tovagliolo,
} from './stoviglie.js';
import {
  nidoPasta, mugnaia, sugo, gocceSugo, polpetta, cece, grattugiato, basilico, rosmarino, peperoncino,
  olio, sale, arrosticino, costoletta, salsiccia, pancetta, patata, verdureCampo, aglio, grigliata, fettaPane,
  scrippella, raviolo, sagna, fettaSalame, fettaLonza, spicchioFormaggio, ciotolaMiele, noce, oliva, bocconotto,
  fettaTorta, scaglieCioccolato, mandorle, lamellaTartufo, tartufoIntero,
} from './cibi.js';

/* La messa in scena comune. Restituisce centro e raggio del piatto. */
export function apparecchia(ctx, w, h, S, caso, { posata = 'forchetta', cx = 0.44, cy = 0.5, R = 0.44 } = {}) {
  lino(ctx, w, h, S, caso.figlio('lino'));
  tovagliolo(ctx, w * 0.93, h * 0.58, 250 * S, 470 * S, -0.06, S, caso.figlio('tovagliolo'));
  const x = w * 0.885;
  if (posata === 'forchetta') forchetta(ctx, x, h * 0.86, 340 * S, -Math.PI / 2 - 0.03, S);
  if (posata === 'coltello') coltello(ctx, x, h * 0.86, 320 * S, -Math.PI / 2 - 0.03, S);
  if (posata === 'cucchiaio') cucchiaino(ctx, x, h * 0.84, 300 * S, -Math.PI / 2 - 0.03, S);
  if (posata === 'cucchiaino') cucchiaino(ctx, x, h * 0.74, 200 * S, -Math.PI / 2 - 0.03, S);
  return { cx: w * cx, cy: h * cy, R: h * R };
}

/* Polpette sparse dentro un cerchio, più fitte al centro. */
function sparse(caso, cx, cy, R, n, minimo) {
  const punti = [];
  let tentativi = 0;
  while (punti.length < n && tentativi < n * 60) {
    tentativi += 1;
    const a = caso.tra(0, TAU); const d = R * Math.sqrt(caso.n());
    const p = [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
    if (punti.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > minimo)) punti.push(p);
  }
  return punti;
}

export const PIATTI = {
  'chitarra-pallottine'(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso);
    const { conca } = piatto(ctx, cx, cy, R, S);
    gocceSugo(ctx, cx, cy, conca * 1.02, S, caso, { n: 4 });
    nidoPasta(ctx, cx, cy, conca * 0.98, S, caso.figlio('nido'), { fili: 150, spessore: 8.5 });
    sugo(ctx, cx + 6 * S, cy - 4 * S, conca * 0.56, S, caso.figlio('sugo'), { irregolare: 0.32 });
    nidoPasta(ctx, cx, cy, conca * 0.62, S, caso.figlio('sopra'), { fili: 12, spessore: 8.5 });
    sugo(ctx, cx - conca * 0.16, cy + conca * 0.14, conca * 0.24, S, caso.figlio('sugo2'));
    for (const [x, y] of sparse(caso, cx, cy, conca * 0.62, 26, 27 * S)) polpetta(ctx, x, y, caso.tra(12, 15) * S, S, caso);
    grattugiato(ctx, cx - 6 * S, cy - 8 * S, conca * 0.24, S, caso, { n: 200 });
    basilico(ctx, cx + conca * 0.26, cy - conca * 0.32, S, caso, { foglie: 2, scala: 1.1 });
  },

  mugnaia(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso);
    const { conca } = piatto(ctx, cx, cy, R, S);
    gocceSugo(ctx, cx, cy, conca * 0.84, S, caso, { n: 5, colore: [140, 40, 24] });
    mugnaia(ctx, cx, cy, conca * 0.96, S, caso.figlio('pasta'));
    sugo(ctx, cx + 4 * S, cy, conca * 0.56, S, caso.figlio('ragu'), { colore: [140, 38, 22], ragu: true, irregolare: 0.3 });
    sugo(ctx, cx - conca * 0.35, cy + conca * 0.3, conca * 0.16, S, caso.figlio('ragu2'), { colore: [140, 38, 22], ragu: true });
    for (const [x, y] of sparse(caso, cx, cy, conca * 0.5, 12, 28 * S)) {
      polpetta(ctx, x, y, caso.tra(8, 12) * S, S, caso, { colore: [98, 44, 24], ruvida: 2 });
    }
    grattugiato(ctx, cx, cy - 6 * S, conca * 0.22, S, caso, { n: 170 });
  },

  scrippelle(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso, { posata: 'cucchiaio' });
    const { interno } = coccio(ctx, cx, cy, R * 0.86, S, caso.figlio('coccio'));
    // il brodo dorato con gli occhi di grasso
    const brodo = cerchio(cx, cy, interno * 0.97);
    const g = ctx.createRadialGradient(cx - interno * 0.3, cy - interno * 0.3, 4, cx, cy, interno);
    g.addColorStop(0, '#f0c25e');
    g.addColorStop(0.7, '#d4922c');
    g.addColorStop(1, '#9c5c18');
    ctx.fillStyle = g;
    ctx.fill(brodo);
    const rotoli = [[-0.36, -0.22, 0.55], [0.1, -0.4, -0.3], [-0.12, 0.08, 0.2], [0.38, -0.02, 0.95], [-0.3, 0.42, -0.15], [0.18, 0.44, 0.35]];
    for (const [dx, dy, a] of rotoli) scrippella(ctx, cx + dx * interno, cy + dy * interno, interno * 0.6, 27 * S, a, S, caso);
    ctx.save();
    ctx.clip(brodo);
    // il brodo copre un po' i rotoli: sono immersi
    const velo = ctx.createRadialGradient(cx, cy, interno * 0.5, cx, cy, interno);
    velo.addColorStop(0, 'rgba(214,146,44,0)');
    velo.addColorStop(1, 'rgba(176,104,30,0.45)');
    ctx.fillStyle = velo;
    ctx.fill(brodo);
    for (let i = 0; i < 70; i += 1) {
      const r = caso.tra(3, 10) * S;
      const x = cx + caso.gauss() * interno * 0.6; const y = cy + caso.gauss() * interno * 0.6;
      ctx.strokeStyle = 'rgba(255,236,170,0.6)';
      ctx.lineWidth = 1.3 * S;
      ctx.stroke(cerchio(x, y, r));
      ctx.fillStyle = 'rgba(255,220,120,0.16)';
      ctx.fill(cerchio(x, y, r));
    }
    ctx.restore();
    grattugiato(ctx, cx, cy, interno * 0.28, S, caso, { n: 170 });
    for (let i = 0; i < 34; i += 1) {
      ctx.fillStyle = caso.n() < 0.5 ? '#3f7a32' : '#5e9a44';
      ctx.fill(forma(cx + caso.gauss() * interno * 0.35, cy + caso.gauss() * interno * 0.35, caso.tra(1.5, 3.5) * S, caso.tra(1, 2.5) * S, 0.4, caso, { punti: 7 }));
    }
  },

  timballo(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso);
    const { conca } = piatto(ctx, cx, cy, R, S);
    sugo(ctx, cx + 10 * S, cy + 14 * S, conca * 0.82, S, caso.figlio('sotto'), { colore: [160, 40, 24], ragu: true, irregolare: 0.18 });
    const L = conca * 1.0;
    const x0 = cx - L / 2; const y0 = cy - L / 2 - 14 * S;
    const spessore = 46 * S;
    const lati = new Path2D();
    lati.moveTo(x0 + L, y0 + 10 * S);
    lati.lineTo(x0 + L + 4 * S, y0 + L + spessore);
    lati.lineTo(x0 + 6 * S, y0 + L + spessore);
    lati.lineTo(x0, y0 + L);
    lati.closePath();
    ombra(ctx, lati, { dx: 10 * S, dy: 14 * S, sfoca: 14 * S, alfa: 0.45 });
    // gli strati visti di lato
    ctx.save();
    ctx.clip(lati);
    const strati = ['#e9c578', '#9d2f1c', '#f3e3c2', '#e2b866', '#a3361f', '#f1dfb8', '#d9a94e'];
    strati.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x0 - 10 * S, y0 + L + (i * spessore) / strati.length - 2 * S, L + 30 * S, spessore / strati.length + 2 * S);
    });
    ctx.restore();
    // la superficie gratinata
    const quad = new Path2D();
    quad.roundRect(x0, y0, L, L, 14 * S);
    const rum = creaRumore(caso.int(1, 1e9));
    trama(ctx, quad, [x0, y0, x0 + L, y0 + L], (x, y) => {
      const n = rum.fbm(x / (26 * S), y / (26 * S), 4);
      const b = rum.fbm(x / (7 * S), y / (7 * S), 2);
      const bruciato = clamp((n - 0.52) * 3.2);
      const c = mescola(mescola([236, 196, 110], [176, 98, 34], bruciato), [110, 50, 18], clamp((b - 0.7) * 3) * bruciato);
      return [...c, 255];
    }, { risoluzione: 1.5 });
    ctx.save();
    ctx.clip(quad);
    ctx.lineWidth = 10 * S;
    ctx.strokeStyle = 'rgba(80,30,8,0.35)';
    ctx.translate(-4 * S, -5 * S);
    ctx.stroke(quad);
    ctx.restore();
    sugo(ctx, x0 + L * 0.66, y0 + L * 0.3, L * 0.12, S, caso.figlio('cucchiaiata'), { colore: [168, 42, 24], ragu: true });
    basilico(ctx, x0 + L * 0.32, y0 + L * 0.62, S, caso, { foglie: 2, scala: 0.85 });
  },

  'chitarra-tartufo'(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso);
    tartufoIntero(ctx, w * 0.13, h * 0.16, 58 * S, S, caso.figlio('tartufo'));
    for (let i = 0; i < 4; i += 1) lamellaTartufo(ctx, w * 0.07 + caso.tra(0, 160) * S, h * 0.3 + caso.tra(-30, 40) * S, caso.tra(15, 20) * S, S, caso);
    const { conca } = piatto(ctx, cx, cy, R, S);
    nidoPasta(ctx, cx, cy, conca * 0.78, S, caso.figlio('nido'), { colore: [240, 210, 138], fili: 120, spessore: 7.5, lucido: 0.7 });
    for (const [x, y] of sparse(caso, cx, cy, conca * 0.48, 20, 20 * S)) lamellaTartufo(ctx, x, y, caso.tra(14, 22) * S, S, caso);
    grattugiato(ctx, cx, cy, conca * 0.18, S, caso, { n: 60 });
  },

  ravioli(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso);
    const { conca } = piatto(ctx, cx, cy, R, S);
    sugo(ctx, cx, cy, conca * 0.78, S, caso.figlio('fondo'), { colore: [190, 48, 26], irregolare: 0.12 });
    const posti = [[-0.32, -0.3, 0.2], [0.18, -0.36, -0.15], [0.42, 0.02, 0.35], [-0.42, 0.12, -0.3], [0.05, 0.05, 0.05], [-0.08, 0.44, 0.4], [0.32, 0.42, -0.2]];
    for (const [dx, dy, a] of posti) raviolo(ctx, cx + dx * conca, cy + dy * conca, 112 * S, a, S, caso);
    for (let i = 0; i < 4; i += 1) sugo(ctx, cx + caso.gauss() * conca * 0.3, cy + caso.gauss() * conca * 0.3, caso.tra(18, 28) * S, S, caso.figlio(`c${i}`));
    grattugiato(ctx, cx, cy, conca * 0.28, S, caso, { n: 120 });
    basilico(ctx, cx - conca * 0.05, cy - conca * 0.05, S, caso, { foglie: 3, scala: 0.8 });
  },

  'sagne-e-ceci'(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso, { posata: 'cucchiaio' });
    const { interno } = coccio(ctx, cx, cy, R * 0.94, S, caso.figlio('coccio'));
    const fondo = cerchio(cx, cy, interno * 0.97);
    const g = ctx.createRadialGradient(cx - interno * 0.3, cy - interno * 0.3, 4, cx, cy, interno);
    g.addColorStop(0, '#e8b46e');
    g.addColorStop(1, '#a8682e');
    ctx.fillStyle = g;
    ctx.fill(fondo);
    ctx.save();
    ctx.clip(fondo);
    const pezzi = [];
    for (let i = 0; i < 38; i += 1) pezzi.push(['s', caso.n()]);
    for (let i = 0; i < 46; i += 1) pezzi.push(['c', caso.n()]);
    pezzi.sort((a, b) => a[1] - b[1]);
    for (const [tipo] of pezzi) {
      const a = caso.tra(0, TAU); const d = interno * Math.sqrt(caso.n()) * 0.9;
      const x = cx + Math.cos(a) * d; const y = cy + Math.sin(a) * d;
      if (tipo === 's') sagna(ctx, x, y, caso.tra(26, 34) * S, caso.tra(0, TAU), S, caso);
      else cece(ctx, x, y, caso.tra(10, 12.5) * S, S, caso);
    }
    ctx.restore();
    olio(ctx, [[cx - interno * 0.5, cy - interno * 0.2], [cx - interno * 0.1, cy - interno * 0.35], [cx + interno * 0.3, cy - interno * 0.1], [cx + interno * 0.45, cy + interno * 0.25]], S);
    rosmarino(ctx, cx - interno * 0.35, cy + interno * 0.35, interno * 0.75, -0.55, S, caso);
    for (let i = 0; i < 40; i += 1) {
      ctx.fillStyle = 'rgba(30,20,15,0.7)';
      ctx.fill(cerchio(cx + caso.gauss() * interno * 0.4, cy + caso.gauss() * interno * 0.4, caso.tra(0.8, 1.6) * S));
    }
  },

  'pizza-e-foje'(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso);
    const { conca } = piatto(ctx, cx, cy, R, S);
    verdureCampo(ctx, cx, cy, conca * 0.82, S, caso.figlio('verdure'), { n: 110 });
    const rum = creaRumore(caso.int(1, 1e9));
    for (const [x, y] of sparse(caso, cx, cy, conca * 0.62, 13, 46 * S)) {
      const r = caso.tra(22, 34) * S;
      const p = forma(x, y, r, r * caso.tra(0.65, 0.9), 0.3, caso, { rot: caso.tra(0, TAU), punti: 12 });
      ombra(ctx, p, { dx: 3 * S, dy: 6 * S, sfoca: 6 * S, alfa: 0.45 });
      trama(ctx, p, [x - r * 1.4, y - r * 1.4, x + r * 1.4, y + r * 1.4], (px, py) => {
        const n = rum.fbm(px / (5 * S), py / (5 * S), 3);
        const crosta = rum.fbm(px / (18 * S), py / (18 * S), 2);
        const base = mescola([244, 198, 86], [190, 118, 40], clamp((crosta - 0.45) * 2.5));
        const k = n < 0.38 ? 0.82 : 1;
        return [base[0] * k, base[1] * k, base[2] * k, 255];
      }, { risoluzione: 1 });
    }
    aglio(ctx, cx, cy, conca * 0.35, S, caso, { n: 10 });
    peperoncino(ctx, cx, cy, conca * 0.35, S, caso, { n: 26 });
    olio(ctx, [[cx - conca * 0.5, cy + conca * 0.1], [cx - conca * 0.1, cy - conca * 0.2], [cx + conca * 0.35, cy + conca * 0.15]], S);
  },

  tagliere(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    tovagliolo(ctx, w * 0.95, h * 0.2, 230 * S, 380 * S, 0.1, S, caso.figlio('tovagliolo'));
    const tw = w * 0.74; const th = h * 0.76;
    const x0 = w * 0.05; const y0 = h * 0.12;
    tagliere(ctx, x0, y0, tw, th, S, caso.figlio('legno'), { manico: 'destra', rot: -0.03 });
    // pane abbrustolito in basso
    for (let i = 0; i < 3; i += 1) fettaPane(ctx, x0 + tw * (0.17 + i * 0.25), y0 + th * 0.8, 96 * S, 64 * S, caso.tra(-0.3, 0.3), S, caso.figlio(`pane${i}`), { tostata: true });
    // salame e ventricina in file sovrapposte
    for (let i = 0; i < 6; i += 1) fettaSalame(ctx, x0 + tw * 0.11 + i * 62 * S, y0 + th * 0.2 + (i % 2) * 12 * S, 56 * S, S, caso, { tipo: 'salame' });
    for (let i = 0; i < 5; i += 1) fettaSalame(ctx, x0 + tw * 0.13 + i * 66 * S, y0 + th * 0.47 + (i % 2) * 10 * S, 50 * S, S, caso, { tipo: 'ventricina' });
    for (let i = 0; i < 3; i += 1) fettaLonza(ctx, x0 + tw * (0.66 + i * 0.07), y0 + th * (0.2 + i * 0.07), 90 * S, 54 * S, 0.6 + i * 0.2, S, caso);
    spicchioFormaggio(ctx, x0 + tw * 0.62, y0 + th * 0.5, 175 * S, -0.15, S, caso);
    spicchioFormaggio(ctx, x0 + tw * 0.66, y0 + th * 0.64, 165 * S, 0.12, S, caso);
    for (let i = 0; i < 5; i += 1) oliva(ctx, x0 + tw * 0.92 + caso.tra(-18, 18) * S, y0 + th * 0.46 + i * 30 * S, 17 * S, S, caso);
    rosmarino(ctx, x0 + tw * 0.06, y0 + th * 0.64, 190 * S, -0.25, S, caso);
  },

  formaggi(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    tovagliolo(ctx, w * 0.06, h * 0.86, 260 * S, 300 * S, 1.45, S, caso.figlio('tovagliolo'));
    const tw = w * 0.72; const th = h * 0.74;
    const x0 = w * 0.12; const y0 = h * 0.1;
    tagliere(ctx, x0, y0, tw, th, S, caso.figlio('legno'), { manico: 'destra', rot: 0.02, base: [170, 118, 72] });
    for (let i = 0; i < 3; i += 1) spicchioFormaggio(ctx, x0 + tw * 0.06, y0 + th * (0.2 + i * 0.25), 215 * S, -0.12 + i * 0.07, S, caso);
    for (let i = 0; i < 3; i += 1) spicchioFormaggio(ctx, x0 + tw * 0.42, y0 + th * (0.6 + i * 0.13), 160 * S, 0.18, S, caso, { pasta: [250, 246, 236], crosta: [226, 206, 150] });
    // ricotta: un monte bianco e granuloso
    const rx = x0 + tw * 0.56; const ry = y0 + th * 0.3;
    const ric = forma(rx, ry, 96 * S, 80 * S, 0.12, caso);
    ombra(ctx, ric, { dx: 5 * S, dy: 9 * S, sfoca: 9 * S, alfa: 0.35 });
    const rum = creaRumore(caso.int(1, 1e9));
    trama(ctx, ric, [rx - 110 * S, ry - 95 * S, rx + 110 * S, ry + 95 * S], (x, y) => {
      const n = rum.fbm(x / (3 * S), y / (3 * S), 2);
      const d = Math.hypot(x - rx + 24 * S, y - ry + 20 * S) / (110 * S);
      const k = 1.02 - d * 0.14 - (n < 0.4 ? 0.05 : 0);
      return [252 * k, 250 * k, 244 * k, 255];
    });
    ciotolaMiele(ctx, x0 + tw * 0.86, y0 + th * 0.24, 70 * S, S);
    ciotolaMiele(ctx, x0 + tw * 0.86, y0 + th * 0.72, 62 * S, S, { colore: [150, 28, 44] });
    for (let i = 0; i < 6; i += 1) noce(ctx, x0 + tw * (0.7 + caso.tra(-0.05, 0.06)), y0 + th * (0.44 + caso.tra(0, 0.16)), 24 * S, caso.tra(0, TAU), S, caso);
  },

  pallotte(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso, { posata: 'cucchiaio', cx: 0.44 });
    const { interno } = coccio(ctx, cx, cy, R * 0.86, S, caso.figlio('tegame'), { manici: true });
    sugo(ctx, cx, cy, interno * 0.95, S, caso.figlio('sugo'), { colore: [182, 40, 22], irregolare: 0.03 });
    const posti = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * TAU + 0.3) * 0.56, Math.sin((i / 6) * TAU + 0.3) * 0.56])];
    for (const [dx, dy] of posti) polpetta(ctx, cx + dx * interno, cy + dy * interno, caso.tra(34, 40) * S, S, caso, { colore: [200, 138, 70], salsa: [178, 36, 20] });
    basilico(ctx, cx + interno * 0.3, cy - interno * 0.35, S, caso, { foglie: 3, scala: 0.85 });
    grattugiato(ctx, cx - 10 * S, cy, interno * 0.35, S, caso, { n: 120 });
  },

  arrosticini(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    tovagliolo(ctx, w * 0.95, h * 0.64, 230 * S, 460 * S, -0.05, S, caso.figlio('tovagliolo'));
    tagliere(ctx, w * 0.06, h * 0.12, w * 0.7, h * 0.76, S, caso.figlio('legno'), { manico: 'destra', rot: -0.03, base: [168, 112, 66] });
    carta(ctx, [[w * 0.11, h * 0.19], [w * 0.7, h * 0.15], [w * 0.73, h * 0.8], [w * 0.13, h * 0.84]], S, caso.figlio('carta'));
    // dieci spiedini affiancati, quasi paralleli: i manici a sinistra
    for (let i = 0; i < 10; i += 1) {
      const x0 = w * 0.13 + caso.tra(-10, 10) * S; const y0 = h * 0.31 + i * 40 * S;
      const ang = -0.1 + caso.tra(-0.035, 0.035);
      const L = 600 * S;
      arrosticino(ctx, x0, y0, x0 + Math.cos(ang) * L, y0 + Math.sin(ang) * L, S, caso, { lato: 25 });
    }
    sale(ctx, w * 0.42, h * 0.48, 130 * S, S, caso, { n: 200 });
    fettaPane(ctx, w * 0.86, h * 0.17, 74 * S, 56 * S, 0.4, S, caso.figlio('pane'), { tostata: true });
    coccio(ctx, w * 0.86, h * 0.88, 52 * S, S, caso.figlio('ciotola'));
    peperoncino(ctx, w * 0.86, h * 0.88, 16 * S, S, caso, { n: 40 });
  },

  'agnello-diavola'(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso, { posata: 'coltello' });
    const { conca } = piatto(ctx, cx, cy, R, S);
    for (const [x, y] of sparse(caso, cx + conca * 0.3, cy + conca * 0.42, conca * 0.42, 9, 50 * S)) patata(ctx, x, y, caso.tra(30, 40) * S, S, caso);
    costoletta(ctx, cx - conca * 0.52, cy - conca * 0.42, 1.55, 0.35, S, caso);
    costoletta(ctx, cx - conca * 0.62, cy + conca * 0.02, 1.6, 0.08, S, caso);
    costoletta(ctx, cx - conca * 0.46, cy + conca * 0.46, 1.5, -0.25, S, caso);
    rosmarino(ctx, cx + conca * 0.05, cy - conca * 0.7, 230 * S, 0.3, S, caso);
    peperoncino(ctx, cx - conca * 0.3, cy, conca * 0.32, S, caso, { n: 34 });
    sale(ctx, cx - conca * 0.25, cy, conca * 0.3, S, caso, { n: 50 });
  },

  grigliata(ctx, w, h, S, caso) {
    lino(ctx, w, h, S, caso.figlio('lino'));
    tovagliolo(ctx, w * 0.95, h * 0.7, 220 * S, 420 * S, -0.04, S, caso.figlio('tovagliolo'));
    const tw = w * 0.78; const th = h * 0.8;
    const x0 = w * 0.04; const y0 = h * 0.09;
    tagliere(ctx, x0, y0, tw, th, S, caso.figlio('legno'), { manico: 'destra', base: [160, 106, 62] });
    for (let i = 0; i < 4; i += 1) grigliata(ctx, x0 + tw * (0.11 + i * 0.13), y0 + th * 0.84, 64 * S, 40 * S, caso.tra(-0.4, 0.4), S);
    salsiccia(ctx, x0 + tw * 0.06, y0 + th * 0.17, x0 + tw * 0.56, y0 + th * 0.11, 32 * S, S, caso);
    salsiccia(ctx, x0 + tw * 0.08, y0 + th * 0.34, x0 + tw * 0.58, y0 + th * 0.28, 32 * S, S, caso);
    pancetta(ctx, x0 + tw * 0.07, y0 + th * 0.5, 300 * S, 58 * S, -0.06, S, caso);
    pancetta(ctx, x0 + tw * 0.09, y0 + th * 0.64, 300 * S, 58 * S, -0.03, S, caso);
    costoletta(ctx, x0 + tw * 0.7, y0 + th * 0.2, 1.3, -0.5, S, caso);
    costoletta(ctx, x0 + tw * 0.74, y0 + th * 0.46, 1.3, -0.2, S, caso);
    for (let i = 0; i < 3; i += 1) arrosticino(ctx, x0 + tw * 0.5, y0 + th * (0.64 + i * 0.075), x0 + tw * 1.0, y0 + th * (0.6 + i * 0.075), S, caso, { lato: 25 });
    rosmarino(ctx, x0 + tw * 0.62, y0 + th * 0.04, 170 * S, 0.25, S, caso);
  },

  'pizza-dolce'(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso, { posata: 'cucchiaino', R: 0.4 });
    piatto(ctx, cx, cy, R, S, { fondo: 0.66 });
    // pan di Spagna, bagna rosata, crema, cioccolato, crema: gli strati sul lato
    fettaTorta(ctx, cx + 4 * S, cy - 46 * S, R * 1.08, 0.22, 0.7, S, caso, {
      sopra: [247, 240, 226],
      strati: [[246, 238, 224], [226, 170, 84], [196, 82, 96], [242, 208, 120], [88, 50, 28], [214, 150, 70]],
      spessore: 74,
    });
    scaglieCioccolato(ctx, cx + R * 0.12, cy - R * 0.14, R * 0.2, S, caso, { n: 46 });
    mandorle(ctx, cx + R * 0.16, cy - R * 0.12, R * 0.22, S, caso, { n: 26 });
    for (let i = 0; i < 160; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${caso.tra(0.3, 0.8)})`;
      ctx.fill(cerchio(cx + caso.gauss() * R * 0.45, cy + caso.gauss() * R * 0.45, caso.tra(0.6, 1.4) * S));
    }
  },

  bocconotti(ctx, w, h, S, caso) {
    const { cx, cy, R } = apparecchia(ctx, w, h, S, caso, { posata: 'cucchiaino', R: 0.37 });
    const { conca } = piatto(ctx, cx, cy, R, S);
    bocconotto(ctx, cx - conca * 0.36, cy - conca * 0.3, 74 * S, S, caso);
    bocconotto(ctx, cx + conca * 0.4, cy - conca * 0.1, 74 * S, S, caso);
    bocconotto(ctx, cx - conca * 0.1, cy + conca * 0.42, 74 * S, S, caso);
    for (let i = 0; i < 200; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${caso.tra(0.3, 0.7)})`;
      ctx.fill(cerchio(cx + caso.gauss() * conca * 0.6, cy + caso.gauss() * conca * 0.6, caso.tra(0.5, 1.3) * S));
    }
    mandorle(ctx, cx + conca * 0.15, cy + conca * 0.15, conca * 0.1, S, caso, { n: 4 });
  },
};

