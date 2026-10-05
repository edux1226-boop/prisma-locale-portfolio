/* Il plastico: il territorio tra il Gran Sasso e l'Adriatico come un modello
   in gesso da studio di architettura, con le curve di livello incise.
   Rilievo stilizzato, non un modello digitale del terreno.

   Asse x: da ovest (-5, la montagna) a est (+5, il mare). Asse z: verso sud. */

import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';

// i colori della palette arrivano dai token CSS, non si ricopiano qui
const token = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
const GESSO = '#F7F2E9';
const BASE = -0.42;

/* ---- Rumore deterministico ------------------------------------------------ */
function hash(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function rumore(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) {
  let s = 0, a = 0.5;
  for (let i = 0; i < 5; i++) { s += a * rumore(x, z); x = x * 2.03 + 7.1; z = z * 2.03 + 3.3; a *= 0.5; }
  return s;
}
function creste(x, z) {
  let s = 0, a = 0.5;
  for (let i = 0; i < 5; i++) { s += a * (1 - Math.abs(rumore(x, z) * 2 - 1)); x = x * 2.1 + 1.7; z = z * 2.1 + 9.2; a *= 0.5; }
  return s;
}
const COSTA = (z) => 3.75 + 0.18 * Math.sin(z * 1.6 + 0.4);
const BORGO = new Vector3(2.0, 0, 0.05);

function altezza(x, z) {
  // il massiccio del Gran Sasso, allungato da nord-ovest a sud-est
  const mx = x + 3.4, mz = z - 0.3;
  const massiccio = Math.exp(-((mx * mx) / 1.1 + (mz * mz) / 4.2 + mx * mz * 0.35)) * 0.95;
  // tre cime sulla stessa cresta, la più alta al centro
  const cima = (cx, cz, a) => Math.exp(-(((x - cx) ** 2) / 0.07 + ((z - cz) ** 2) / 0.12)) * a;
  const picchi = cima(-3.7, 0.05, 0.34) + cima(-3.35, -0.75, 0.22) + cima(-3.95, 0.95, 0.18);
  let h = massiccio + picchi + creste(x * 1.6 + 3, z * 1.6) * 0.36 * massiccio;
  // le colline: più mosse a ovest, più dolci verso la costa
  const est = MathUtils.smoothstep(x, -2.6, 3.6);
  h += (fbm(x * 0.85 + 2, z * 0.85) * 0.5 + 0.08) * (1 - est * 0.7);
  // valli dei fiumi che scendono al mare
  const valle = MathUtils.smoothstep(x, -3.2, -1.2);
  h -= 0.2 * Math.exp(-((z - 1.35 - 0.16 * Math.sin(x * 1.3)) ** 2) / 0.07) * valle;
  h -= 0.15 * Math.exp(-((z + 1.0 - 0.12 * Math.sin(x * 1.1 + 1)) ** 2) / 0.05) * valle;
  // il colle di Mosciano
  h += 0.2 * Math.exp(-(((x - BORGO.x) ** 2) + ((z - BORGO.z) ** 2)) / 0.14);
  // verso il mare tutto scende fino alla spiaggia
  const costa = COSTA(z);
  h *= 1 - MathUtils.smoothstep(x, costa - 1.1, costa);
  return x > costa ? 0 : Math.max(h, 0.006);
}

/* ---- Geometrie ------------------------------------------------------------ */
function inOmbra(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function terreno(materiale) {
  const geo = new PlaneGeometry(10, 6, 260, 156);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, altezza(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  return inOmbra(new Mesh(geo, materiale));
}

/* I fianchi del plastico: il profilo del terreno tagliato e portato giù
   fino alla base, come un blocco di gesso segato. */
function fianchi(materiale) {
  const lati = [
    (t) => [-5 + t * 10, -3], (t) => [5, -3 + t * 6],
    (t) => [5 - t * 10, 3], (t) => [-5, 3 - t * 6],
  ];
  const vertici = [];
  const N = 160;
  for (const punto of lati) {
    for (let i = 0; i < N; i++) {
      const [x0, z0] = punto(i / N);
      const [x1, z1] = punto((i + 1) / N);
      const h0 = altezza(x0, z0);
      const h1 = altezza(x1, z1);
      // senso antiorario visto da fuori: si vedono solo le facce esterne
      vertici.push(x0, h0, z0, x1, h1, z1, x0, BASE, z0, x1, h1, z1, x1, BASE, z1, x0, BASE, z0);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(vertici), 3));
  geo.computeVertexNormals();
  return inOmbra(new Mesh(geo, materiale));
}

/* Gesso con le curve di livello incise: una ogni 6 cm di quota, più marcata
   ogni cinque. Il mare è rigato in orizzontale. */
function gesso() {
  const m = new MeshStandardMaterial({ color: GESSO, roughness: 0.95, metalness: 0 });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uInchiostro = { value: new Color(token('--inchiostro')) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMondo;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMondo = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMondo;\nuniform vec3 uInchiostro;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float q = vMondo.y / 0.06;
        float w = fwidth(q);
        float linea = 1. - smoothstep(0., w * 1.3, abs(fract(q - .5) - .5));
        float maggiore = 1. - smoothstep(0., w * 1.8, abs(fract(q / 5. - .5) - .5) * 5.);
        float sopra = step(.012, vMondo.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, uInchiostro, (linea * .16 + maggiore * .24) * sopra);
        if (vMondo.y < .003) {
          float r = vMondo.z / .045;
          float riga = 1. - smoothstep(0., fwidth(r) * 1.2, abs(fract(r - .5) - .5));
          diffuseColor.rgb = mix(vec3(.84, .8, .73), uInchiostro, riga * .14);
        }`);
  };
  return m;
}

/* Il borgo: cinque blocchetti di gesso e un anello d'ottone sul colle.
   (L'anello che pulsa è il punto dell'etichetta, in CSS: il 3D resta fermo.) */
function borgo() {
  const g = new Group();
  const y = altezza(BORGO.x, BORGO.z);
  const bianco = new MeshStandardMaterial({ color: '#FBF8F2', roughness: 0.8 });
  const blocchi = [[0, 0, 0.07, 0.05, 0.06], [0.07, 0.02, 0.05, 0.07, 0.05], [-0.06, 0.04, 0.05, 0.04, 0.07], [0.02, -0.06, 0.06, 0.045, 0.04], [0.035, 0.0, 0.022, 0.11, 0.022]];
  for (const [dx, dz, sx, sy, sz] of blocchi) {
    const b = new Mesh(new BoxGeometry(sx, sy, sz), bianco);
    b.position.set(BORGO.x + dx, y + sy / 2 - 0.005, BORGO.z + dz);
    b.castShadow = true;
    g.add(b);
  }
  const anello = new Mesh(new RingGeometry(0.16, 0.172, 64), new MeshBasicMaterial({ color: token('--ottone'), transparent: true, opacity: 0.7 }));
  anello.rotation.x = -Math.PI / 2;
  anello.position.set(BORGO.x, y + 0.012, BORGO.z);
  g.add(anello);
  return g;
}

/* ---- La regia della camera ------------------------------------------------
   Quattro inquadrature, una per ogni passo del racconto in pagina più la vista
   d'insieme iniziale: territorio.js ricava i passi da quante sono. */
const INQUADRATURE = [
  { posizione: [2.6, 11.6, 14.8], mira: [1.0, 0, 0.2] },             // il plastico intero
  { posizione: [-0.6, 3.6, 5.2], mira: [-3.3, 0.6, 0.2] },           // verso il Gran Sasso
  { posizione: [5.4, 3.4, 5.0], mira: [3.3, 0, -0.3] },              // verso il mare
  { posizione: [3.15, 1.25, 2.05], mira: [BORGO.x - 0.05, 0.32, BORGO.z] }, // il colle
];
const POSIZIONI = new CatmullRomCurve3(INQUADRATURE.map((q) => new Vector3(...q.posizione)));
const MIRE = new CatmullRomCurve3(INQUADRATURE.map((q) => new Vector3(...q.mira)));

const ANCORE = {
  sasso: new Vector3(-3.75, altezza(-3.75, 0.05) + 0.06, 0.05),
  mare: new Vector3(4.45, 0.02, -0.9),
  borgo: new Vector3(BORGO.x, altezza(BORGO.x, BORGO.z) + 0.24, BORGO.z),
};

/* ---- La scena -------------------------------------------------------------
   Si disegna solo quando serve: quando cambia lo scroll, quando si muove il
   mouse (finché la camera non si è assestata) e quando cambia la misura. */
export function createPlastico(contenitore, { etichette = {}, still = null, spostamento = 0, colonna = null } = {}) {
  const fondo = token('--pietra-scura');
  const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: Boolean(still) });
  renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  // luce e modello non si muovono: l'ombra si calcola una volta sola
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(fondo);
  contenitore.append(renderer.domElement);

  const scena = new Scene();
  scena.fog = new Fog(fondo, 15, 34);
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);

  scena.add(new HemisphereLight('#FFF8EC', '#B8AB96', 1.5));
  const sole = new DirectionalLight('#FFE6C2', 2.7);
  sole.position.set(-7, 5.2, 4.2);
  sole.castShadow = true;
  sole.shadow.mapSize.set(2048, 2048);
  sole.shadow.camera.left = -7; sole.shadow.camera.right = 7;
  sole.shadow.camera.top = 6; sole.shadow.camera.bottom = -6;
  sole.shadow.camera.near = 1; sole.shadow.camera.far = 22;
  sole.shadow.bias = -0.0006;
  sole.shadow.normalBias = 0.02;
  scena.add(sole);

  const modello = new Group();
  modello.add(terreno(gesso()));
  modello.add(fianchi(new MeshStandardMaterial({ color: '#E9E1D4', roughness: 1 })));
  modello.add(borgo());
  scena.add(modello);

  const tavolo = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.13 }));
  tavolo.rotation.x = -Math.PI / 2;
  tavolo.position.y = BASE;
  tavolo.receiveShadow = true;
  scena.add(tavolo);

  let progresso = 0;
  let w = 1, h = 1, limiteTesto = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const pos = new Vector3();
  const mira = new Vector3();
  const proiezione = new Vector3();
  const voci = Object.entries(etichette).map(([nome, nodo]) => ({ ancora: ANCORE[nome], nodo }));

  // per i telefoni (solo immagine statica): dall'alto, la montagna in cima e il mare in fondo
  const dallAlto = () => { camera.position.set(0.15, 14.4, 9.6); camera.lookAt(0.1, 0, 0.5); };
  const daScroll = () => {
    const t = MathUtils.clamp(progresso, 0, 1);
    POSIZIONI.getPoint(t, pos);
    MIRE.getPoint(t, mira);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    camera.position.set(pos.x + mouse.x * 0.35, pos.y - mouse.y * 0.2, pos.z);
    camera.lookAt(mira);
  };
  const inquadra = still?.verticale ? dallAlto : daScroll;
  if (still?.verticale) {
    modello.rotation.y = -Math.PI / 2;
    modello.updateMatrixWorld();
  }

  function posizionaEtichette() {
    for (const { ancora, nodo } of voci) {
      proiezione.copy(ancora).applyMatrix4(modello.matrixWorld).project(camera);
      const x = ((proiezione.x + 1) / 2) * w;
      nodo.style.transform = `translate3d(${x}px, ${((1 - proiezione.y) / 2) * h}px, 0)`;
      // sotto la colonna del testo l'etichetta si fa da parte
      nodo.classList.toggle('is-coperta', x < limiteTesto);
    }
  }

  function misura() {
    w = contenitore.clientWidth;
    h = contenitore.clientHeight;
    limiteTesto = colonna ? colonna.getBoundingClientRect().right - contenitore.getBoundingClientRect().left : 0;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // su schermi stretti la camera si allontana un po'
    camera.fov = w / h < 1.2 ? 38 : 30;
    // il soggetto si sposta a destra per lasciare spazio al testo
    if (spostamento) camera.setViewOffset(w, h, -w * spostamento, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  function disegna() {
    inquadra();
    renderer.render(scena, camera);
    posizionaEtichette();
  }

  misura();
  if (still) {
    progresso = still.progresso ?? 0;
    disegna();
    return null;
  }

  let raf = 0;
  let inVista = false;
  let ultimo = 0;
  let lenti = 0;
  const assestata = () => Math.abs(mouse.tx - mouse.x) < 1e-3 && Math.abs(mouse.ty - mouse.y) < 1e-3;
  const ciclo = (ora) => {
    raf = 0;
    // se i frame consecutivi sono lenti abbassa la risoluzione, una volta sola
    if (ora - ultimo < 100) lenti = ora - ultimo > 1000 / 40 ? lenti + 1 : Math.max(0, lenti - 1);
    if (lenti > 40 && renderer.getPixelRatio() > 1) { renderer.setPixelRatio(1); misura(); lenti = 0; }
    ultimo = ora;
    disegna();
    if (!assestata()) richiedi();
  };
  const richiedi = () => {
    if (!raf && inVista && !document.hidden) raf = requestAnimationFrame(ciclo);
  };

  new IntersectionObserver(([voce]) => {
    inVista = voce.isIntersecting;
    richiedi();
  }).observe(contenitore);
  document.addEventListener('visibilitychange', richiedi);
  new ResizeObserver(() => { misura(); richiedi(); }).observe(contenitore);
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / window.innerWidth - 0.5;
    mouse.ty = e.clientY / window.innerHeight - 0.5;
    richiedi();
  }, { passive: true });

  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    renderer.shadowMap.needsUpdate = true;
    richiedi();
  });

  return {
    imposta(p) {
      if (p === progresso) return;
      progresso = p;
      richiedi();
    },
  };
}
