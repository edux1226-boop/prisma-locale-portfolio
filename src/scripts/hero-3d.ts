// Hamburger 3D procedurale per l'hero: nessun modello o texture da scaricare, tutto geometria.
// Lo scroll lo gira e lo scompone strato per strato (pane, insalata, cipolla, pomodoro, formaggio, carne, base), poi lo ricompone.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LatheGeometry, CylinderGeometry, PlaneGeometry, RingGeometry, TorusGeometry, SphereGeometry,
  InstancedMesh, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial, DirectionalLight, PMREMGenerator, Vector2, Vector3, Quaternion, Matrix4,
  SplineCurve, DoubleSide, ACESFilmicToneMapping, SRGBColorSpace, CanvasTexture, BufferGeometry, Float32BufferAttribute, Color,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mulberry = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function tint(g: BufferGeometry, base: string, spread: number, rnd: () => number) {
  const c = new Color(base), n = g.attributes.position.count, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const k = 1 - spread + rnd() * spread * 2; arr[i * 3] = c.r * k; arr[i * 3 + 1] = c.g * k; arr[i * 3 + 2] = c.b * k; }
  g.setAttribute('color', new Float32BufferAttribute(arr, 3));
}
const spline = (pts: [number, number][], n = 28) => new SplineCurve(pts.map(([x, y]) => new Vector2(x, y))).getPoints(n);

type Layer = { g: Group; base: Vector3; dx: number; dy: number; dz: number; rx: number; ry: number; rz: number };

function build() {
  const rnd = mulberry(11);
  const burger = new Group();
  const layers: Layer[] = [];
  const add = (g: Group, y: number, off: [number, number, number], rot: [number, number, number] = [0, 0, 0]) => {
    g.position.y = y; burger.add(g);
    layers.push({ g, base: g.position.clone(), dx: off[0], dy: off[1], dz: off[2], rx: rot[0], ry: rot[1], rz: rot[2] });
  };

  // pane inferiore
  const botGeo = new LatheGeometry(spline([[0, 0], [0.9, 0], [1.03, 0.05], [1.08, 0.16], [1.05, 0.27], [0.96, 0.32], [0, 0.32]]), 72);
  botGeo.translate(0, -0.16, 0);
  const crumb = new MeshPhysicalMaterial({ color: '#c98a45', roughness: 0.62, clearcoat: 0.12, side: DoubleSide });
  const bot = new Group(); bot.add(new Mesh(botGeo, crumb)); add(bot, 0.16, [-0.9, -1.5, 0.25], [0, 0.3, -0.18]);

  // carne
  const pGeo = new CylinderGeometry(0.97, 0.94, 0.3, 64, 8, false);
  const pp = pGeo.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), r = Math.hypot(x, z);
    const n = (Math.sin(x * 9 + z * 7) + Math.sin(x * 17 - z * 13) * 0.5) * 0.012 + (rnd() - 0.5) * 0.018;
    const k = r > 0.2 ? 1 + n / Math.max(r, 0.3) : 1;
    pp.setXYZ(i, x * k, y + (Math.abs(y) > 0.14 ? n : 0), z * k);
  }
  pGeo.computeVertexNormals(); tint(pGeo, '#4b2a17', 0.22, rnd);
  const patty = new Group(); patty.add(new Mesh(pGeo, new MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.02 })));
  add(patty, 0.47, [0.75, -0.55, 0.05], [0.05, -0.4, 0.08]);

  // formaggio che cola agli angoli
  const cGeo = new PlaneGeometry(2.05, 2.05, 18, 18); cGeo.rotateX(-Math.PI / 2);
  const cp = cGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) { const d = Math.hypot(cp.getX(i), cp.getZ(i)); cp.setY(i, -smooth(0.8, 1.45, d) * 0.3 + Math.sin(d * 6) * 0.008); }
  cGeo.computeVertexNormals();
  const cheese = new Group(); const cm = new Mesh(cGeo, new MeshPhysicalMaterial({ color: '#f6b40a', roughness: 0.32, clearcoat: 0.3, side: DoubleSide })); cm.rotation.y = Math.PI / 4; cheese.add(cm);
  add(cheese, 0.66, [-0.95, 0.05, 0.1], [0, 0.55, 0.12]);

  // pomodoro
  const tomato = new Group(); const tm = new MeshStandardMaterial({ color: '#c7392b', roughness: 0.38 });
  for (const [y, dx] of [[0, 0], [0.075, 0.05]] as const) { const m = new Mesh(new CylinderGeometry(0.8, 0.8, 0.07, 56), tm); m.position.set(dx, y - 0.035, 0); tomato.add(m); }
  add(tomato, 0.75, [0.55, 0.55, -0.2], [0.1, 0.2, 0.1]);

  // cipolla rossa
  const onion = new Group(); const om = new MeshStandardMaterial({ color: '#d9bfe0', roughness: 0.45 });
  for (const r of [0.38, 0.6, 0.8]) { const t = new Mesh(new TorusGeometry(r, 0.032, 10, 56), om); t.rotation.x = Math.PI / 2; onion.add(t); }
  add(onion, 0.86, [0.85, 0.95, 0.3], [0.2, 0, -0.1]);

  // insalata arricciata
  const lGeo = new RingGeometry(0.02, 1.22, 96, 14); lGeo.rotateX(-Math.PI / 2);
  const lp = lGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), z = lp.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x); lp.setY(i, Math.sin(a * 11 + r * 4) * 0.055 * r + Math.sin(a * 23) * 0.025 * r * r); }
  lGeo.computeVertexNormals(); tint(lGeo, '#79b13d', 0.16, rnd);
  const lettuce = new Group(); lettuce.add(new Mesh(lGeo, new MeshStandardMaterial({ vertexColors: true, roughness: 0.55, side: DoubleSide })));
  add(lettuce, 0.95, [-0.75, 1.35, 0.35], [-0.18, 0.3, -0.28]);

  // pane superiore con semi di sesamo
  const topPts = spline([[0, 0], [0.97, 0], [1.07, 0.05], [1.1, 0.17], [1.08, 0.36], [0.98, 0.6], [0.78, 0.82], [0.5, 0.97], [0.22, 1.04], [0, 1.06]], 40);
  const topGeo = new LatheGeometry(topPts, 72); topGeo.translate(0, -0.5, 0);
  const top = new Group(); top.add(new Mesh(topGeo, new MeshPhysicalMaterial({ color: '#b9631c', roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.35, side: DoubleSide })));
  const N = 96, seeds = new InstancedMesh(new SphereGeometry(0.035, 8, 6), new MeshStandardMaterial({ color: '#f2dfb0', roughness: 0.6 }), N);
  const dummy = new Matrix4(), q = new Quaternion(), up = new Vector3(0, 1, 0), nrm = new Vector3(), sc = new Vector3(1.5, 0.55, 0.9), pos = new Vector3();
  for (let i = 0; i < N; i++) {
    const j = 4 + Math.floor(rnd() * (topPts.length - 6)), a = topPts[j], b = topPts[j + 1], t = rnd();
    const r = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t, th = rnd() * Math.PI * 2;
    const tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1, nr = ty / l, ny = -tx / l;
    pos.set(r * Math.cos(th), y - 0.5 + 0.012, r * Math.sin(th)); nrm.set(nr * Math.cos(th), ny, nr * Math.sin(th)).normalize();
    q.setFromUnitVectors(up, nrm); dummy.compose(pos, q, sc); seeds.setMatrixAt(i, dummy);
  }
  top.add(seeds);
  add(top, 1.49, [0.95, 2.15, 0.2], [0.1, -0.6, 0.28]);

  burger.position.y = -1.0;
  return { burger, layers };
}

