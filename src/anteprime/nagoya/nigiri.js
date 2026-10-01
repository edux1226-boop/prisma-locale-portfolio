/* IL NIGIRI — mossa firma n.2.
   I chicchi di riso (un'unica InstancedMesh) convergono in un nigiri; una
   fetta di salmone lucida scende, si posa e si piega sul riso; la camera
   gira lenta. Tutto dipende da un solo numero, il progresso dello scroll.

   Il volo dei chicchi è calcolato nello shader: la CPU non tocca le
   istanze dopo la creazione. La filigrana dell'anteprima è disegnata
   dentro il canvas, sopra la scena. */

import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';

const NORI = '#0F1412';
/* Il riso del nigiri: superellissoide (metà superiore), semiassi in x, y, z. */
const SHARI = { a: 1.12, b: 0.5, c: 0.56, p: 2.5 };
const FETTA = { lunghezza: 2.7, spessore: 0.16, larghezza: 1.0 };
const QUOTA_FETTA = SHARI.b + 0.105;
const GUARDA = new Vector3(0, 0.3, 0);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const morbido = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function random(seed) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- Riso ---------------------------------------------------------------- */

/* Un chicco vero: non un ellissoide perfetto ma un seme con un'estremità
   più stretta e il dorso appena curvo. */
function geometriaChicco() {
  const geometry = new SphereGeometry(1, 10, 7);
  geometry.deleteAttribute('uv');
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const stretto = 1 - 0.22 * Math.max(0, x) ** 2;
    const y = pos.getY(i) * stretto + 0.14 * (x * x - 0.35);
    const z = pos.getZ(i) * stretto * 0.9;
    pos.setXYZ(i, x * 0.074, y * 0.034, z * 0.034);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function chicchi(count, rand) {
  const { a, b, c, p } = SHARI;
  const start = new Float32Array(count * 3);
  const cumulo = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const quatA = new Float32Array(count * 4);
  const quatB = new Float32Array(count * 4);
  const tempi = new Float32Array(count * 4);
  const colori = [];

  const n = new Vector3();
  const t = new Vector3();
  const bi = new Vector3();
  const aiuto = new Vector3();
  const base = new Matrix4();
  const qa = new Quaternion();
  const qb = new Quaternion();

  let i = 0;
  while (i < count) {
    const x = (rand() * 2 - 1) * a;
    const y = rand() * b;
    const z = (rand() * 2 - 1) * c;
    const f = Math.abs(x / a) ** p + Math.abs(y / b) ** p + Math.abs(z / c) ** p;
    // Guscio sottile vicino alla superficie: fitto, senza buchi sul cuore.
    if (f > 1 || f < 0.74 || y < 0.02) continue;
    target.set([x, y, z], i * 3);

    // Prima del pressaggio il riso è un mucchietto più largo e più basso.
    const hx = x * 1.3 + (rand() - 0.5) * 0.12;
    const hy = y * 0.58 + rand() * 0.03;
    const hz = z * 1.38 + (rand() - 0.5) * 0.12;
    cumulo.set([hx, hy, hz], i * 3);

    // Cade dall'alto, poco sopra il punto in cui atterra.
    start.set([hx + (rand() - 0.5) * 0.5, 1.7 + rand() * 1.2 + (y / b) * 0.5, hz + (rand() - 0.5) * 0.4], i * 3);

    n.set(
      (Math.sign(x) * Math.abs(x / a) ** (p - 1)) / a,
      (Math.abs(y / b) ** (p - 1)) / b,
      (Math.sign(z) * Math.abs(z / c) ** (p - 1)) / c,
    ).normalize();
    aiuto.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    t.crossVectors(n, aiuto).normalize();
    bi.crossVectors(t, n).normalize();
    base.makeBasis(t, n, bi);
    qb.setFromRotationMatrix(base);
    qa.set(rand() - 0.5, rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    if (qa.dot(qb) < 0) qa.set(-qa.x, -qa.y, -qa.z, -qa.w);
    quatA.set([qa.x, qa.y, qa.z, qa.w], i * 4);
    quatB.set([qb.x, qb.y, qb.z, qb.w], i * 4);

    // x: ritardo (prima la base), y: seme, z: taglia, w: rapporto lunghezza/spessore.
    const seme = rand();
    tempi.set([(y / b) * 0.2 + seme * 0.3, seme, 0.86 + rand() * 0.28, 0.88 + rand() * 0.24], i * 4);

    const l = 0.9 + rand() * 0.1;
    colori.push(new Color().setRGB(l, l * (0.98 + rand() * 0.02), l * (0.93 + rand() * 0.05)));
    i += 1;
  }
  return { start, cumulo, target, quatA, quatB, tempi, colori };
}

function materialeRiso(uniforms) {
  // Riso cotto: perlato, appena lucido e appiccicoso.
  const material = new MeshPhysicalMaterial({
    color: '#FFFCF5',
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    sheen: 0.5,
    sheenRoughness: 0.5,
    sheenColor: new Color('#ffffff'),
    emissive: '#2c2924',
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        attribute vec3 aStart;
        attribute vec3 aCumulo;
        attribute vec3 aTarget;
        attribute vec4 aQuatA;
        attribute vec4 aQuatB;
        attribute vec4 aTempi;
        uniform float uConverge;
        uniform float uPressa;
        uniform float uSchiaccia;
        uniform float uFetta;
        uniform float uTime;
        varying float vOcc;
        vec3 ruotaQ(vec3 v, vec4 q) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `float gCade = clamp((uConverge - aTempi.x) / 0.3, 0.0, 1.0);
        vec4 gQ = normalize(mix(aQuatA, aQuatB, clamp(gCade * 0.35 + uPressa * 0.65, 0.0, 1.0)));
        vec3 gScala = vec3(aTempi.w, 1.0, 1.0) * aTempi.z;
        vec3 objectNormal = ruotaQ(normalize(normal / gScala), gQ);`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `// Caduta: orizzontale morbida, verticale accelerata come per gravità,
        // poi un piccolo rimbalzo all'atterraggio.
        vec3 gPos;
        gPos.xz = mix(aStart.xz, aCumulo.xz, 1.0 - (1.0 - gCade) * (1.0 - gCade));
        gPos.y = mix(aStart.y, aCumulo.y, gCade * gCade);
        float gDopo = clamp((uConverge - aTempi.x - 0.3) / 0.08, 0.0, 1.0);
        gPos.y += sin(gDopo * 3.14159) * 0.035 * (1.0 - uPressa);
        // Il pressaggio porta il mucchietto alla forma del nigiri.
        gPos = mix(gPos, aTarget, uPressa);
        gPos.y *= 1.0 - 0.05 * uSchiaccia;
        gPos.xz *= 1.0 + 0.02 * uSchiaccia;
        // Ombra della fetta sul riso e contatto col piano.
        float gSotto = smoothstep(0.55, 0.95, aTarget.y / ${SHARI.b.toFixed(2)}) * (1.0 - smoothstep(0.5, 1.0, abs(aTarget.z) / ${SHARI.c.toFixed(2)}));
        vOcc = (1.0 - 0.35 * uFetta * gSotto) * mix(0.82, 1.0, smoothstep(0.0, 0.1, gPos.y));
        vec3 transformed = ruotaQ(position * gScala, gQ) + gPos;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vOcc;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vOcc;');
  };
  material.customProgramCacheKey = () => 'nagoya-riso-2';
  return material;
}

/* Il "cuore" del nigiri: riempie i vuoti tra i chicchi quando sono pressati. */
function geometriaCuore() {
  const { a, b, c, p } = SHARI;
  const geometry = new SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = geometry.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const s = (Math.abs(v.x / a) ** p + Math.abs(v.y / b) ** p + Math.abs(v.z / c) ** p) ** (-1 / p);
    v.multiplyScalar(s * 0.94);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/* ---- Salmone ------------------------------------------------------------- */

/* Colore e rilievo dalla stessa mano. Come nel salmone vero: bande di grasso
   larghe e sfumate che attraversano la fetta in diagonale con una leggera
   curva, carne che scurisce tra una banda e l'altra, fibre sottili. */
function trameSalmone() {
  const W = 2048;
  const H = 1024;
  const colore = document.createElement('canvas');
  const rilievo = document.createElement('canvas');
  colore.width = rilievo.width = W;
  colore.height = rilievo.height = H;
  const g = colore.getContext('2d');
  const r = rilievo.getContext('2d');
  const rand = random(11);

  const fondo = g.createLinearGradient(0, 0, 0, H);
  fondo.addColorStop(0, '#D85A33');
  fondo.addColorStop(0.35, '#EC7348');
  fondo.addColorStop(0.65, '#F07B50');
  fondo.addColorStop(1, '#DE6238');
  g.fillStyle = fondo;
  g.fillRect(0, 0, W, H);
  r.fillStyle = '#707070';
  r.fillRect(0, 0, W, H);

  // Il percorso di una banda: dal bordo superiore a quello inferiore,
  // spostata in avanti (la diagonale) e appena incurvata.
  const percorso = (ctx, x, piega, sbieco) => {
    ctx.beginPath();
    ctx.moveTo(x, -40);
    ctx.bezierCurveTo(x + sbieco * 0.25 + piega, H * 0.3, x + sbieco * 0.7 - piega, H * 0.7, x + sbieco, H + 40);
  };

  const bande = [];
  let x = -760;
  while (x < W + 80) {
    bande.push({ x, piega: (rand() - 0.5) * 120, sbieco: 560 + rand() * 140, larga: 22 + rand() ** 1.4 * 46 });
    x += 120 + rand() * 120;
  }

  g.lineCap = r.lineCap = 'round';
  for (const [i, b] of bande.entries()) {
    // La carne si fa più scura verso la banda successiva.
    const passo = (bande[i + 1]?.x ?? b.x + 180) - b.x;
    g.strokeStyle = 'rgba(150, 40, 15, 0.16)';
    g.lineWidth = passo * 0.45;
    g.save();
    g.translate(passo * 0.55, 0);
    percorso(g, b.x, b.piega, b.sbieco);
    g.stroke();
    g.restore();
    // Fibre: righe sottilissime parallele alle bande.
    for (let f = 0; f < 7; f++) {
      const scarto = b.larga * 0.6 + rand() * passo * 0.8;
      g.strokeStyle = rand() > 0.5 ? 'rgba(255, 190, 160, 0.08)' : 'rgba(140, 35, 10, 0.08)';
      g.lineWidth = 1 + rand() * 1.5;
      percorso(g, b.x + scarto, b.piega, b.sbieco);
      g.stroke();
    }
  }

  // Il grasso: tre passate, alone largo, corpo, nucleo più chiaro.
  for (const b of bande) {
    const strati = [
      [b.larga * 1.9, 'rgba(250, 196, 170, 0.28)', 26],
      [b.larga, 'rgba(250, 214, 196, 0.62)', 10],
      [b.larga * 0.4, 'rgba(255, 232, 220, 0.45)', 4],
    ];
    for (const [larghezza, tinta, sfuma] of strati) {
      g.shadowColor = tinta;
      g.shadowBlur = sfuma;
      g.strokeStyle = tinta;
      g.lineWidth = larghezza;
      percorso(g, b.x, b.piega, b.sbieco);
      g.stroke();
    }
    g.shadowBlur = 0;
    r.shadowColor = 'rgba(210,210,210,0.8)';
    r.shadowBlur = 14;
    r.strokeStyle = 'rgba(200,200,200,0.8)';
    r.lineWidth = b.larga;
    percorso(r, b.x, b.piega, b.sbieco);
    r.stroke();
    r.shadowBlur = 0;
  }

  // Grana minuta della carne.
  for (let k = 0; k < 9000; k++) {
    g.fillStyle = rand() > 0.5 ? 'rgba(255,200,170,0.05)' : 'rgba(120,30,10,0.05)';
    g.fillRect(rand() * W, rand() * H, 2 + rand() * 3, 2 + rand() * 3);
  }

  const mappa = new CanvasTexture(colore);
  mappa.colorSpace = SRGBColorSpace;
  mappa.anisotropy = 8;
  const bump = new CanvasTexture(rilievo);
  bump.anisotropy = 8;
  return { mappa, bump };
}

/* La fetta: due superfici (sopra e sotto) che si chiudono sui bordi, quindi
   niente spigoli da scatola. Il taglio a sbieco sposta il dorso rispetto alla
   base; le punte si assottigliano. Il morph target è la fetta posata sul riso. */
function geometriaFetta(dettaglio) {
  const { lunghezza: L, spessore: T, larghezza: W } = FETTA;
  const nu = dettaglio;
  const nv = Math.round(dettaglio / 3);
  const riga = nu + 1;
  const perFaccia = riga * (nv + 1);
  const piatta = new Float32Array(perFaccia * 2 * 3);
  const posata = new Float32Array(perFaccia * 2 * 3);
  const uv = new Float32Array(perFaccia * 2 * 2);
  const colori = new Float32Array(perFaccia * 2 * 3);
  const indici = [];

  for (let faccia = 0; faccia < 2; faccia++) {
    const segno = faccia === 0 ? 1 : -1;
    for (let j = 0; j <= nv; j++) {
      for (let i = 0; i <= nu; i++) {
        const u = (i / nu) * 2 - 1;
        const v = (j / nv) * 2 - 1;
        const meta = (W / 2) * (1 - 0.2 * Math.abs(u) ** 4);
        const z = v * meta;
        const spessore = (T / 2) * (1 - 0.5 * u * u) * Math.sqrt(Math.max(0, 1 - v ** 6)) * Math.sqrt(Math.max(0, 1 - u ** 8));
        const y = segno * spessore + (faccia === 0 ? 0.012 * Math.sin(u * 9 + v * 3) * (1 - u * u) : 0);
        const x = u * (L / 2) + segno * spessore * 1.3;
        const k = faccia * perFaccia + j * riga + i;
        piatta.set([x, y, z], k * 3);
        const cala = 0.3 * u * u + 0.07 * u ** 4;
        posata.set([x * 0.97, y - cala - 0.08 * v * v, z * 0.98], k * 3);
        uv.set([i / nu, j / nv], k * 2);
        // Dove la fetta è sottile la luce passa: più chiara e più rosata.
        const sottile = 1 - Math.min(1, spessore / (T / 2));
        colori.set([0.86 + 0.14 * sottile, 0.84 + 0.16 * sottile, 0.84 + 0.16 * sottile], k * 3);
      }
    }
    for (let j = 0; j < nv; j++) {
      for (let i = 0; i < nu; i++) {
        const a = faccia * perFaccia + j * riga + i;
        const b = a + 1;
        const c = a + riga;
        const d = c + 1;
        if (faccia === 0) indici.push(a, c, b, b, c, d);
        else indici.push(a, b, c, b, d, c);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(piatta, 3));
  geometry.setAttribute('uv', new BufferAttribute(uv, 2));
  geometry.setAttribute('color', new BufferAttribute(colori, 3));
  geometry.setIndex(indici);
  geometry.computeVertexNormals();

  const piegata = geometry.clone();
  piegata.setAttribute('position', new BufferAttribute(posata.slice(), 3));
  piegata.computeVertexNormals();
  geometry.morphAttributes.position = [new BufferAttribute(posata, 3)];
  geometry.morphAttributes.normal = [piegata.attributes.normal.clone()];
  piegata.dispose();
  return geometry;
}

/* ---- Contorno ------------------------------------------------------------ */

function ombraContatto() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const g = canvas.getContext('2d');
  // alphaMap legge il canale verde: gradiente opaco dal bianco al nero.
  g.fillStyle = '#000';
  g.fillRect(0, 0, 128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(0.4, '#9a9a9a');
  grad.addColorStop(1, '#000');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

/* Filigrana dell'anteprima, ripetuta e inclinata. */
function tramaFiligrana() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const g = canvas.getContext('2d');
  g.fillStyle = '#F2EDE3';
  g.font = '700 21px Arial, Helvetica, sans-serif';
  g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = '5px';
  const testo = 'DEMO · PRISMA LOCALE';
  g.fillText(testo, 14, 44);
  g.fillText(testo, 270, 120);
  g.fillText(testo, 270 - 512, 120);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.center.set(0.5, 0.5);
  texture.rotation = (24 * Math.PI) / 180;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/* Studio buio con poche strisce di luce: sul salmone e sul piano laccato
   diventano riflessi netti. La chiave arriva bassa da sinistra. */
function ambienteStudio() {
  const env = new Scene();
  const usa = [];
  const aggiungi = (geometry, material, posiziona) => {
    const mesh = new Mesh(geometry, material);
    posiziona(mesh);
    env.add(mesh);
    usa.push(geometry, material);
  };
  aggiungi(new BoxGeometry(30, 30, 30), new MeshBasicMaterial({ color: new Color('#0b100e'), side: BackSide }), () => {});
  const striscia = (w, h, posizione, intensita, colore = '#ffffff') =>
    aggiungi(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(colore).multiplyScalar(intensita), side: BackSide }),
      (mesh) => {
        mesh.position.set(...posizione);
        mesh.lookAt(0, 0, 0);
        mesh.rotateY(Math.PI);
      },
    );
  striscia(5, 3.2, [-9, 3, 4], 6, '#fff1e2');
  striscia(14, 0.4, [0, 4, -9], 5);
  striscia(0.35, 10, [9, 2, -3], 3.5, '#e6f0ff');
  striscia(8, 0.5, [0, 10, 0], 2);
  striscia(3, 1.2, [4, 1.2, 9], 1.6, '#ffe2cf');
  return { scene: env, dispose: () => usa.forEach((item) => item.dispose()) };
}

/* ---- Scena --------------------------------------------------------------- */

const NOOP = { ready: false, setProgress() {}, dispose() {} };

export function createNigiri(host, options = {}) {
  const { grains = 1500, dpr = 1.75, still = null, onReady, onFail, onLost, onRestored } = options;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: Boolean(still),
    });
  } catch (error) {
    canvas.remove();
    onFail?.(error);
    return NOOP;
  }

  renderer.debug.checkShaderErrors = import.meta.env.DEV;
  renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio || 1, dpr));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(NORI, 1);

  const scene = new Scene();
  scene.fog = new Fog(NORI, 6, 18);
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  scene.add(camera);

  const pmrem = new PMREMGenerator(renderer);
  const studio = ambienteStudio();
  const envTarget = pmrem.fromScene(studio.scene, 0.03);
  studio.dispose();
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.9;

  const chiave = new DirectionalLight('#fff2e4', 2.6);
  chiave.position.set(-5, 2, 3);
  const controluce = new DirectionalLight('#ffffff', 2.2);
  controluce.position.set(3, 3.2, -5);
  scene.add(chiave, controluce, new HemisphereLight('#e8ecea', '#3a3a34', 0.55));

  /* Piano laccato scuro: riflette le strisce di luce, sfuma nella nebbia. */
  const piano = new Mesh(
    new PlaneGeometry(40, 40),
    new MeshPhysicalMaterial({ color: '#0a0e0c', roughness: 0.7, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.3, envMapIntensity: 0.12 }),
  );
  piano.rotation.x = -Math.PI / 2;
  scene.add(piano);

  const ombra = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({
      color: '#000000',
      alphaMap: ombraContatto(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
  );
  ombra.rotation.x = -Math.PI / 2;
  ombra.position.y = 0.01;
  ombra.scale.set(SHARI.a * 2.7, SHARI.c * 3.1, 1);
  scene.add(ombra);

  /* Riso */
  const uniforms = {
    uConverge: { value: 0 },
    uPressa: { value: 0 },
    uSchiaccia: { value: 0 },
    uFetta: { value: 0 },
    uTime: { value: 0 },
  };
  const dati = chicchi(grains, random(2026));
  const chicco = geometriaChicco();
  chicco.setAttribute('aStart', new InstancedBufferAttribute(dati.start, 3));
  chicco.setAttribute('aCumulo', new InstancedBufferAttribute(dati.cumulo, 3));
  chicco.setAttribute('aTarget', new InstancedBufferAttribute(dati.target, 3));
  chicco.setAttribute('aQuatA', new InstancedBufferAttribute(dati.quatA, 4));
  chicco.setAttribute('aQuatB', new InstancedBufferAttribute(dati.quatB, 4));
  chicco.setAttribute('aTempi', new InstancedBufferAttribute(dati.tempi, 4));
  const riso = new InstancedMesh(chicco, materialeRiso(uniforms), grains);
  const identita = new Matrix4();
  for (let i = 0; i < grains; i++) {
    riso.setMatrixAt(i, identita);
    riso.setColorAt(i, dati.colori[i]);
  }
  // Le istanze si muovono nello shader: il bounding box di three non lo sa.
  riso.frustumCulled = false;
  scene.add(riso);

  const cuore = new Mesh(geometriaCuore(), new MeshStandardMaterial({ color: '#F2EDE2', roughness: 0.7, emissive: '#26231e' }));
  scene.add(cuore);

  /* Salmone */
  const trame = trameSalmone();
  const fetta = new Mesh(
    geometriaFetta(still ? 120 : 84),
    new MeshPhysicalMaterial({
      map: trame.mappa,
      bumpMap: trame.bump,
      bumpScale: 0.9,
      vertexColors: true,
      // Superficie umida, non laccata: riflesso morbido e largo.
      roughness: 0.46,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      sheen: 0.35,
      sheenRoughness: 0.5,
      sheenColor: new Color('#ffc8ae'),
      specularColor: new Color('#ffe6da'),
      // La carne lascia passare un po' di luce: un bagliore caldo nelle ombre.
      emissive: new Color('#5c1c08'),
      emissiveIntensity: 0.3,
      specularIntensity: 0.55,
    }),
  );
  scene.add(fetta);

  /* Filigrana: un piano agganciato alla camera, disegnato per ultimo. */
  const filigrana = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({ map: tramaFiligrana(), transparent: true, opacity: 0.05, depthTest: false, depthWrite: false, fog: false, toneMapped: false }),
  );
  filigrana.position.z = -1;
  filigrana.renderOrder = 999;
  camera.add(filigrana);

  /* ---- Stato ---- */
  const state = { target: 0, progress: 0, time: 0, distanza: 6.6 };

  function applica(P, t) {
    const C = smooth(0, 0.5, P);
    const pressa = morbido(clamp01((C - 0.8) / 0.2));
    uniforms.uConverge.value = C;
    uniforms.uPressa.value = pressa;
    uniforms.uTime.value = t;
    cuore.scale.set(1, 1, 1).multiplyScalar(Math.max(0.001, smooth(0.15, 1, pressa)));
    ombra.material.opacity = 0.85 * smooth(0.25, 1, C);

    // La fetta scende, si posa piegandosi sul riso, e le dita la premono un attimo.
    const F = morbido(clamp01((P - 0.46) / 0.3));
    const tocco = Math.sin(clamp01((P - 0.74) / 0.12) * Math.PI);
    uniforms.uSchiaccia.value = tocco;
    uniforms.uFetta.value = smooth(0.6, 1, F);
    cuore.scale.y *= 1 - 0.05 * tocco;
    fetta.visible = P > 0.42;
    fetta.position.set(lerp(-0.55, 0, F), lerp(3.4, QUOTA_FETTA, F) - 0.03 * tocco, lerp(0.25, 0, F));
    fetta.rotation.set(lerp(0.3, 0, F), lerp(0.85, 0.05, F), lerp(-0.45, 0, F));
    fetta.scale.set(1 + 0.02 * tocco, 1 - 0.12 * tocco, 1 + 0.02 * tocco);
    fetta.morphTargetInfluences[0] = smooth(0.45, 1, F);

    const e = morbido(P);
    const az = lerp(-0.9, 0.55, e) + Math.sin(t * 0.21) * 0.035;
    // Si parte un po' più in alto e più lontani; si scende all'altezza del banco.
    const el = lerp(0.62, 0.33, e);
    const r = state.distanza * lerp(1.22, 1, e);
    camera.position.set(Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r + GUARDA.y, Math.cos(az) * Math.cos(el) * r);
    camera.lookAt(GUARDA);
  }

  function resize() {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 38 : 30;
    camera.updateProjectionMatrix();
    const meta = Math.tan(((camera.fov / 2) * Math.PI) / 180);
    // Il nigiri (largo ~2.8) deve stare sempre nell'inquadratura.
    state.distanza = Math.max(camera.aspect < 1 ? 6.2 : 6.6, 1.7 / (meta * camera.aspect));
    scene.fog.near = state.distanza * 0.75;
    scene.fog.far = state.distanza * 2.5;
    // La filigrana copre il fotogramma; un modulo largo ~460 px a schermo.
    const altezza = 2 * meta;
    const larghezza = altezza * camera.aspect;
    filigrana.scale.set(larghezza, altezza, 1);
    const modulo = (460 / h) * altezza;
    filigrana.material.map.repeat.set(larghezza / modulo, altezza / (modulo * (160 / 512)));
  }

  /* ---- Immagine statica ---- */
  if (still) {
    resize();
    applica(still.progress ?? 1, still.time ?? 6);
    const compiled = renderer.extensions.has('KHR_parallel_shader_compile')
      ? renderer.compileAsync(scene, camera)
      : Promise.resolve(renderer.compile(scene, camera));
    return compiled.then(() => {
      renderer.render(scene, camera);
      return {
        canvas,
        dispose: () => {
          renderer.dispose();
          canvas.remove();
        },
      };
    });
  }

  /* ---- Ciclo ---- */
  let rafId = 0;
  let running = false;
  let visible = false;
  let lost = false;
  let wasLost = false;
  let disposed = false;
  let last = 0;
  const perf = { skip: 120, frames: 0, total: 0, stage: 0 };

  function monitor(dt) {
    if (perf.stage > 1) return;
    if (perf.skip > 0) {
      perf.skip -= 1;
      return;
    }
    perf.frames += 1;
    perf.total += dt;
    if (perf.frames < 90) return;
    const media = perf.total / perf.frames;
    perf.frames = 0;
    perf.total = 0;
    if (media <= 1 / 42) {
      perf.stage = 2;
    } else if (perf.stage === 0) {
      renderer.setPixelRatio(1);
      resize();
      perf.stage = 1;
      perf.skip = 30;
    } else {
      perf.stage = 2;
      onFail?.(new Error('frame rate insufficiente'));
    }
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    state.time += dt;
    state.progress += (state.target - state.progress) * (1 - Math.exp(-dt * 6));
    applica(state.progress, state.time);
    renderer.render(scene, camera);
    monitor(dt);
  }

  function setRunning(on) {
    if (on === running || disposed || lost) return;
    running = on;
    if (on) {
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  const sync = () => setRunning(visible && !document.hidden);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!running && !lost && !disposed) renderer.render(scene, camera);
  });
  const onContextLost = (event) => {
    event.preventDefault();
    lost = true;
    wasLost = true;
    running = false;
    cancelAnimationFrame(rafId);
    onLost?.();
  };
  const onContextRestored = () => {
    lost = false;
    onRestored?.();
  };
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  resize();
  applica(0, 0);

  const api = {
    ready: false,
    setProgress(value) {
      state.target = value;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (wasLost) {
        if (!lost) renderer.forceContextLoss();
        canvas.remove();
        return;
      }
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        for (const material of materials) {
          for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
          material.dispose();
        }
      });
      scene.environment = null;
      envTarget.dispose();
      pmrem.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      if (!lost) renderer.forceContextLoss();
      canvas.remove();
    },
  };

  const compiled = renderer.extensions.has('KHR_parallel_shader_compile')
    ? renderer.compileAsync(scene, camera).catch(() => {})
    : Promise.resolve(renderer.compile(scene, camera));
  compiled.then(() => {
    if (disposed || lost) return;
    state.progress = state.target;
    applica(state.progress, 0);
    renderer.render(scene, camera);
    api.ready = true;
    observer.observe(host);
    resizeObserver.observe(host);
    onReady?.();
  });

  return api;
}
