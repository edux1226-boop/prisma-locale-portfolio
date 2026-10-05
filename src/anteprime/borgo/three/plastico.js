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

const FONDO = '#DCD2C1'; // come .territorio in borgo.css
const GESSO = '#F7F2E9';
const INCHIOSTRO = new Color('#2A241D');
const OTTONE = '#9A7D52';
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
const liscio = (t) => { const c = Math.min(Math.max(t, 0), 1); return c * c * (3 - 2 * c); };

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
  const est = liscio((x + 2.6) / 6.2);
  h += (fbm(x * 0.85 + 2, z * 0.85) * 0.5 + 0.08) * (1 - est * 0.7);
  // valli dei fiumi che scendono al mare
  const valle = liscio((x + 3.2) / 2);
  h -= 0.2 * Math.exp(-((z - 1.35 - 0.16 * Math.sin(x * 1.3)) ** 2) / 0.07) * valle;
  h -= 0.15 * Math.exp(-((z + 1.0 - 0.12 * Math.sin(x * 1.1 + 1)) ** 2) / 0.05) * valle;
  // il colle di Mosciano
  h += 0.2 * Math.exp(-(((x - BORGO.x) ** 2) + ((z - BORGO.z) ** 2)) / 0.14);
  // verso il mare tutto scende fino alla spiaggia
  const costa = COSTA(z);
  h *= 1 - liscio((x - (costa - 1.1)) / 1.1);
  return x > costa ? 0 : Math.max(h, 0.006);
}