export function initHero3D(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = SRGBColorSpace;
  let dpr = Math.min(devicePixelRatio || 1, 1.75); renderer.setPixelRatio(dpr);
  const scene = new Scene();
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.55;
  const key = new DirectionalLight('#fff3e0', 2.4); key.position.set(3, 5, 4); scene.add(key);
  const rim = new DirectionalLight('#ffffff', 1.1); rim.position.set(-4, 2, -4); scene.add(rim);

  const { burger, layers } = build();
  const rig = new Group(); rig.add(burger); scene.add(rig);

  // ombra finta a terra
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const x = sc.getContext('2d')!; const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const shadow = new Mesh(new PlaneGeometry(4.4, 4.4), new MeshBasicMaterial({ map: new CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.75; rig.add(shadow);

  const FOV = 30, camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
  let w = 0, h = 0, asp = 1, zAsm = 7.5, zExp = 12.5, mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, run = false, raf = 0, last = performance.now(), cur = 0;
  const tanH = Math.tan((FOV * Math.PI) / 360);
  const size = () => {
    w = canvas.clientWidth; h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); asp = w / h; camera.aspect = asp;
    zAsm = Math.max(9.2, 3.4 / (2 * tanH * asp)); zExp = Math.max(13.5, 3.8 / (2 * tanH * asp));
    if (asp > 1.1) camera.setViewOffset(w, h, -w * 0.15, h * 0.02, w, h); else camera.setViewOffset(w, h, 0, h * 0.12, w, h);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(size).observe(canvas); size();

  const progress = () => { const r = hero.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  // qualita' adattiva: se il frame medio e' lento scende la risoluzione, una volta sola
  let acc = 0, nf = 0, tuned = false;
  const guard = (t: number) => { if (tuned) return; acc += t; if (++nf === 90) { tuned = true; if (acc / 90 > 28 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); size(); } } };
  const frame = (now: number) => {
    raf = 0; if (!run) return;
    const dt = Math.min(64, now - last); last = now;
    const p = progress();
    // 0-12% fermo, 12-50% si scompone, fino a 72% resta aperto, 72-95% si ricompone
    const e = smooth(0.1, 0.5, p) * (1 - smooth(0.72, 0.96, p));
    cur += (e - cur) * (1 - Math.exp(-dt / 110));
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    for (const l of layers) {
      const k = clamp(cur * 1.15 - (l.dy < 0 ? 0 : 0.0));
      l.g.position.set(l.base.x + l.dx * k * (asp > 1.1 ? 0.72 : 1), l.base.y + l.dy * k, l.base.z + l.dz * k);
      l.g.rotation.set(l.rx * k, l.ry * k, l.rz * k);
    }
    rig.rotation.y = p * Math.PI * 2.4 + now / 9000 + (mx - 0.5) * 0.5;
    rig.rotation.x = 0.28 - cur * 0.1 + (my - 0.5) * 0.18;
    shadow.scale.setScalar(1 + cur * 0.35); (shadow.material as MeshBasicMaterial).opacity = 0.85 - cur * 0.3;
    const z = zAsm + (zExp - zAsm) * cur;
    camera.position.set(0, 1.1 + cur * 0.5, z); camera.lookAt(0, 0, 0);
    renderer.render(scene, camera); guard(dt);
    raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf && run) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth; tmy = e.clientY / innerHeight; }, { passive: true });
  new IntersectionObserver(([en]) => { run = en.isIntersecting && !document.hidden; go(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { run = !document.hidden; go(); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); run = false; hero.classList.remove('three'); });
  run = true; frame(performance.now());
  requestAnimationFrame(() => hero.classList.add('three'));
}
