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

function chicchi(count, rand) {
  const { a, b, c, p } = SHARI;
  const start = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const quatA = new Float32Array(count * 4);
  const quatB = new Float32Array(count * 4);
  const tempi = new Float32Array(count * 2);
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
    // Solo un guscio vicino alla superficie: i chicchi interni non si vedono.
    if (f > 1 || f < 0.62 || y < 0.025) continue;

    target.set([x, y, z], i * 3);

    // Il chicco si stende sulla superficie: asse lungo tangente, "su" lungo la normale.
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

    // Partenza: un anello basso e largo attorno al punto in cui nascerà il nigiri.
    const ang = rand() * Math.PI * 2;
    const raggio = 2.3 + rand() ** 0.8 * 1.7;
    start.set([Math.cos(ang) * raggio, 0.15 + rand() ** 1.5 * 1.1, Math.sin(ang) * raggio * 0.8], i * 3);

    // Prima arrivano i chicchi della base, poi quelli in cima.
    const seme = rand();
    tempi.set([(y / b) * 0.24 + seme * 0.16, seme], i * 2);

    const l = 0.93 + rand() * 0.07;
    colori.push(new Color().setRGB(l, l * (0.985 + rand() * 0.015), l * (0.95 + rand() * 0.03)));
    i += 1;
  }
  return { start, target, quatA, quatB, tempi, colori };
}

