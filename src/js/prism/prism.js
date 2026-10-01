/* IL PRISMA — mossa firma n.1.
   Un prisma di vetro fisico (transmission + dispersion) intercetta un
   fascio di luce bianca e lo restituisce come spettro. Il mouse lo
   inclina, lo scroll lo fa ruotare e scivolare via.

   Caricato solo su desktop con puntatore fine e movimento consentito:
   su mobile e con movimento ridotto c'è un'immagine statica, renderizzata
   da questa stessa scena (vedi scripts/render-stills.mjs). */

import {
  NeutralToneMapping,
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  Scene,
  ShaderMaterial,
  Shape,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { gsap } from 'gsap';
import { backdrop, beam, dust, fan } from './shaders.js';

const NOTTE = '#0A0F24';
const SPECTRUM = ['#FF5A48', '#FF9F43', '#FFE066', '#6EE7A8', '#5CC8FF', '#6F7BFF', '#B07CFF'];
const FOV = 30;
const VIEW_HEIGHT = 10; // unità visibili in altezza sul piano z = 0
const BASE_SPIN = 0.55;

/* Composizione in un "fotogramma" di riferimento che copre il viewport come
   object-fit: cover (ancorato in alto): la scena live e le immagini statiche
   mettono il prisma esattamente nello stesso punto. */
const LAYOUTS = {
  wide: { aspect: 1.6, prism: [0.775, 0.335], size: 0.44, source: [-0.06, 0.1], angle: -0.44, spread: 0.36 },
  tall: { aspect: 9 / 16, prism: [0.66, 0.225], size: 0.27, source: [-0.14, 0.075], angle: -0.78, spread: 0.46 },
};

function frameFor(layout, aspect) {
  let frameW;
  let frameH;
  if (aspect >= layout.aspect) {
    frameW = VIEW_HEIGHT * aspect;
    frameH = frameW / layout.aspect;
  } else {
    frameH = VIEW_HEIGHT;
    frameW = frameH * layout.aspect;
  }
  const toWorld = (fx, fy) => new Vector3((fx - 0.5) * frameW, VIEW_HEIGHT / 2 - fy * frameH, 0);
  return { frameW, frameH, toWorld };
}

/* Prisma triangolare con spigoli arrotondati: gli spigoli vivi del vetro
   vero non esistono, e quelli smussati catturano la luce. Altezza 1. */
function prismGeometry(detail) {
  const R = 0.31;
  const corner = 0.075;
  const pts = [0, 1, 2].map((i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    return new Vector2(Math.cos(a) * R, Math.sin(a) * R);
  });
  const shape = new Shape();
  pts.forEach((p, i) => {
    const prev = pts[(i + 2) % 3];
    const next = pts[(i + 1) % 3];
    const a = p.clone().add(prev.clone().sub(p).normalize().multiplyScalar(corner));
    const b = p.clone().add(next.clone().sub(p).normalize().multiplyScalar(corner));
    if (i === 0) shape.moveTo(a.x, a.y);
    else shape.lineTo(a.x, a.y);
    shape.quadraticCurveTo(p.x, p.y, b.x, b.y);
  });
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: 1,
    steps: 1,
    curveSegments: detail,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: Math.max(2, Math.round(detail / 2)),
  });
  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/* Generatore pseudo-casuale con seme: il pulviscolo delle immagini statiche
   è sempre lo stesso. */
function random(seed) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* Ambiente da studio fotografico: stanza buia e poche strisce di luce.
   Sul vetro diventano tagli netti che scorrono quando il prisma ruota. */
