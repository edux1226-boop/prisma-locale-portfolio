/* La pala, disegnata. Finché non arrivano le foto vere del locale, la pizza
   in pala è un'illustrazione generata qui: forma irregolare, cornicione con
   alveoli e maculatura, condimenti per sezione, luce dall'alto a sinistra.
   Con lo stesso seme esce sempre la stessa pala. Nessuna libreria. */

const TAU = Math.PI * 2;

function generatore(seme) {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Rumore periodico lungo il bordo: somma di onde con fasi casuali. */
function rumoreBordo(caso, armoniche = 14) {
  const onde = Array.from({ length: armoniche }, (_, i) => ({
    k: i + 2,
    fase: caso() * TAU,
    peso: (0.6 + caso() * 0.8) / (i + 2) ** 0.85,
  }));
  const somma = onde.reduce((s, o) => s + o.peso, 0);
  return (t) => onde.reduce((s, o) => s + Math.sin(o.k * t + o.fase) * o.peso, 0) / somma;
}

/* Rettangolo arrotondato "a mano": una superellisse con il bordo mosso. */
function forma(cx, cy, a, b, ampiezza, r, n = 720) {
  const p = 5.2;
  const punti = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = Math.sign(c) * Math.abs(c) ** (2 / p);
    const y = Math.sign(s) * Math.abs(s) ** (2 / p);
    const d = 1 + r(t) * ampiezza;
    punti.push([cx + x * a * (1 + (d - 1) * (b / a)), cy + y * b * d]);
  }
  const path = new Path2D();
  punti.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  path.closePath();
  // normale verso l'interno per ogni punto (serve a disporre il cornicione)
  const normali = punti.map((_, i) => {
    const [ax, ay] = punti[(i - 1 + n) % n];
    const [bx, by] = punti[(i + 1) % n];
    let nx = by - ay;
    let ny = -(bx - ax);
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    if (nx * (cx - punti[i][0]) + ny * (cy - punti[i][1]) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  });
  return { path, punti, normali };
}

function macchia(ctx, x, y, raggio, caso, irregolare = 0.28, lati = 32) {
  const fasi = [caso() * TAU, caso() * TAU, caso() * TAU];
  ctx.beginPath();
  for (let i = 0; i <= lati; i++) {
    const t = (i / lati) * TAU;
    const d = 1 + irregolare * (Math.sin(2 * t + fasi[0]) * 0.5 + Math.sin(3 * t + fasi[1]) * 0.3 + Math.sin(5 * t + fasi[2]) * 0.2);
    const px = x + Math.cos(t) * raggio * d;
    const py = y + Math.sin(t) * raggio * d * 0.86;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

function ellisse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
}

const fra = (caso, min, max) => min + caso() * (max - min);

/* ---- La tavola di legno (la pala vera e propria, con il manico) -------- */
function tavola(ctx, x, y, w, h, manico, caso) {
  const r = h * 0.1;
  const corpo = new Path2D();
  corpo.moveTo(x + r, y);
  corpo.lineTo(x + w, y);
  // si stringe verso il manico
  corpo.bezierCurveTo(x + w + h * 0.22, y, x + w + h * 0.3, y + h * 0.38, x + w + h * 0.42, y + h * 0.4);
  corpo.lineTo(x + w + manico, y + h * 0.4);
  corpo.lineTo(x + w + manico, y + h * 0.6);
  corpo.lineTo(x + w + h * 0.42, y + h * 0.6);
  corpo.bezierCurveTo(x + w + h * 0.3, y + h * 0.62, x + w + h * 0.22, y + h, x + w, y + h);
  corpo.lineTo(x + r, y + h);
  corpo.quadraticCurveTo(x, y + h, x, y + h - r);
  corpo.lineTo(x, y + r);
  corpo.quadraticCurveTo(x, y, x + r, y);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = h * 0.09;
  ctx.shadowOffsetY = h * 0.05;
  const legno = ctx.createLinearGradient(0, y, 0, y + h);
  legno.addColorStop(0, '#C79B66');
  legno.addColorStop(0.5, '#B4834F');
  legno.addColorStop(1, '#966637');
  ctx.fillStyle = legno;
  ctx.fill(corpo);
  ctx.restore();

  ctx.save();
  ctx.clip(corpo);
  // venature: lunghe, quasi parallele, appena ondulate
  for (let i = 0; i < 70; i++) {
    const yy = y + caso() * h;
    const amp = fra(caso, 1, h * 0.012);
    const freq = fra(caso, 0.002, 0.006) * (1000 / h);
    const fase = caso() * TAU;
    ctx.beginPath();
    for (let xx = x - 10; xx <= x + w + manico + 10; xx += 14) {
      const py = yy + Math.sin(xx * freq * 0.01 + fase) * amp * 6;
      xx === x - 10 ? ctx.moveTo(xx, py) : ctx.lineTo(xx, py);
    }
    ctx.strokeStyle = caso() < 0.7 ? `rgba(92,55,24,${fra(caso, 0.1, 0.3)})` : `rgba(240,205,150,${fra(caso, 0.05, 0.12)})`;
    ctx.lineWidth = fra(caso, 0.6, 2.4) * (h / 600);
    ctx.stroke();
  }
  // farina sul legno, più fitta sotto la pizza
  for (let i = 0; i < 900; i++) {
    const px = x + caso() * w;
    const py = y + caso() * h;
    ellisse(ctx, px, py, fra(caso, 0.6, 2.2) * (h / 600), fra(caso, 0.6, 1.8) * (h / 600));
    ctx.fillStyle = `rgba(250,244,230,${fra(caso, 0.08, 0.35)})`;
    ctx.fill();
  }
  // bordo superiore illuminato
  const luce = ctx.createLinearGradient(0, y, 0, y + h * 0.06);
  luce.addColorStop(0, 'rgba(255,230,190,0.45)');
  luce.addColorStop(1, 'rgba(255,230,190,0)');
  ctx.fillStyle = luce;
  ctx.fillRect(x, y, w + manico, h * 0.06);
  ctx.restore();
}

/* ---- Condimenti --------------------------------------------------------- */
function mozzarella(ctx, x, y, r, caso) {
  // alone: il formaggio che si allarga nel pomodoro
  macchia(ctx, x, y, r * 1.2, caso, 0.4);
  ctx.fillStyle = 'rgba(236,200,150,0.22)';
  ctx.fill();
  ctx.save();
  ctx.shadowColor = 'rgba(110,40,10,0.4)';
  ctx.shadowBlur = r * 0.3;
  macchia(ctx, x, y, r, caso, 0.4);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.15);
  g.addColorStop(0, '#FBF2DC');
  g.addColorStop(0.55, '#F0DFBC');
  g.addColorStop(1, '#D9B67A');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  // dorature e bolle bruciacchiate sulla mozzarella
  for (let i = 0; i < 7; i++) {
    const a = caso() * TAU;
    const d = caso() * r * 0.75;
    macchia(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, r * fra(caso, 0.06, 0.22), caso, 0.5, 9);
    ctx.fillStyle = caso() < 0.2 ? `rgba(90,45,15,${fra(caso, 0.3, 0.6)})` : `rgba(196,128,52,${fra(caso, 0.2, 0.45)})`;
    ctx.fill();
  }
  ellisse(ctx, x - r * 0.3, y - r * 0.38, r * 0.28, r * 0.1, -0.4);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
}

function basilico(ctx, x, y, l, caso) {
  const rot = caso() * TAU;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = 'rgba(30,15,5,0.45)';
  ctx.shadowBlur = l * 0.12;
  ctx.shadowOffsetY = l * 0.04;
  ctx.beginPath();
  ctx.moveTo(-l / 2, 0);
  ctx.bezierCurveTo(-l * 0.2, -l * 0.42, l * 0.25, -l * 0.36, l / 2, 0);
  ctx.bezierCurveTo(l * 0.25, l * 0.36, -l * 0.2, l * 0.42, -l / 2, 0);
  const g = ctx.createLinearGradient(0, -l * 0.3, 0, l * 0.3);
  g.addColorStop(0, '#4E8436');
  g.addColorStop(1, '#25471A');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.moveTo(-l * 0.45, 0);
  ctx.quadraticCurveTo(0, -l * 0.04, l * 0.45, 0);
  ctx.strokeStyle = 'rgba(170,215,120,0.45)';
  ctx.lineWidth = l * 0.025;
  ctx.stroke();
  ctx.restore();
}

function olio(ctx, x0, x1, y0, y1, n, s, caso) {
  for (let i = 0; i < n; i++) {
    const x = fra(caso, x0, x1);
    const y = fra(caso, y0, y1);
    ellisse(ctx, x, y, s * fra(caso, 0.004, 0.012), s * fra(caso, 0.002, 0.006), fra(caso, -0.4, 0.4));
    ctx.fillStyle = `rgba(255,250,235,${fra(caso, 0.3, 0.75)})`;
    ctx.fill();
  }
}

function rossa(ctx, x0, x1, y0, y1, s, caso) {
  ctx.fillStyle = '#A3291A';
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const rossi = ['#B7341F', '#93200F', '#C2462A', '#8A1E10', '#B03A1E'];
  for (let i = 0; i < 260; i++) {
    macchia(ctx, fra(caso, x0, x1), fra(caso, y0, y1), s * fra(caso, 0.015, 0.06), caso, 0.4, 10);
    ctx.fillStyle = rossi[(caso() * rossi.length) | 0];
    ctx.globalAlpha = fra(caso, 0.2, 0.55);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // pomodoro più cotto, scuro, vicino al cornicione
  for (let i = 0; i < 70; i++) {
    const y = caso() < 0.5 ? fra(caso, y0, y0 + s * 0.1) : fra(caso, y1 - s * 0.1, y1);
    ellisse(ctx, fra(caso, x0, x1), y, s * fra(caso, 0.02, 0.05), s * fra(caso, 0.01, 0.03));
    ctx.fillStyle = `rgba(80,18,8,${fra(caso, 0.15, 0.35)})`;
    ctx.fill();
  }
  const w = x1 - x0;
  const n = Math.max(5, Math.round((w / s) * 8));
  for (let i = 0; i < n; i++) {
    mozzarella(ctx, fra(caso, x0 + s * 0.05, x1 - s * 0.05), fra(caso, y0 + s * 0.12, y1 - s * 0.12), s * fra(caso, 0.06, 0.11), caso);
  }
  const foglie = Math.max(2, Math.round((w / s) * 1.8));
  for (let i = 0; i < foglie; i++) basilico(ctx, fra(caso, x0 + s * 0.1, x1 - s * 0.1), fra(caso, y0 + s * 0.15, y1 - s * 0.15), s * fra(caso, 0.1, 0.15), caso);
  olio(ctx, x0, x1, y0, y1, Math.round((w / s) * 40), s, caso);
}

function fondoBianco(ctx, x0, x1, y0, y1, s, caso, tono = '#EBD7AA') {
  ctx.fillStyle = tono;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const crema = ['#F6EBCF', '#F1E0B8', '#E4C68D', '#FAF2DF'];
  for (let i = 0; i < 260; i++) {
    macchia(ctx, fra(caso, x0, x1), fra(caso, y0, y1), s * fra(caso, 0.04, 0.12), caso, 0.4, 12);
    ctx.fillStyle = crema[(caso() * crema.length) | 0];
    ctx.globalAlpha = fra(caso, 0.15, 0.4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // la doratura del formaggio fuso
  for (let i = 0; i < 160; i++) {
    macchia(ctx, fra(caso, x0, x1), fra(caso, y0, y1), s * fra(caso, 0.008, 0.035), caso, 0.5, 9);
    ctx.fillStyle = `rgba(${170 + caso() * 30 | 0},${100 + caso() * 30 | 0},35,${fra(caso, 0.18, 0.5)})`;
    ctx.fill();
  }
}

function bianca(ctx, x0, x1, y0, y1, s, caso) {
  fondoBianco(ctx, x0, x1, y0, y1, s, caso);
  const w = x1 - x0;
  // patate a fette sottili, sparse e sovrapposte
  const n = Math.round((w / s) * 30);
  for (let i = 0; i < n; i++) {
    const x = fra(caso, x0, x1);
    const y = fra(caso, y0 + s * 0.04, y1 - s * 0.04);
    const r = s * fra(caso, 0.055, 0.075);
    ellisse(ctx, x, y, r, r * fra(caso, 0.78, 0.92), caso() * TAU);
    const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(246,230,178,0.82)');
    g.addColorStop(0.75, 'rgba(234,200,124,0.85)');
    g.addColorStop(0.93, 'rgba(192,122,46,0.9)');
    g.addColorStop(1, 'rgba(120,60,18,0.85)');
    ctx.fillStyle = g;
    ctx.fill();
    for (let k = 0; k < 3; k++) {
      macchia(ctx, x + fra(caso, -0.6, 0.6) * r, y + fra(caso, -0.6, 0.6) * r, r * fra(caso, 0.08, 0.2), caso, 0.5, 14);
      ctx.fillStyle = `rgba(170,95,30,${fra(caso, 0.2, 0.45)})`;
      ctx.fill();
    }
  }
  // rosmarino
  const rametti = Math.round((w / s) * 7);
  for (let i = 0; i < rametti; i++) {
    const x = fra(caso, x0, x1);
    const y = fra(caso, y0 + s * 0.05, y1 - s * 0.05);
    const a = caso() * TAU;
    const l = s * fra(caso, 0.035, 0.06);
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2);
    ctx.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2);
    ctx.strokeStyle = caso() < 0.5 ? '#2F4A24' : '#45602F';
    ctx.lineWidth = s * 0.008;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  // pepe
  for (let i = 0; i < Math.round((w / s) * 90); i++) {
    ellisse(ctx, fra(caso, x0, x1), fra(caso, y0, y1), s * fra(caso, 0.002, 0.005), s * fra(caso, 0.002, 0.005));
    ctx.fillStyle = 'rgba(35,22,12,0.75)';
    ctx.fill();
  }
  olio(ctx, x0, x1, y0, y1, Math.round((w / s) * 30), s, caso);
}

function verde(ctx, x0, x1, y0, y1, s, caso) {
  fondoBianco(ctx, x0, x1, y0, y1, s, caso, '#EFDDB4');
  const w = x1 - x0;
  // zucchine a rondelle
  const n = Math.round((w / s) * 20);
  for (let i = 0; i < n; i++) {
    const x = fra(caso, x0 + s * 0.03, x1 - s * 0.03);
    const y = fra(caso, y0 + s * 0.06, y1 - s * 0.06);
    const r = s * fra(caso, 0.045, 0.065);
    ctx.save();
    ctx.shadowColor = 'rgba(60,40,10,0.35)';
    ctx.shadowBlur = r * 0.3;
    ellisse(ctx, x, y, r, r * 0.93, caso() * TAU);
    ctx.fillStyle = '#2F5A22';
    ctx.fill();
    ctx.restore();
    ellisse(ctx, x, y, r * 0.8, r * 0.74, 0);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.8);
    g.addColorStop(0, '#E9EBB8');
    g.addColorStop(1, '#BFCB7C');
    ctx.fillStyle = g;
    ctx.fill();
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU + caso();
      ellisse(ctx, x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.32, r * 0.07, r * 0.05);
      ctx.fillStyle = 'rgba(150,160,90,0.7)';
      ctx.fill();
    }
    if (caso() < 0.5) {
      ellisse(ctx, x + r * 0.2, y - r * 0.1, r * 0.3, r * 0.18, caso());
      ctx.fillStyle = 'rgba(150,95,30,0.35)';
      ctx.fill();
    }
  }
  // pomodorini tagliati a metà
  const pom = Math.round((w / s) * 9);
  for (let i = 0; i < pom; i++) {
    const x = fra(caso, x0 + s * 0.05, x1 - s * 0.05);
    const y = fra(caso, y0 + s * 0.08, y1 - s * 0.08);
    const r = s * fra(caso, 0.045, 0.06);
    ctx.save();
    ctx.shadowColor = 'rgba(60,15,5,0.45)';
    ctx.shadowBlur = r * 0.35;
    ellisse(ctx, x, y, r, r * 0.9, caso() * TAU);
    ctx.fillStyle = '#B92F1A';
    ctx.fill();
    ctx.restore();
    ellisse(ctx, x, y, r * 0.75, r * 0.66, 0);
    ctx.fillStyle = '#DE6446';
    ctx.fill();
    for (let k = 0; k < 4; k++) {
      ellisse(ctx, x + fra(caso, -0.35, 0.35) * r, y + fra(caso, -0.3, 0.3) * r, r * 0.08, r * 0.05);
      ctx.fillStyle = '#F2D27A';
      ctx.fill();
    }
    ellisse(ctx, x - r * 0.3, y - r * 0.3, r * 0.2, r * 0.1, -0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
  }
  const foglie = Math.max(1, Math.round(w / s));
  for (let i = 0; i < foglie; i++) basilico(ctx, fra(caso, x0 + s * 0.1, x1 - s * 0.1), fra(caso, y0 + s * 0.15, y1 - s * 0.15), s * fra(caso, 0.09, 0.13), caso);
  olio(ctx, x0, x1, y0, y1, Math.round((w / s) * 30), s, caso);
}

const CONDIMENTI = { rossa, bianca, verde };
export const ORDINE_GUSTI = ['rossa', 'bianca', 'verde'];

/* ---- Il cornicione ------------------------------------------------------
   Gonfio: tanti anelli concentrici dal bordo bruciato alla cresta dorata,
   poi giù verso il condimento. Sopra, bolle in rilievo e maculatura. */
const ANELLI = [
  [0, [120, 62, 22]],
  [0.12, [170, 96, 40]],
  [0.3, [214, 150, 80]],
  [0.5, [236, 184, 112]],
  [0.68, [226, 166, 92]],
  [0.86, [196, 126, 58]],
  [1, [160, 92, 38]],
];
function coloreAnello(t) {
  for (let i = 1; i < ANELLI.length; i++) {
    const [t1, c1] = ANELLI[i];
    const [t0, c0] = ANELLI[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(',')})`;
    }
  }
  return 'rgb(160,92,38)';
}

function cornicione(ctx, rumore, cx, cy, a, b, c, ampiezza, caso) {
  const passi = 22;
  for (let k = 0; k <= passi; k++) {
    const t = k / passi;
    // la cresta sta un po' più in alto: la luce arriva da sopra
    const f = forma(cx, cy - c * 0.06 * Math.sin(t * Math.PI), a - c * t, b - c * t, ampiezza, rumore, 360);
    ctx.fillStyle = coloreAnello(t);
    ctx.fill(f.path);
  }
  const esterno = forma(cx, cy, a, b, ampiezza, rumore);

  ctx.save();
  ctx.clip(esterno.path);
  const { punti, normali } = esterno;
  const verso = (i, d) => [punti[i][0] + normali[i][0] * d, punti[i][1] + normali[i][1] * d];
  // bolle del cornicione: in rilievo, luce da sopra
  for (let i = 0; i < punti.length; i++) {
    if (caso() > 0.2) continue;
    const [x, y] = verso(i, fra(caso, 0.25, 0.75) * c);
    const r = c * fra(caso, 0.14, 0.3);
    ctx.save();
    ctx.shadowColor = 'rgba(90,40,10,0.45)';
    ctx.shadowBlur = r * 0.5;
    ctx.shadowOffsetY = r * 0.25;
    const bolla = ctx.createRadialGradient(x - r * 0.3, y - r * 0.45, r * 0.05, x, y, r);
    bolla.addColorStop(0, 'rgba(252,222,160,0.95)');
    bolla.addColorStop(0.6, 'rgba(226,160,84,0.85)');
    bolla.addColorStop(1, 'rgba(176,100,40,0.7)');
    ellisse(ctx, x, y, r, r * fra(caso, 0.7, 0.95), caso() * TAU);
    ctx.fillStyle = bolla;
    ctx.fill();
    ctx.restore();
    if (caso() < 0.35) {
      ellisse(ctx, x + r * 0.15, y - r * 0.2, r * 0.45, r * 0.32, caso() * TAU);
      ctx.fillStyle = `rgba(70,30,10,${fra(caso, 0.35, 0.8)})`;
      ctx.fill();
    }
  }
  // doratura e maculatura (le "macchie di leopardo")
  for (let i = 0; i < punti.length; i++) {
    if (caso() > 0.55) continue;
    const [x, y] = verso(i, fra(caso, 0, 0.95) * c);
    const scura = caso() < 0.3;
    const r = c * (scura ? fra(caso, 0.025, 0.08) : fra(caso, 0.08, 0.3));
    macchia(ctx, x, y, r, caso, 0.45, 10);
    ctx.fillStyle = scura ? `rgba(45,20,8,${fra(caso, 0.4, 0.85)})` : `rgba(130,62,18,${fra(caso, 0.1, 0.3)})`;
    ctx.fill();
  }
  // farina rimasta sul bordo
  for (let i = 0; i < punti.length; i++) {
    if (caso() > 0.3) continue;
    const [x, y] = verso(i, fra(caso, -0.05, 0.45) * c);
    ellisse(ctx, x, y, c * fra(caso, 0.01, 0.045), c * fra(caso, 0.01, 0.03));
    ctx.fillStyle = `rgba(252,246,232,${fra(caso, 0.25, 0.7)})`;
    ctx.fill();
  }
  ctx.restore();
  return esterno;
}

/* Grana: un rumore di luminosità sopra la pizza, toglie l'aria "vettoriale". */
function grana(ctx, x, y, w, h, caso, forza = 14) {
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  w = Math.min(ctx.canvas.width - x, Math.ceil(w));
  h = Math.min(ctx.canvas.height - y, Math.ceil(h));
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const n = (caso() - 0.5) * forza;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n * 0.8;
  }
  ctx.putImageData(img, x, y);
}

/* ---- La pala intera ----------------------------------------------------- */
/**
 * @param {HTMLCanvasElement} tela
 * @param {{ larghezza:number, gusti?: string[], seme?: number, conTavola?: boolean }} o
 *   larghezza in pixel reali; l'altezza segue il rapporto della pala.
 */
export function disegnaPala(tela, { larghezza, gusti = ORDINE_GUSTI, seme = 7, conTavola = false }) {
  const rapporto = conTavola ? 2.7 : 3.05;
  const W = Math.round(larghezza);
  const H = Math.round(W / rapporto);
  tela.width = W;
  tela.height = H;
  const ctx = tela.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const caso = generatore(seme);

  // geometria: la pizza al centro, la tavola appena più grande
  const margine = conTavola ? W * 0.035 : W * 0.025;
  const pw = conTavola ? W * 0.78 : W - margine * 2;
  const ph = conTavola ? H * 0.72 : H - margine * 2.2;
  const px = conTavola ? W * 0.045 : margine;
  const py = (H - ph) / 2 - (conTavola ? H * 0.01 : 0);
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  const a = pw / 2;
  const b = ph / 2;
  const s = ph; // unità di misura: l'altezza della pala
  const c = s * 0.155; // spessore del cornicione

  if (conTavola) {
    tavola(ctx, px - W * 0.02, py - H * 0.07, pw + W * 0.04, ph + H * 0.14, W, generatore(seme + 99));
  }

  const ampiezza = 0.06;
  const rumore = rumoreBordo(caso);
  const sagoma = forma(cx, cy, a, b, ampiezza, rumore);
  // ombra della pizza sul piano
  ctx.save();
  ctx.shadowColor = conTavola ? 'rgba(60,30,8,0.6)' : 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = s * 0.07;
  ctx.shadowOffsetY = s * 0.035;
  ctx.fillStyle = '#8C4A1A';
  ctx.fill(sagoma.path);
  ctx.restore();

  const esterno = cornicione(ctx, rumore, cx, cy, a, b, c, ampiezza, caso);

  // la parte condita, divisa in sezioni con un confine morbido
  const interno = forma(cx, cy, a - c, b - c, ampiezza, rumore);
  ctx.save();
  ctx.clip(interno.path);
  const x0 = cx - a + c * 0.5;
  const x1 = cx + a - c * 0.5;
  const y0 = cy - b;
  const y1 = cy + b;
  const n = gusti.length;
  for (let i = 0; i < n; i++) {
    const sx0 = x0 + ((x1 - x0) * i) / n;
    const sx1 = x0 + ((x1 - x0) * (i + 1)) / n;
    ctx.save();
    if (n > 1) {
      // confine ondulato tra un gusto e l'altro
      const onda = (x, y) => x + Math.sin(y / s * 9 + i * 2.1) * s * 0.018;
      ctx.beginPath();
      ctx.moveTo(i === 0 ? sx0 - s : onda(sx0, y0), y0);
      for (let y = y0; y <= y1; y += s * 0.05) ctx.lineTo(i === 0 ? sx0 - s : onda(sx0, y), y);
      for (let y = y1; y >= y0; y -= s * 0.05) ctx.lineTo(i === n - 1 ? sx1 + s : onda(sx1, y), y);
      ctx.closePath();
      ctx.clip();
    }
    const condimento = CONDIMENTI[gusti[i]] ?? rossa;
    condimento(ctx, sx0 - s * 0.05, sx1 + s * 0.05, y0, y1, s, caso);
    ctx.restore();
  }
  ctx.restore();

  // il gradino tra cornicione e condimento
  ctx.save();
  ctx.clip(esterno.path);
  ctx.shadowColor = 'rgba(70,30,8,0.6)';
  ctx.shadowBlur = c * 0.35;
  ctx.lineWidth = c * 0.12;
  ctx.strokeStyle = 'rgba(150,80,30,0.55)';
  ctx.stroke(interno.path);
  ctx.restore();

  // luce generale: calda in alto a sinistra, ombra in basso a destra
  ctx.save();
  ctx.clip(esterno.path);
  const luce = ctx.createLinearGradient(cx - a, cy - b, cx + a * 0.4, cy + b * 1.6);
  luce.addColorStop(0, 'rgba(255,235,200,0.18)');
  luce.addColorStop(0.5, 'rgba(255,235,200,0)');
  luce.addColorStop(1, 'rgba(40,15,0,0.22)');
  ctx.fillStyle = luce;
  ctx.fillRect(cx - a, cy - b, a * 2, b * 2);
  ctx.restore();

  grana(ctx, cx - a - s * 0.05, cy - b - s * 0.05, a * 2 + s * 0.1, b * 2 + s * 0.1, caso);
  return { W, H };
}