function materialeRiso(uniforms) {
  const material = new MeshStandardMaterial({
    color: '#FFFDF8',
    roughness: 0.36,
    metalness: 0,
    emissive: '#3b3832',
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uConverge = uniforms.uConverge;
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        attribute vec3 aStart;
        attribute vec3 aTarget;
        attribute vec4 aQuatA;
        attribute vec4 aQuatB;
        attribute vec2 aTempi;
        uniform float uConverge;
        uniform float uTime;
        vec3 ruotaQ(vec3 v, vec4 q) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
        vec3 ruotaY(vec3 p, float a) { float c = cos(a); float s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
        float morbido(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5; }`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `float gE = morbido(clamp((uConverge - aTempi.x) / 0.6, 0.0, 1.0));
        vec4 gQ = normalize(mix(aQuatA, aQuatB, gE));
        vec3 objectNormal = ruotaQ(normal, gQ);`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `float gLibero = 1.0 - gE;
        vec3 gDeriva = vec3(sin(uTime * 0.7 + aTempi.y * 40.0), cos(uTime * 0.55 + aTempi.y * 31.0), sin(uTime * 0.45 + aTempi.y * 23.0)) * 0.08;
        vec3 gDa = ruotaY(aStart + gDeriva * gLibero, (aTempi.y * 2.4 + uTime * 0.07) * gLibero);
        vec3 gPos = mix(gDa, aTarget, gE);
        gPos.y += sin(gE * 3.14159) * (0.2 + aTempi.y * 0.35);
        vec3 transformed = ruotaQ(position, gQ) + gPos;`,
      );
  };
  material.customProgramCacheKey = () => 'nagoya-riso';
  return material;
}

/* Il "cuore" del nigiri: riempie i vuoti tra i chicchi quando sono arrivati. */
function geometriaCuore() {
  const { a, b, c, p } = SHARI;
  const geometry = new SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = geometry.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const s = (Math.abs(v.x / a) ** p + Math.abs(v.y / b) ** p + Math.abs(v.z / c) ** p) ** (-1 / p);
    v.multiplyScalar(s * 0.93);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/* ---- Salmone ------------------------------------------------------------- */

function tramaSalmone() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const g = canvas.getContext('2d');
  const fondo = g.createLinearGradient(0, 0, 0, 512);
  fondo.addColorStop(0, '#D4461E');
  fondo.addColorStop(0.35, '#FF7A4D');
  fondo.addColorStop(0.7, '#FA7042');
  fondo.addColorStop(1, '#E2582D');
  g.fillStyle = fondo;
  g.fillRect(0, 0, 1024, 512);

  // Le venature di grasso: diagonali, come i tagli di tutto il sito.
  const rand = random(11);
  g.lineCap = 'round';
  let x0 = -620;
  while (x0 < 1100) {
    const larghezza = 4 + rand() ** 1.6 * 12;
    const curva = 160 + rand() * 120;
    const sbieco = 430 + rand() * 90;
    g.shadowColor = 'rgba(255, 228, 210, 0.8)';
    g.shadowBlur = 9;
    g.strokeStyle = `rgba(255, 236, 224, ${0.5 + rand() * 0.38})`;
    g.lineWidth = larghezza;
    g.beginPath();
    g.moveTo(x0, -30);
    g.quadraticCurveTo(x0 + curva, 256, x0 + sbieco, 542);
    g.stroke();
    if (rand() > 0.45) {
      g.shadowBlur = 0;
      g.strokeStyle = 'rgba(255, 216, 196, 0.28)';
      g.lineWidth = 1.5 + rand() * 1.5;
      const scarto = larghezza + 10 + rand() * 14;
      g.beginPath();
      g.moveTo(x0 + scarto, -30);
      g.quadraticCurveTo(x0 + curva + scarto, 256, x0 + sbieco + scarto, 542);
      g.stroke();
    }
    x0 += 58 + rand() * 62;
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* Una fetta tagliata a sbieco: spessore che cala verso le punte, facce
   delle estremità inclinate. Il morph target è la stessa fetta posata e
   piegata sul riso. */
function geometriaFetta(dettaglio) {
  const { lunghezza: L, spessore: T, larghezza: W } = FETTA;
  const geometry = new BoxGeometry(L, T, W, dettaglio, 2, Math.round(dettaglio / 3));
  const pos = geometry.attributes.position;
  const piatta = new Float32Array(pos.array.length);
  const posata = new Float32Array(pos.array.length);
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const u = x / (L / 2);
    const v = z / (W / 2);
    y *= 1 - 0.45 * u * u;
    z *= 1 - 0.2 * Math.abs(u) ** 4;
    x += y * 1.6;
    piatta.set([x, y, z], i * 3);
    const cala = 0.3 * u * u + 0.07 * u ** 4;
    posata.set([x * 0.97, y - cala - 0.07 * v * v, z * 0.98], i * 3);
  }
  pos.array.set(piatta);
  geometry.computeVertexNormals();

  const piegata = geometry.clone();
  piegata.attributes.position.array.set(posata);
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
    new MeshPhysicalMaterial({ color: '#0a0e0c', roughness: 0.55, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.22, envMapIntensity: 0.32 }),
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
  const uniforms = { uConverge: { value: 0 }, uTime: { value: 0 } };
  const dati = chicchi(grains, random(2026));
  const geometriaChicco = new SphereGeometry(1, 9, 6);
  geometriaChicco.scale(0.08, 0.036, 0.036);
  geometriaChicco.setAttribute('aStart', new InstancedBufferAttribute(dati.start, 3));
  geometriaChicco.setAttribute('aTarget', new InstancedBufferAttribute(dati.target, 3));
  geometriaChicco.setAttribute('aQuatA', new InstancedBufferAttribute(dati.quatA, 4));
  geometriaChicco.setAttribute('aQuatB', new InstancedBufferAttribute(dati.quatB, 4));
  geometriaChicco.setAttribute('aTempi', new InstancedBufferAttribute(dati.tempi, 2));
  const riso = new InstancedMesh(geometriaChicco, materialeRiso(uniforms), grains);
  const identita = new Matrix4();
  for (let i = 0; i < grains; i++) {
    riso.setMatrixAt(i, identita);
    riso.setColorAt(i, dati.colori[i]);
  }
  // Le istanze si muovono nello shader: il bounding box di three non lo sa.
  riso.frustumCulled = false;
  scene.add(riso);

  const cuore = new Mesh(geometriaCuore(), new MeshStandardMaterial({ color: '#F6F1E7', roughness: 0.7, emissive: '#2a2722' }));
  scene.add(cuore);

  /* Salmone */
  const fetta = new Mesh(
    geometriaFetta(still ? 96 : 64),
    new MeshPhysicalMaterial({
      map: tramaSalmone(),
      roughness: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      sheen: 0.6,
      sheenRoughness: 0.45,
      sheenColor: new Color('#ffb393'),
      emissive: new Color('#5a1c08'),
      emissiveIntensity: 0.35,
      specularIntensity: 0.7,
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
    uniforms.uConverge.value = C;
    uniforms.uTime.value = t;
    cuore.scale.setScalar(Math.max(0.001, smooth(0.62, 0.97, C)));
    ombra.material.opacity = 0.85 * smooth(0.25, 1, C);

    const F = morbido(clamp01((P - 0.46) / 0.32));
    fetta.visible = P > 0.42;
    fetta.position.set(lerp(-0.55, 0, F), lerp(3.4, QUOTA_FETTA, F), lerp(0.25, 0, F));
    fetta.rotation.set(lerp(0.3, 0, F), lerp(0.85, 0.05, F), lerp(-0.45, 0, F));
    fetta.morphTargetInfluences[0] = smooth(0.5, 1, F);

    const e = morbido(P);
    const az = lerp(-0.9, 0.55, e) + Math.sin(t * 0.21) * 0.035;
    // Si parte dall'alto, come guardando il tagliere; si scende all'altezza del banco.
    const el = lerp(0.95, 0.33, e);
    const r = state.distanza * lerp(1.18, 1, e);
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