function studioEnvironment() {
  const env = new Scene();
  const disposables = [];
  const add = (geometry, material, setup) => {
    const mesh = new Mesh(geometry, material);
    setup(mesh);
    env.add(mesh);
    disposables.push(geometry, material);
  };
  add(new BoxGeometry(30, 30, 30), new MeshBasicMaterial({ color: new Color('#141c44'), side: BackSide }), () => {});
  const strip = (w, h, position, intensity, color = '#ffffff') =>
    add(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: BackSide }),
      (mesh) => {
        mesh.position.set(...position);
        mesh.lookAt(0, 0, 0);
        mesh.rotateY(Math.PI);
      },
    );
  strip(0.35, 18, [-8, 0, -5], 9);
  strip(0.25, 18, [8, 1, -3], 7);
  strip(16, 0.35, [0, 10, -2], 5);
  strip(7, 4, [0, 7, -10], 1.1, '#dfe6ff');
  strip(0.5, 12, [-3, 0, 10], 3, '#c8d4ff');
  strip(0.4, 12, [10, 0, 8], 2.5, '#ffe8cc');
  strip(0.3, 14, [-10, 2, 4], 4);
  return {
    scene: env,
    dispose: () => disposables.forEach((item) => item.dispose()),
  };
}

const NOOP = { ready: false, intro() {}, setScroll() {}, dispose() {} };