/* ---- Geometrie ------------------------------------------------------------ */
function terreno(materiale) {
  const geo = new PlaneGeometry(10, 6, 340, 204);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, altezza(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const mesh = new Mesh(geo, materiale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* I fianchi del plastico: il profilo del terreno tagliato e portato giù
   fino alla base, come un blocco di gesso segato. */
function fianchi(materiale) {
  const lati = [
    [(t) => [-5 + t * 10, -3]], [(t) => [5, -3 + t * 6]],
    [(t) => [5 - t * 10, 3]], [(t) => [-5, 3 - t * 6]],
  ];
  const vertici = [];
  const N = 160;
  for (const [punto] of lati) {
    for (let i = 0; i < N; i++) {
      const [x0, z0] = punto(i / N);
      const [x1, z1] = punto((i + 1) / N);
      const h0 = Math.max(altezza(x0, z0), 0);
      const h1 = Math.max(altezza(x1, z1), 0);
      // senso antiorario visto da fuori: si vedono solo le facce esterne
      vertici.push(x0, h0, z0, x1, h1, z1, x0, BASE, z0, x1, h1, z1, x1, BASE, z1, x0, BASE, z0);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(vertici), 3));
  geo.computeVertexNormals();
  const mesh = new Mesh(geo, materiale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* Gesso con le curve di livello incise: una ogni 6 cm di quota, più marcata
   ogni cinque. Il mare è rigato in orizzontale. */
function gesso() {
  const m = new MeshStandardMaterial({ color: GESSO, roughness: 0.95, metalness: 0 });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uInchiostro = { value: INCHIOSTRO };
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

/* Il borgo: cinque blocchetti di gesso, una spilla d'ottone e un'onda. */
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
  const onda = new Mesh(new RingGeometry(0.16, 0.175, 64), new MeshBasicMaterial({ color: OTTONE, transparent: true, opacity: 0.8 }));
  onda.rotation.x = -Math.PI / 2;
  onda.position.set(BORGO.x, y + 0.012, BORGO.z);
  g.add(onda);
  g.userData.onda = onda;
  return g;
}

/* ---- La regia della camera ------------------------------------------------ */
const POSIZIONI = new CatmullRomCurve3([
  new Vector3(2.6, 11.6, 14.8),  // il plastico intero
  new Vector3(-0.6, 3.6, 5.2),   // verso il Gran Sasso
  new Vector3(5.4, 3.4, 5.0),    // verso il mare
  new Vector3(3.15, 1.25, 2.05), // il colle
]);
const MIRE = new CatmullRomCurve3([
  new Vector3(1.0, 0, 0.2),
  new Vector3(-3.3, 0.6, 0.2),
  new Vector3(3.3, 0, -0.3),
  new Vector3(BORGO.x - 0.05, 0.32, BORGO.z),
]);

const ANCORE = {
  sasso: new Vector3(-3.75, 0, 0.05),
  mare: new Vector3(4.45, 0.02, -0.9),
  borgo: new Vector3(BORGO.x, 0, BORGO.z),
};
ANCORE.sasso.y = altezza(ANCORE.sasso.x, ANCORE.sasso.z) + 0.06;
ANCORE.borgo.y = altezza(BORGO.x, BORGO.z) + 0.24;

/* ---- La scena ------------------------------------------------------------- */
export function createPlastico(contenitore, { etichette = null, still = null, spostamento = 0, margineTesto = 0 } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: Boolean(still) });
  renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(FONDO);
  contenitore.append(renderer.domElement);

  const scena = new Scene();
  scena.fog = new Fog(FONDO, 15, 34);
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

  const materiale = gesso();
  const modello = new Group();
  modello.add(terreno(materiale));
  const lati = new MeshStandardMaterial({ color: '#E9E1D4', roughness: 1 });
  modello.add(fianchi(lati));
  const segno = borgo();
  modello.add(segno);
  scena.add(modello);

  const tavolo = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.13 }));
  tavolo.rotation.x = -Math.PI / 2;
  tavolo.position.y = BASE;
  tavolo.receiveShadow = true;
  scena.add(tavolo);

  let progresso = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const pos = new Vector3();
  const mira = new Vector3();
  const proiezione = new Vector3();

  let inquadra = function inquadraScroll() {
    const t = Math.min(Math.max(progresso, 0), 1);
    POSIZIONI.getPoint(t, pos);
    MIRE.getPoint(t, mira);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    camera.position.set(pos.x + mouse.x * 0.35, pos.y - mouse.y * 0.2, pos.z);
    camera.lookAt(mira);
  };

  function posizionaEtichette() {
    if (!etichette) return;
    const w = contenitore.clientWidth, h = contenitore.clientHeight;
    for (const [nome, nodo] of Object.entries(etichette)) {
      proiezione.copy(ANCORE[nome]).applyMatrix4(modello.matrixWorld).project(camera);
      const x = ((proiezione.x + 1) / 2) * w;
      nodo.style.transform = `translate3d(${x}px, ${((1 - proiezione.y) / 2) * h}px, 0)`;
      // sotto la colonna del testo l'etichetta si fa da parte
      nodo.classList.toggle('is-coperta', x < w * margineTesto);
    }
  }

  function misura() {
    const w = contenitore.clientWidth, h = contenitore.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // su schermi stretti la camera si allontana un po'
    camera.fov = w / h < 1.2 ? 38 : 30;
    // il soggetto si sposta a destra per lasciare spazio al testo
    if (spostamento) camera.setViewOffset(w, h, -w * spostamento, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  let tempo = 0;
  function disegna(dt = 0) {
    tempo += dt;
    inquadra();
    const onda = segno.userData.onda;
    const fase = (tempo / 2.8) % 1;
    onda.scale.setScalar(0.4 + fase * 1.6);
    onda.material.opacity = 0.8 * (1 - fase);
    renderer.render(scena, camera);
    posizionaEtichette();
  }

  misura();
  if (still) {
    progresso = still.progresso ?? 0;
    if (still.verticale) {
      // per i telefoni: dall'alto, la montagna in cima e il mare in fondo
      modello.rotation.y = -Math.PI / 2;
      modello.updateMatrixWorld();
      inquadra = () => { camera.position.set(0.15, 14.4, 9.6); camera.lookAt(0.1, 0, 0.5); };
    }
    disegna(0.9);
    return { canvas: renderer.domElement, camera };
  }

  let raf = 0;
  let attivo = false;
  let ultimo = performance.now();
  let lenti = 0;
  const ciclo = (ora) => {
    const dt = Math.min((ora - ultimo) / 1000, 0.1);
    ultimo = ora;
    // se il frame è lento abbassa la risoluzione, una volta sola
    if (dt > 1 / 40) lenti++; else lenti = Math.max(0, lenti - 1);
    if (lenti > 40 && renderer.getPixelRatio() > 1) { renderer.setPixelRatio(1); misura(); lenti = 0; }
    disegna(dt);
    raf = attivo ? requestAnimationFrame(ciclo) : 0;
  };
  const avvia = () => { if (attivo) return; attivo = true; ultimo = performance.now(); raf = requestAnimationFrame(ciclo); };
  const ferma = () => { attivo = false; cancelAnimationFrame(raf); raf = 0; };

  const io = new IntersectionObserver(([voce]) => (voce.isIntersecting && !document.hidden ? avvia() : ferma()));
  io.observe(contenitore);
  const visibilita = () => (document.hidden ? ferma() : avvia());
  document.addEventListener('visibilitychange', visibilita);
  const ro = new ResizeObserver(misura);
  ro.observe(contenitore);
  const muovi = (e) => {
    mouse.tx = e.clientX / window.innerWidth - 0.5;
    mouse.ty = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener('pointermove', muovi, { passive: true });

  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); ferma(); });
  renderer.domElement.addEventListener('webglcontextrestored', () => avvia());

  return {
    imposta(p) { progresso = p; },
    distruggi() {
      ferma();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', visibilita);
      window.removeEventListener('pointermove', muovi);
      scena.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