export function createPrism(host, options = {}) {
  const { onReady, onFail, onLost, onRestored, still = null } = options;

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
  renderer.setPixelRatio(still ? 1 : Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.transmissionResolutionScale = still ? 1 : 0.85;
  renderer.setClearColor(NOTTE, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 1, 80);
  camera.position.z = VIEW_HEIGHT / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
  camera.updateMatrixWorld();

  /* Ambiente: solo per i riflessi, filtrato una volta dal PMREM. */
  const pmrem = new PMREMGenerator(renderer);
  const studio = studioEnvironment();
  const envTarget = pmrem.fromScene(studio.scene, 0.02);
  studio.dispose();
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 1;

  const key = new DirectionalLight('#ffffff', 2.4);
  key.position.set(-6, 5, 6);
  scene.add(key);

  /* ---- Fondo ---- */
  const backdropMaterial = new ShaderMaterial({
    vertexShader: backdrop.vertex,
    fragmentShader: backdrop.fragment,
    uniforms: {
      uBg: { value: new Color(NOTTE) },
      uHaze: { value: new Color('#2b3a8e') },
      uPrism: { value: new Vector2(0.75, 0.6) },
      uAspect: { value: 1.6 },
      uReveal: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const backdropMesh = new Mesh(new PlaneGeometry(1, 1), backdropMaterial);
  backdropMesh.frustumCulled = false;
  backdropMesh.renderOrder = -10;
  scene.add(backdropMesh);

  /* ---- Fascio ---- */
  const beamMaterial = new ShaderMaterial({
    vertexShader: beam.vertex,
    fragmentShader: beam.fragment,
    uniforms: {
      uA: { value: new Vector3() },
      uB: { value: new Vector3() },
      uWidthA: { value: 1 },
      uWidthB: { value: 0.5 },
      uColor: { value: new Color('#FFF6E8') },
      uTime: { value: 0 },
      uGrow: { value: 0 },
      uIntensity: { value: 1 },
      uInner: { value: 0 },
    },
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const beamMesh = new Mesh(new PlaneGeometry(1, 1, 32, 1), beamMaterial);
  beamMesh.frustumCulled = false;
  beamMesh.renderOrder = -5;
  scene.add(beamMesh);

  /* Il tratto di luce dentro il vetro: disegnato dopo il prisma, sopra. */
  const innerMaterial = beamMaterial.clone();
  innerMaterial.transparent = true;
  innerMaterial.uniforms.uInner.value = 1;
  innerMaterial.uniforms.uIntensity.value = 0.55;
  innerMaterial.uniforms.uColor.value = new Color('#FFFDF6');
  const innerMesh = new Mesh(new PlaneGeometry(1, 1, 8, 1), innerMaterial);
  innerMesh.frustumCulled = false;
  innerMesh.renderOrder = 10;
  scene.add(innerMesh);

  /* ---- Spettro ---- */
  const fanMaterial = new ShaderMaterial({
    vertexShader: fan.vertex,
    fragmentShader: fan.fragment,
    uniforms: {
      uOrigin: { value: new Vector3() },
      uAngle: { value: -0.4 },
      uSpread: { value: 0.36 },
      uLength: { value: 8 },
      uAperture: { value: 0.2 },
      uStops: { value: SPECTRUM.map((hex) => new Color(hex)) },
      uTime: { value: 0 },
      uOpen: { value: 0 },
      uIntensity: { value: 1 },
    },
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const fanMesh = new Mesh(new PlaneGeometry(1, 1, 24, 24), fanMaterial);
  fanMesh.frustumCulled = false;
  fanMesh.renderOrder = -4;
  scene.add(fanMesh);

  /* ---- Pulviscolo ---- */
  const DUST = 240;
  const rand = random(7);
  const seeds = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    seeds[i * 3] = rand();
    seeds[i * 3 + 1] = (rand() * 2 - 1) * rand();
    seeds[i * 3 + 2] = rand();
  }
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute('position', new BufferAttribute(new Float32Array(DUST * 3), 3));
  dustGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 3));
  const dustMaterial = new ShaderMaterial({
    vertexShader: dust.vertex,
    fragmentShader: dust.fragment,
    uniforms: {
      uA: { value: new Vector3() },
      uB: { value: new Vector3() },
      uWidth: { value: 0.4 },
      uTime: { value: 0 },
      uSize: { value: 2.6 },
      uGrow: { value: 0 },
    },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const dustPoints = new Points(dustGeometry, dustMaterial);
  dustPoints.frustumCulled = false;
  scene.add(dustPoints);

  /* ---- Il prisma ---- */
  // Il colore leggermente sopra 1 compensa la luce persa per Fresnel:
  // senza, il vetro risulterebbe più scuro dello sfondo che attraversa.
  const glass = new MeshPhysicalMaterial({
    color: new Color(1.5, 1.52, 1.6),
    metalness: 0,
    roughness: 0.035,
    transmission: 1,
    thickness: 0.3,
    ior: 1.5,
    dispersion: 4.5,
    attenuationColor: new Color('#F2F4FF'),
    attenuationDistance: 4,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    specularIntensity: 1,
    envMapIntensity: 1.4,
  });
  const prism = new Mesh(prismGeometry(still ? 16 : 12), glass);
  const pivot = new Group();
  pivot.add(prism);
  scene.add(pivot);

  /* ---- Stato ---- */
  const state = {
    width: 1,
    height: 1,
    layout: LAYOUTS.wide,
    frame: frameFor(LAYOUTS.wide, 1.6),
    prismPos: new Vector3(),
    source: new Vector3(),
    size: 1,
    time: still ? 7.3 : 0,
    introSpin: 0,
    pointer: { x: 0, y: 0, tx: 0, ty: 0 },
    scroll: { current: 0, target: 0 },
  };
  const tmpEntry = new Vector3();
  const tmpSource = new Vector3();
  const tmpProjected = new Vector3();

  function layoutScene() {
    const aspect = state.width / state.height;
    const layout = still?.layout ? LAYOUTS[still.layout] : aspect >= 1 ? LAYOUTS.wide : LAYOUTS.tall;
    const frame = frameFor(layout, aspect);
    state.layout = layout;
    state.frame = frame;
    state.prismPos.copy(frame.toWorld(layout.prism[0], layout.prism[1]));
    state.source.copy(frame.toWorld(layout.source[0], layout.source[1]));
    state.size = layout.size * frame.frameH;

    pivot.scale.setScalar(state.size);
    backdropMaterial.uniforms.uAspect.value = aspect;
    beamMaterial.uniforms.uWidthA.value = frame.frameH * 0.1;
    beamMaterial.uniforms.uWidthB.value = frame.frameH * 0.055;
    innerMaterial.uniforms.uWidthA.value = frame.frameH * 0.05;
    innerMaterial.uniforms.uWidthB.value = frame.frameH * 0.07;
    dustMaterial.uniforms.uWidth.value = frame.frameH * 0.045;
    fanMaterial.uniforms.uAperture.value = state.size * 0.11;
    const toEdge = ((1 - layout.prism[0]) * frame.frameW) / Math.cos(layout.angle);
    fanMaterial.uniforms.uLength.value = Math.max(toEdge * 1.7, frame.frameW * 0.35);
  }

  function update(dt) {
    state.time += dt;
    const t = state.time;
    const p = state.pointer;
    const s = state.scroll;
    const ease = 1 - Math.exp(-dt * 3);
    p.x += (p.tx - p.x) * ease;
    p.y += (p.ty - p.y) * ease;
    s.current += (s.target - s.current) * (1 - Math.exp(-dt * 6));

    const { size, frame, layout } = state;
    const drift = s.current * frame.frameH * 0.16;

    prism.rotation.y = BASE_SPIN + state.introSpin + p.x * 0.42 + s.current * 1.3 + Math.sin(t * 0.23) * 0.07;
    prism.rotation.x = -p.y * 0.12 + Math.sin(t * 0.17) * 0.035;
    pivot.rotation.x = 0.34 - p.y * 0.05;
    pivot.rotation.z = -0.12 + p.x * 0.03;
    pivot.position.set(
      state.prismPos.x + p.x * size * 0.03,
      state.prismPos.y - drift + Math.sin(t * 0.4) * size * 0.012,
      0,
    );

    const center = pivot.position;
    tmpEntry.set(center.x - size * 0.12, center.y + size * 0.03, 0);
    tmpSource.set(state.source.x, state.source.y - p.y * frame.frameH * 0.03 - drift, 0);
    beamMaterial.uniforms.uA.value.copy(tmpSource);
    beamMaterial.uniforms.uB.value.copy(tmpEntry);
    dustMaterial.uniforms.uA.value.copy(tmpSource);
    dustMaterial.uniforms.uB.value.copy(tmpEntry);

    const swing = prism.rotation.y - BASE_SPIN;
    fanMaterial.uniforms.uOrigin.value.set(center.x + size * 0.1, center.y - size * 0.03, 0);
    innerMaterial.uniforms.uA.value.copy(tmpEntry);
    innerMaterial.uniforms.uB.value.copy(fanMaterial.uniforms.uOrigin.value);
    innerMaterial.uniforms.uTime.value = t;
    innerMaterial.uniforms.uGrow.value = fanMaterial.uniforms.uOpen.value > 0.02 ? 1.05 : 0;
    fanMaterial.uniforms.uAngle.value = layout.angle + swing * 0.16 - p.y * 0.05;
    fanMaterial.uniforms.uSpread.value = layout.spread * (1 + Math.max(-0.4, Math.min(swing, 1.5)) * 0.22);
    fanMaterial.uniforms.uIntensity.value = 1 - s.current * 0.65;

    beamMaterial.uniforms.uTime.value = t;
    fanMaterial.uniforms.uTime.value = t;
    dustMaterial.uniforms.uTime.value = t;

    tmpProjected.copy(center).project(camera);
    backdropMaterial.uniforms.uPrism.value.set(tmpProjected.x * 0.5 + 0.5, tmpProjected.y * 0.5 + 0.5);
  }

  function resize() {
    state.width = still ? still.width : host.clientWidth || 1;
    state.height = still ? still.height : host.clientHeight || 1;
    renderer.setSize(state.width, state.height, false);
    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    dustMaterial.uniforms.uSize.value = 2.6 * renderer.getPixelRatio() * (Math.min(state.width, state.height) / 900);
    layoutScene();
  }

  /* ---- Immagine statica: un fotogramma, completamente aperto ---- */
  if (still) {
    resize();
    beamMaterial.uniforms.uGrow.value = 1.05;
    dustMaterial.uniforms.uGrow.value = 1.05;
    fanMaterial.uniforms.uOpen.value = 1.12;
    backdropMaterial.uniforms.uReveal.value = 1;
    update(0);
    renderer.render(scene, camera);
    return {
      canvas,
      dispose: () => {
        renderer.dispose();
        canvas.remove();
      },
    };
  }

  /* ---- Ciclo di rendering ---- */
  let rafId = 0;
  let running = false;
  let visible = true;
  let lost = false;
  let wasLost = false;
  let disposed = false;
  let last = 0;
  let introTimeline = null;
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
    const average = perf.total / perf.frames;
    perf.frames = 0;
    perf.total = 0;
    if (average <= 1 / 42) {
      perf.stage = 2;
    } else if (perf.stage === 0) {
      // Prima riduzione: meno pixel, trasmissione a metà risoluzione.
      renderer.setPixelRatio(1);
      renderer.transmissionResolutionScale = 0.5;
      resize();
      perf.stage = 1;
      perf.skip = 30;
    } else {
      // Ancora lento: meglio l'immagine statica di un hero che scatta.
      perf.stage = 2;
      onFail?.(new Error('frame rate insufficiente'));
    }
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    update(dt);
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

  const syncRunning = () => setRunning(visible && !document.hidden);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncRunning();
  });
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!running && !lost && !disposed) renderer.render(scene, camera);
  });

  const onPointer = (event) => {
    state.pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
    state.pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onPointerLeave = () => {
    state.pointer.tx = 0;
    state.pointer.ty = 0;
  };
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

  window.addEventListener('pointermove', onPointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', syncRunning);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  resize();
  update(0);

  const api = {
    ready: false,

    intro() {
      if (introTimeline || disposed) return;
      introTimeline = gsap
        .timeline()
        .fromTo(backdropMaterial.uniforms.uReveal, { value: 0 }, { value: 1, duration: 2.2, ease: 'power2.out' }, 0)
        .fromTo(prism.scale, { x: 0.84, y: 0.84, z: 0.84 }, { x: 1, y: 1, z: 1, duration: 2.4, ease: 'expo.out' }, 0)
        .fromTo(state, { introSpin: -1.1 }, { introSpin: 0, duration: 2.8, ease: 'expo.out' }, 0)
        .fromTo(beamMaterial.uniforms.uGrow, { value: 0 }, { value: 1.05, duration: 1.15, ease: 'power3.inOut' }, 0.2)
        .fromTo(dustMaterial.uniforms.uGrow, { value: 0 }, { value: 1.05, duration: 1.15, ease: 'power3.inOut' }, 0.2)
        .fromTo(fanMaterial.uniforms.uOpen, { value: 0 }, { value: 1.12, duration: 1.7, ease: 'power3.out' }, 1.1);
    },

    setScroll(progress) {
      state.scroll.target = progress;
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      cancelAnimationFrame(rafId);
      introTimeline?.kill();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', syncRunning);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      // Dopo una perdita di contesto le risorse GPU sono già sparite: si
      // liberano solo i riferimenti, senza chiamate al contesto nuovo.
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
          if (material.uniforms) {
            for (const uniform of Object.values(material.uniforms)) if (uniform.value?.isTexture) uniform.value.dispose();
          }
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

  /* Compila gli shader senza bloccare dove il browser lo permette
     (KHR_parallel_shader_compile), poi primo fotogramma e via. */
  const compiled = renderer.extensions.has('KHR_parallel_shader_compile')
    ? renderer.compileAsync(scene, camera).catch(() => {})
    : Promise.resolve(renderer.compile(scene, camera));
  compiled.then(() => {
    if (disposed || lost) return;
    renderer.render(scene, camera);
    api.ready = true;
    observer.observe(host);
    resizeObserver.observe(host);
    onReady?.();
  });

  return api;
}
