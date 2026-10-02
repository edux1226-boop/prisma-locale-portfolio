/* DESTINO · "Dalle 17 alle 3"
   Un solo ciclo guida tutto: il ticker di GSAP fa avanzare Lenis (che
   aggiorna ScrollTrigger) e disegna le due scene Three.js quando sono
   visibili. Senza GSAP o senza WebGL la pagina resta completa. */
(function () {
  'use strict';

  var root = document.documentElement;
  var WA = 'https://wa.me/393490885513?text=';

  document.addEventListener('DOMContentLoaded', avvia);

  function avvia() {
    var RIDOTTO = !root.classList.contains('motion');
    var PICCOLO = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    var G = window.gsap;
    var ST = window.ScrollTrigger;
    var SPLIT = window.SplitText;

    initPreventivo();
    var orologio = initOrologio();

    if (!G || !ST) {
      // Motore non disponibile (CDN irraggiungibile): pagina statica e completa.
      root.classList.add('senza-3d');
      sbloccaIntro();
      return;
    }
    G.registerPlugin(ST);
    if (SPLIT) G.registerPlugin(SPLIT);
    ST.config({ ignoreMobileResize: true });

    /* ---- Scroll morbido sul ticker di GSAP ---- */
    var lenis = null;
    if (!RIDOTTO && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ST.update);
      G.ticker.add(function (time) { lenis.raf(time * 1000); });
      G.ticker.lagSmoothing(0);
    }
    initAncore(lenis, RIDOTTO);

    /* ---- Scene 3D ---- */
    var scene = { lanterne: null, giro: null };
    var puoi3D = webglOk();
    var giroVicino = false;
    var introPartita = false;
    var hero = document.querySelector('[data-hero]');
    var hostLanterne = document.querySelector('[data-lanterne]');
    var sezGiro = document.querySelector('[data-giro]');
    var hostGiro = document.querySelector('[data-giro-tela]');
    var palco = document.querySelector('[data-giro-palco]');
    var tempi = [].slice.call(document.querySelectorAll('[data-tempo]'));
    var spadaSvg = document.querySelector('[data-spada-svg]');
    var progressoGiro = 0;
    var soglie = [0.16, 0.44, 0.72];

    function montaLanterne() {
      if (!puoi3D || !window.THREE || scene.lanterne) return Boolean(scene.lanterne);
      scene.lanterne = creaLanterne(hostLanterne, { piccolo: PICCOLO, statico: RIDOTTO });
      root.classList.toggle('con-3d', Boolean(scene.lanterne));
      return Boolean(scene.lanterne);
    }
    function montaGiro() {
      if (!puoi3D || !window.THREE || scene.giro) return;
      scene.giro = creaGiro(hostGiro, { piccolo: PICCOLO, statico: RIDOTTO });
      if (scene.giro) {
        root.classList.add('con-3d-giro');
        var r = sezGiro.getBoundingClientRect();
        scene.giro.visibile = r.bottom > 0 && r.top < window.innerHeight;
        scene.giro.setProgresso(progressoGiro);
        calcolaSoglie();
      }
    }
    function smonta() {
      if (scene.lanterne) { scene.lanterne.dispose(); scene.lanterne = null; }
      if (scene.giro) { scene.giro.dispose(); scene.giro = null; }
      root.classList.remove('con-3d', 'con-3d-giro');
    }

    if (!montaLanterne()) {
      if (puoi3D && !window.THREE) {
        // cdnjs non ha risposto: la stessa Three.js r128, da jsdelivr.
        caricaThree().then(function (ok) {
          if (!ok || !montaLanterne()) { root.classList.add('senza-3d'); return; }
          var r = hero.getBoundingClientRect();
          scene.lanterne.visibile = r.bottom > 0 && r.top < window.innerHeight;
          // Se l'apertura è già passata, le lanterne vere si accendono adesso.
          if (introPartita && !RIDOTTO) scene.lanterne.accendi(G.timeline(), 0, 1.4);
          if (giroVicino) montaGiro();
        });
      } else {
        root.classList.add('senza-3d');
      }
    }

    // Il giro si prepara solo quando ci si avvicina.
    var vicino = new IntersectionObserver(function (voci) {
      if (!voci[0].isIntersecting) return;
      giroVicino = true;
      montaGiro();
      if (scene.giro || !puoi3D) vicino.disconnect();
    }, { rootMargin: '120% 0px' });
    vicino.observe(sezGiro);

    var visibili = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.target === hero && scene.lanterne) scene.lanterne.visibile = v.isIntersecting;
        if (v.target === sezGiro && scene.giro) scene.giro.visibile = v.isIntersecting;
      });
    });
    visibili.observe(hero);
    visibili.observe(sezGiro);

    G.ticker.add(function (time, delta) {
      if (document.hidden) return;
      var dt = Math.min((delta || 16) / 1000, 0.05);
      if (scene.lanterne) {
        scene.lanterne.setSpinta(lenis ? lenis.velocity : 0);
        scene.lanterne.frame(dt);
      }
      if (scene.giro) scene.giro.frame(dt);
    });

    window.addEventListener('pagehide', smonta);
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      if (montaLanterne()) scene.lanterne.accendiTutte();
      montaGiro();
    });

    /* ---- Apertura: il titolo e le lanterne che si accendono ---- */
    if (RIDOTTO) {
      if (scene.lanterne) scene.lanterne.accendiTutte();
    } else {
      // SplitText misura le lettere: prima i caratteri (sono già nella pagina, ma vanno attivati).
      var caratteri = document.fonts ? Promise.race([document.fonts.ready, new Promise(function (ok) { setTimeout(ok, 1200); })]) : Promise.resolve();
      caratteri.then(function () {
        introPartita = true;
        introHero(G, SPLIT, scene.lanterne);
      });
      ST.create({
        trigger: hero, start: 'top top', end: 'bottom top',
        onUpdate: function (s) { if (scene.lanterne) scene.lanterne.setScroll(s.progress); },
      });
    }

    /* ---- Gli archi: ogni sezione si apre come una sala nuova ---- */
    if (!RIDOTTO) {
      [].forEach.call(document.querySelectorAll('[data-arco]'), function (arco) {
        G.fromTo(arco, { scale: 0.12 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: arco.parentElement, start: 'top bottom', end: 'top 40%', scrub: true },
        });
      });
      // Il primo schermo di ogni sala entra tutto insieme, quando l'arco è aperto:
      // prima il testo starebbe sul colore della sala precedente.
      var entrata = function (sez) { return { trigger: sez, start: 'top 48%', once: true }; };
      [].forEach.call(document.querySelectorAll('[data-arco]'), function (arco) {
        var sez = arco.parentElement;
        var cima = sez.getBoundingClientRect().top;
        var primi = [].filter.call(sez.children, function (el) {
          return el !== arco && el.getBoundingClientRect().top - cima < window.innerHeight * 0.9;
        });
        if (!primi.length) return;
        G.fromTo(primi, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08,
          scrollTrigger: entrata(sez),
        });
      });
      if (SPLIT) {
        [].forEach.call(document.querySelectorAll('[data-rivela]'), function (el) {
          var sez = el.closest('.sezione');
          var nelPrimo = sez && el.getBoundingClientRect().top - sez.getBoundingClientRect().top < window.innerHeight * 0.9;
          var fatto = false;
          SPLIT.create(el, {
            type: 'lines', mask: 'lines', linesClass: 'riga', autoSplit: true,
            onSplit: function (self) {
              if (fatto) return undefined;
              var st = nelPrimo ? entrata(sez) : { trigger: el, start: 'top 84%', once: true };
              st.onEnter = function () { fatto = true; };
              return G.from(self.lines, { yPercent: 120, duration: 1.3, ease: 'expo.out', stagger: 0.09, scrollTrigger: st });
            },
          });
        });
      }
    }

    /* ---- Il giro: la spada attraversa lo schermo e accende i tre tempi ---- */
    function calcolaSoglie() {
      var inRiga = tempi.length > 1 && Math.abs(tempi[0].getBoundingClientRect().top - tempi[1].getBoundingClientRect().top) < 8;
      if (!inRiga) { soglie = [0.16, 0.44, 0.72]; return; }
      var pr = palco.getBoundingClientRect();
      var colonne = tempi.map(function (t) { var r = t.getBoundingClientRect(); return r.left - pr.left + r.width * 0.2; });
      if (scene.giro) {
        soglie = scene.giro.soglie(colonne, pr.width);
      } else {
        var w = spadaSvg.getBoundingClientRect().width;
        soglie = colonne.map(function (x) { return x / (pr.width + w); });
      }
    }
    function accendiTempi(p) {
      tempi.forEach(function (t, i) { t.classList.toggle('is-acceso', p >= soglie[i]); });
    }
    function muoviSpadaSvg(p) {
      if (scene.giro || !spadaSvg) return;
      var w = spadaSvg.getBoundingClientRect().width;
      var pw = palco.getBoundingClientRect().width;
      G.set(spadaSvg, { x: -w + p * (pw + w), xPercent: 0 });
    }

    if (!RIDOTTO) {
      ST.create({
        trigger: palco, start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * (PICCOLO ? 1.9 : 2.4)); },
        pin: true, scrub: true, invalidateOnRefresh: true,
        onRefresh: calcolaSoglie,
        onUpdate: function (s) {
          progressoGiro = s.progress;
          if (scene.giro) scene.giro.setProgresso(s.progress);
          muoviSpadaSvg(s.progress);
          accendiTempi(s.progress);
        },
      });
    } else {
      tempi.forEach(function (t) { t.classList.add('is-acceso'); });
    }

    ST.sort();
    ST.addEventListener('refresh', function () { orologio.misura(); calcolaSoglie(); });

    // Una sola rimisura quando caratteri e immagini sono pronti.
    var attese = [document.fonts ? document.fonts.ready : null];
    [].forEach.call(document.images, function (img) { if (img.decode) attese.push(img.decode().catch(function () {})); });
    Promise.all(attese).then(function () { ST.refresh(); });
  }

  /* ======================================================================== */

  function webglOk() {
    try {
      var c = document.createElement('canvas');
      return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  function caricaThree() {
    return new Promise(function (ok) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
      s.onload = function () { ok(Boolean(window.THREE)); };
      s.onerror = function () { ok(false); };
      document.head.appendChild(s);
    });
  }

  function sbloccaIntro() {
    [].forEach.call(document.querySelectorAll('[data-titolo], [data-intro]'), function (el) {
      el.style.animation = 'none';
      el.style.opacity = '1';
    });
  }

  function introHero(G, SPLIT, lanterne) {
    var nome = document.querySelector('[data-titolo]');
    var pezzi = document.querySelectorAll('[data-intro]');
    [].forEach.call(pezzi, function (el) { el.style.animation = 'none'; });
    nome.style.animation = 'none';

    var tl = G.timeline({ defaults: { ease: 'expo.out' } });
    if (SPLIT) {
      var split = SPLIT.create(nome, { type: 'chars', mask: 'chars' });
      G.set(nome, { opacity: 1 });
      tl.from(split.chars, { yPercent: 118, duration: 1.7, stagger: 0.075 }, 0.35);
    } else {
      tl.fromTo(nome, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.3);
    }
    tl.fromTo(pezzi, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.1 }, 0.9);

    if (lanterne) {
      lanterne.accendi(tl, 0.15, 2.1);
    } else {
      var svg = document.querySelectorAll('[data-lanterne-svg] > g');
      tl.fromTo(svg, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.22, ease: 'power1.out' }, 0.2);
    }
    return tl;
  }

  function initAncore(lenis, ridotto) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { duration: 1.6 });
      else el.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth' });
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
  }

  /* ---- L'orologio: 17:00 in cima, 03:00 in fondo ---- */
  function initOrologio() {
    var testo = document.querySelector('[data-ora-testo]');
    var lOre = document.querySelector('[data-lancetta-ore]');
    var lMin = document.querySelector('[data-lancetta-minuti]');
    var sezioni = [].slice.call(document.querySelectorAll('[data-ora]'));
    var tappe = [{ y: 0, m: 1020 }];
    var ultimo = '';

    function minuti(s) {
      var p = s.split(':');
      var h = Number(p[0]);
      var v = h * 60 + Number(p[1]);
      return h < 12 ? v + 1440 : v;
    }
    function misura() {
      var vh = window.innerHeight;
      var max = Math.max(1, document.documentElement.scrollHeight - vh);
      var t = [];
      sezioni.forEach(function (s, i) {
        var top = s.getBoundingClientRect().top + window.scrollY;
        t.push({ y: i === 0 ? 0 : Math.max(1, top - vh * 0.5), m: minuti(s.dataset.ora) });
        if (s.dataset.oraFine) t.push({ y: top + s.offsetHeight - vh, m: minuti(s.dataset.oraFine) });
      });
      t.push({ y: max, m: minuti('03:00') });
      tappe = t.sort(function (a, b) { return a.y - b.y; });
      aggiorna();
    }
    function minutiA(y) {
      if (y <= tappe[0].y) return tappe[0].m;
      for (var i = 1; i < tappe.length; i++) {
        var a = tappe[i - 1];
        var b = tappe[i];
        if (y <= b.y) return a.m + (b.m - a.m) * ((y - a.y) / Math.max(1, b.y - a.y));
      }
      return tappe[tappe.length - 1].m;
    }
    function aggiorna() {
      var m = minutiA(window.scrollY);
      var arrotondato = Math.round(m / 5) * 5;
      var h = Math.floor(arrotondato / 60) % 24;
      var mm = arrotondato % 60;
      var s = (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
      if (s !== ultimo) { testo.textContent = s; ultimo = s; }
      lOre.style.transform = 'rotate(' + (m / 60) * 30 + 'deg)';
      lMin.style.transform = 'rotate(' + m * 6 + 'deg)';
    }
    var inAttesa = false;
    window.addEventListener('scroll', function () {
      if (inAttesa) return;
      inAttesa = true;
      requestAnimationFrame(function () { inAttesa = false; aggiorna(); });
    }, { passive: true });
    window.addEventListener('resize', misura);
    window.addEventListener('load', misura);
    misura();
    return { misura: misura };
  }

  /* ---- Il preventivo: niente form, un messaggio WhatsApp già scritto ---- */
  function initPreventivo() {
    var box = document.querySelector('[data-preventivo]');
    if (!box) return;
    var campo = function (id) { return document.getElementById(id); };
    var esito = box.querySelector('[data-esito]');
    var oggi = new Date();
    campo('p-data').min = oggi.getFullYear() + '-' + String(oggi.getMonth() + 1).padStart(2, '0') + '-' + String(oggi.getDate()).padStart(2, '0');

    box.querySelector('[data-invia]').addEventListener('click', function () {
      var nome = campo('p-nome').value.trim();
      var tipo = campo('p-tipo').value;
      var data = campo('p-data').value;
      var ospiti = campo('p-ospiti').value.trim();
      var note = campo('p-note').value.trim();
      var errori = [];
      ['p-nome', 'p-data', 'p-ospiti'].forEach(function (id) { campo(id).removeAttribute('aria-invalid'); });
      if (!nome) errori.push(['p-nome', 'Scrivi il tuo nome.']);
      if (!data) errori.push(['p-data', 'Scegli la data della festa.']);
      if (ospiti && !(Number(ospiti) >= 1)) errori.push(['p-ospiti', 'Indica quanti sarete, con un numero.']);
      if (errori.length) {
        errori.forEach(function (e) { campo(e[0]).setAttribute('aria-invalid', 'true'); });
        esito.textContent = errori.map(function (e) { return e[1]; }).join(' ');
        campo(errori[0][0]).focus();
        return;
      }
      var quando = new Date(data + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      var righe = [
        'Ciao Destino! Vorrei un preventivo per una festa.',
        '',
        'Nome: ' + nome,
        'Tipo di festa: ' + tipo,
        'Data: ' + quando,
      ];
      if (ospiti) righe.push('Ospiti: ' + ospiti);
      if (note) righe.push('Note: ' + note);
      esito.textContent = 'Si apre WhatsApp con il messaggio pronto: controllalo e invialo.';
      window.open(WA + encodeURIComponent(righe.join('\n')), '_blank', 'noopener');
    });
  }

  /* ======================================================================== */
  /* LE LANTERNE — mossa firma n.1                                            */
  /* Globi bianchi su fili a catenaria, come sulla terrazza. Una sola         */
  /* InstancedMesh con un attributo "acceso" per istanza; gli aloni sono      */
  /* sprite. Ondeggiano piano, di più quando si scorre.                       */
  /* ======================================================================== */

  var VS_GLOBO = [
    'attribute float aOn;',
    'varying float vOn;',
    'varying vec3 vN;',
    'varying vec3 vV;',
    'void main() {',
    '  vOn = aOn;',
    '  mat3 im = mat3(instanceMatrix[0].xyz, instanceMatrix[1].xyz, instanceMatrix[2].xyz);',
    '  mat3 mm = mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz);',
    '  vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);',
    '  vN = normalize(mm * im * normal);',
    '  vV = normalize(cameraPosition - w.xyz);',
    '  gl_Position = projectionMatrix * viewMatrix * w;',
    '}',
  ].join('\n');

  var FS_GLOBO = [
    'uniform vec3 uSole;',
    'varying float vOn;',
    'varying vec3 vN;',
    'varying vec3 vV;',
    'void main() {',
    '  vec3 n = normalize(vN);',
    '  vec3 v = normalize(vV);',
    '  float fronte = clamp(dot(n, v), 0.0, 1.0);',
    '  float luce = clamp(dot(n, uSole) * 0.5 + 0.5, 0.0, 1.0);',
    // Spento: vetro latte che prende la luce del tramonto.
    '  vec3 spento = mix(vec3(0.62, 0.57, 0.52), vec3(0.98, 0.94, 0.88), luce);',
    // Acceso: cuore caldo e bordo più dorato.
    '  float cuore = pow(fronte, 1.5);',
    '  vec3 acceso = mix(vec3(1.0, 0.76, 0.5), vec3(1.0, 0.985, 0.94), cuore) * (0.9 + 0.24 * cuore);',
    '  float on = clamp(vOn, 0.0, 1.0);',
    '  gl_FragColor = vec4(mix(spento, acceso, on), 1.0);',
    '}',
  ].join('\n');

  function mulberry(seed) {
    var t = seed;
    return function () {
      t = (t + 0x6d2b79f5) | 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function textureAlone(T) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,246,228,1)');
    gr.addColorStop(0.16, 'rgba(255,236,204,0.78)');
    gr.addColorStop(0.42, 'rgba(255,220,172,0.22)');
    gr.addColorStop(1, 'rgba(255,220,172,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  }

  function creaLanterne(host, opz) {
    var T = window.THREE;
    var renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opz.piccolo ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    var canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(35, 1, 0.1, 80);
    var CAM_Z = 10;
    var GUARDA_Y = 1.7;

    var sfera = new T.SphereGeometry(1, 28, 20);
    var matGlobo = new T.ShaderMaterial({
      uniforms: { uSole: { value: new T.Vector3(-0.55, 0.45, 0.7).normalize() } },
      vertexShader: VS_GLOBO,
      fragmentShader: FS_GLOBO,
    });
    var texAlone = textureAlone(T);
    var matFilo = new T.MeshBasicMaterial({ color: 0x2f271f });
    var matCorda = new T.LineBasicMaterial({ color: 0x2f271f, transparent: true, opacity: 0.8 });
    var m4 = new T.Matrix4();

    var fili = [];
    var aloni = [];
    var globi = null;
    var geoGlobi = null;
    var corde = null;
    var dati = [];
    var accensione = [];
    var tempo = 0;
    var spinta = 0;
    var spintaVoluta = 0;
    var scrollP = 0;

    function svuota() {
      fili.forEach(function (f) { scene.remove(f); f.geometry.dispose(); });
      aloni.forEach(function (s) { scene.remove(s); s.material.dispose(); });
      if (globi) { scene.remove(globi); geoGlobi.dispose(); }
      if (corde) { scene.remove(corde); corde.geometry.dispose(); }
      fili = []; aloni = []; globi = null; geoGlobi = null; corde = null;
    }

    function costruisci() {
      svuota();
      var r = mulberry(7);
      var tanV = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      var fila = opz.piccolo ? [
        { z: 0.8, y0: 3.55, y1: 2.95, sag: 0.5, n: 4, raggio: 0.2 },
        { z: -2.6, y0: 3.05, y1: 3.75, sag: 0.65, n: 5, raggio: 0.2 },
        { z: -7, y0: 4.15, y1: 3.4, sag: 0.8, n: 6, raggio: 0.22 },
      ] : [
        { z: 1.2, y0: 4.2, y1: 3.6, sag: 0.5, n: 7, raggio: 0.19 },
        { z: -2.2, y0: 4.7, y1: 4.9, sag: 0.7, n: 10, raggio: 0.19 },
        { z: -6, y0: 6.1, y1: 5.2, sag: 0.8, n: 12, raggio: 0.21 },
        { z: -10.5, y0: 6.7, y1: 7.6, sag: 0.9, n: 12, raggio: 0.23 },
      ];
      dati = [];
      fila.forEach(function (s) {
        var hw = tanV * (CAM_Z - s.z) * camera.aspect;
        var A = new T.Vector3(-hw - 1, s.y0, s.z);
        var B = new T.Vector3(hw + 1, s.y1, s.z);
        var punto = function (t) {
          return new T.Vector3().lerpVectors(A, B, t).add(new T.Vector3(0, -s.sag * 4 * t * (1 - t), 0));
        };
        var pts = [];
        for (var k = 0; k <= 32; k++) pts.push(punto(k / 32));
        var filo = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 96, 0.011 + Math.max(0, -s.z) * 0.0012, 5, false), matFilo);
        scene.add(filo);
        fili.push(filo);
        var t0 = 1 / (2 * hw + 2);
        for (var i = 0; i < s.n; i++) {
          var t = t0 + (1 - 2 * t0) * ((i + 0.5 + (r() - 0.5) * 0.45) / s.n);
          var a = punto(t);
          dati.push({ ancora: a, raggio: s.raggio * (0.82 + r() * 0.36), goccia: 0.06 + r() * 0.32, fase: r() * 6.283, z: s.z });
        }
      });

      var n = dati.length;
      geoGlobi = sfera.clone();
      geoGlobi.setAttribute('aOn', new T.InstancedBufferAttribute(new Float32Array(n), 1));
      globi = new T.InstancedMesh(geoGlobi, matGlobo, n);
      globi.instanceMatrix.setUsage(T.DynamicDrawUsage);
      globi.frustumCulled = false;
      scene.add(globi);

      aloni = dati.map(function (d) {
        var sp = new T.Sprite(new T.SpriteMaterial({ map: texAlone, color: 0xfff0d2, transparent: true, depthWrite: false, opacity: 0 }));
        sp.scale.setScalar(d.raggio * 7.5);
        scene.add(sp);
        return sp;
      });

      var cg = new T.BufferGeometry();
      cg.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 6), 3));
      corde = new T.LineSegments(cg, matCorda);
      corde.frustumCulled = false;
      scene.add(corde);

      if (accensione.length !== n) {
        accensione = dati.map(function () { return { v: opz.statico ? 1 : 0 }; });
      }
    }

    function aggiorna(dt) {
      tempo += dt;
      spinta += (spintaVoluta - spinta) * Math.min(1, dt * 2.5);
      var on = geoGlobi.attributes.aOn.array;
      var pos = corde.geometry.attributes.position.array;
      for (var i = 0; i < dati.length; i++) {
        var d = dati[i];
        var ang = opz.statico ? 0 : 0.05 * Math.sin(tempo * 1.15 + d.fase) + spinta * (0.75 + 0.25 * Math.sin(d.fase * 3));
        var L = d.goccia + d.raggio;
        var x = d.ancora.x + Math.sin(ang) * L;
        var y = d.ancora.y - Math.cos(ang) * L;
        m4.makeScale(d.raggio, d.raggio, d.raggio);
        m4.setPosition(x, y, d.z);
        globi.setMatrixAt(i, m4);
        var v = accensione[i].v;
        on[i] = v;
        aloni[i].position.set(x, y, d.z + 0.01);
        aloni[i].material.opacity = Math.min(1, v) * 0.85;
        var k = i * 6;
        pos[k] = d.ancora.x; pos[k + 1] = d.ancora.y; pos[k + 2] = d.z;
        pos[k + 3] = x - Math.sin(ang) * d.raggio; pos[k + 4] = y + Math.cos(ang) * d.raggio; pos[k + 5] = d.z;
      }
      globi.instanceMatrix.needsUpdate = true;
      geoGlobi.attributes.aOn.needsUpdate = true;
      corde.geometry.attributes.position.needsUpdate = true;
      // Parallasse: mentre l'hero esce, le lanterne restano un po' indietro.
      var dy = scrollP * 1.5;
      camera.position.set(0, GUARDA_Y - 1.2 + dy, CAM_Z);
      camera.lookAt(0, GUARDA_Y + dy, 0);
      renderer.render(scene, camera);
    }

    function resize() {
      var w = host.clientWidth;
      var h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      costruisci();
      aggiorna(0);
    }
    var osserva = new ResizeObserver(function () { resize(); });
    osserva.observe(host);
    resize();

    var api = {
      visibile: true,
      frame: function (dt) { if (api.visibile && !opz.statico) aggiorna(dt); },
      setScroll: function (p) { scrollP = p; },
      setSpinta: function (velocita) { spintaVoluta = Math.max(-0.32, Math.min(0.32, -velocita * 0.0035)); },
      accendi: function (tl, inizio, durata) {
        var ordine = dati.map(function (d, i) { return i; }).sort(function (a, b) { return dati[a].ancora.x - dati[b].ancora.x; });
        var passo = durata / ordine.length;
        ordine.forEach(function (i, k) {
          tl.to(accensione[i], {
            keyframes: [{ v: 0.9, duration: 0.06 }, { v: 0.25, duration: 0.07 }, { v: 1, duration: 0.4 }],
            ease: 'none',
          }, inizio + k * passo);
        });
      },
      accendiTutte: function () {
        accensione.forEach(function (a) { a.v = 1; });
        aggiorna(0);
      },
      dispose: function () {
        osserva.disconnect();
        svuota();
        sfera.dispose(); matGlobo.dispose(); matFilo.dispose(); matCorda.dispose(); texAlone.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      },
    };
    return api;
  }

  /* ======================================================================== */
  /* IL GIRO — mossa firma n.2                                                */
  /* Una spada da churrasco attraversa lo schermo sopra la brace. La lama     */
  /* riflette il fuoco da sotto e il cielo della sera da sopra.               */
  /* ======================================================================== */

  var VS_PIANO = [
    'varying vec2 vUv;',
    'void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  ].join('\n');

  var FS_BRACE = [
    'uniform float uTempo;',
    'uniform float uCalore;',
    'varying vec2 vUv;',
    'float caso(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float rumore(vec2 p) {',
    '  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(caso(i), caso(i + vec2(1.0, 0.0)), u.x), mix(caso(i + vec2(0.0, 1.0)), caso(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',
    'float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int k = 0; k < 4; k++) { v += a * rumore(p); p *= 2.03; a *= 0.5; } return v; }',
    'void main() {',
    '  vec2 p = vUv * vec2(16.0, 3.2);',
    '  float braci = fbm(p + vec2(0.0, uTempo * 0.06));',
    '  float guizzo = fbm(p * 1.8 - vec2(uTempo * 0.1, uTempo * 0.22));',
    '  float fuoco = smoothstep(0.44, 0.8, braci * 0.72 + guizzo * 0.46);',
    '  float sfuma = smoothstep(1.0, 0.35, vUv.y) * smoothstep(0.0, 0.08, vUv.y);',
    '  vec3 carbone = vec3(0.07, 0.04, 0.03);',
    '  vec3 rosso = mix(vec3(0.85, 0.24, 0.06), vec3(1.0, 0.7, 0.36), fuoco * fuoco);',
    '  vec3 col = mix(carbone, rosso, fuoco * (0.5 + 0.5 * uCalore));',
    '  gl_FragColor = vec4(col, sfuma * (0.72 + 0.28 * fuoco));',
    '}',
  ].join('\n');

  var VS_SCINTILLE = [
    'uniform float uTempo;',
    'uniform float uPR;',
    'uniform float uLargo;',
    'uniform float uAlto;',
    'uniform float uCalore;',
    'uniform vec3 uBase;',
    'attribute vec3 aDati;',
    'attribute vec2 aFase;',
    'varying float vA;',
    'void main() {',
    '  float t = fract(uTempo * aDati.z + aFase.x);',
    '  vec3 p = uBase + vec3(aDati.x * uLargo + sin(t * 6.0 + aFase.x * 30.0) * 0.2 * t, t * uAlto, aDati.y * 0.8);',
    '  vA = (1.0 - t) * (0.55 + 0.45 * sin(uTempo * 23.0 + aFase.x * 70.0)) * (0.4 + 0.6 * uCalore);',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_PointSize = aFase.y * uPR * (1.0 - 0.5 * t) * (7.0 / -mv.z);',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n');

  var FS_SCINTILLE = [
    'varying float vA;',
    'void main() {',
    '  float d = length(gl_PointCoord - vec2(0.5));',
    '  gl_FragColor = vec4(1.0, 0.56, 0.24, smoothstep(0.5, 0.05, d) * vA);',
    '}',
  ].join('\n');

  function textureLegno(T) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#6E4B33';
    g.fillRect(0, 0, 256, 64);
    var r = mulberry(3);
    for (var i = 0; i < 46; i++) {
      g.strokeStyle = r() > 0.5 ? 'rgba(40,24,14,0.35)' : 'rgba(150,108,72,0.3)';
      g.lineWidth = 0.6 + r() * 1.6;
      var y = r() * 64;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(80, y + (r() - 0.5) * 6, 170, y + (r() - 0.5) * 6, 256, y + (r() - 0.5) * 4);
      g.stroke();
    }
    var t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    return t;
  }

  function creaGiro(host, opz) {
    var T = window.THREE;
    var renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opz.piccolo ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    var canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0, 0.6, 9);
    var guarda = new T.Vector3(0, -0.3, 0);

    // Ambiente dei riflessi: cielo freddo sopra, brace sotto.
    var pmrem = new T.PMREMGenerator(renderer);
    var ambiente = new T.Scene();
    var geoCielo = new T.SphereGeometry(10, 32, 16);
    var colori = [];
    var pos = geoCielo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / 10;
      if (y > 0) colori.push(0.08 + 0.3 * y, 0.09 + 0.32 * y, 0.12 + 0.38 * y);
      else colori.push(1.6 * Math.min(1, -y * 2.2), 0.55 * Math.min(1, -y * 2.2), 0.12 * Math.min(1, -y * 2.2));
    }
    geoCielo.setAttribute('color', new T.Float32BufferAttribute(colori, 3));
    var matCielo = new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide });
    ambiente.add(new T.Mesh(geoCielo, matCielo));
    var geoStriscia = new T.PlaneGeometry(7, 0.7);
    var matStriscia = new T.MeshBasicMaterial({ color: 0xfff3e6, side: T.DoubleSide });
    var striscia = new T.Mesh(geoStriscia, matStriscia);
    striscia.position.set(-3, 6.5, 4);
    striscia.lookAt(0, 0, 0);
    ambiente.add(striscia);
    var envRT = pmrem.fromScene(ambiente, 0.02);
    scene.environment = envRT.texture;

    // La spada: lama piatta a punta, guardia e pomo d'ottone, manico di legno.
    var L = 4.7;
    var forma = new T.Shape();
    forma.moveTo(0, -0.05);
    forma.lineTo(L - 0.5, -0.034);
    forma.lineTo(L, 0);
    forma.lineTo(L - 0.5, 0.034);
    forma.lineTo(0, 0.05);
    forma.lineTo(0, -0.05);
    var geoLama = new T.ExtrudeGeometry(forma, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.007, bevelSegments: 2, steps: 1, curveSegments: 4 });
    geoLama.translate(0, 0, -0.007);
    var matLama = new T.MeshStandardMaterial({ color: 0xd6dade, metalness: 1, roughness: 0.2 });
    var matOttone = new T.MeshStandardMaterial({ color: 0xc9a86a, metalness: 1, roughness: 0.3 });
    var texLegno = textureLegno(T);
    var matLegno = new T.MeshStandardMaterial({ map: texLegno, roughness: 0.6, metalness: 0 });
    var geoGuardia = new T.CylinderGeometry(0.085, 0.085, 0.035, 32);
    var geoManico = new T.CylinderGeometry(0.048, 0.055, 0.66, 24);
    var geoPomo = new T.SphereGeometry(0.06, 20, 14);

    var spada = new T.Group();
    spada.add(new T.Mesh(geoLama, matLama));
    var guardia = new T.Mesh(geoGuardia, matOttone);
    guardia.rotation.z = Math.PI / 2;
    spada.add(guardia);
    var manico = new T.Mesh(geoManico, matLegno);
    manico.rotation.z = Math.PI / 2;
    manico.position.x = -0.35;
    spada.add(manico);
    var pomo = new T.Mesh(geoPomo, matOttone);
    pomo.position.x = -0.71;
    spada.add(pomo);
    scene.add(spada);

    var luceBrace = new T.PointLight(0xff7a3a, 2.4, 7, 2);
    scene.add(luceBrace);
    var luceCielo = new T.DirectionalLight(0xbac6d4, 0.7);
    luceCielo.position.set(-4, 5, 3);
    scene.add(luceCielo);
    scene.add(new T.AmbientLight(0x3a2a20, 0.6));

    // La brace: una fascia in basso che respira.
    var matBrace = new T.ShaderMaterial({
      uniforms: { uTempo: { value: 0 }, uCalore: { value: 0.6 } },
      vertexShader: VS_PIANO, fragmentShader: FS_BRACE, transparent: true, depthWrite: false,
    });
    var geoBrace = new T.PlaneGeometry(1, 1);
    var brace = new T.Mesh(geoBrace, matBrace);
    brace.rotation.x = -0.5;
    scene.add(brace);

    // Le scintille: salgono dalla brace, il moto è tutto nello shader.
    var N = opz.piccolo ? 90 : 240;
    var r = mulberry(11);
    var aDati = new Float32Array(N * 3);
    var aFase = new Float32Array(N * 2);
    for (var s = 0; s < N; s++) {
      aDati[s * 3] = r() * 2 - 1;
      aDati[s * 3 + 1] = r() * 2 - 1;
      aDati[s * 3 + 2] = 0.1 + r() * 0.22;
      aFase[s * 2] = r();
      aFase[s * 2 + 1] = 2 + r() * 4.5;
    }
    var geoSc = new T.BufferGeometry();
    geoSc.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3));
    geoSc.setAttribute('aDati', new T.BufferAttribute(aDati, 3));
    geoSc.setAttribute('aFase', new T.BufferAttribute(aFase, 2));
    var matSc = new T.ShaderMaterial({
      uniforms: {
        uTempo: { value: 0 }, uPR: { value: 1 }, uLargo: { value: 4 }, uAlto: { value: 3 },
        uCalore: { value: 0.6 }, uBase: { value: new T.Vector3() },
      },
      vertexShader: VS_SCINTILLE, fragmentShader: FS_SCINTILLE,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    });
    var scintille = new T.Points(geoSc, matSc);
    scintille.frustumCulled = false;
    scene.add(scintille);

    var obiettivo = 0;
    var prog = 0;
    var tempo = 0;
    var gx0 = -8;
    var gx1 = 8;
    var yBase = -0.9;
    var meta = 4;
    var vettore = new T.Vector3();

    function resize() {
      var w = host.clientWidth;
      var h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = camera.aspect < 0.9 ? 44 : 30;
      camera.updateProjectionMatrix();
      camera.lookAt(guarda);
      camera.updateMatrixWorld();
      var dist = camera.position.distanceTo(guarda);
      var halfH = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * dist;
      var halfW = halfH * camera.aspect;
      meta = halfW;
      var scala = camera.aspect < 0.9 ? 0.72 : 1;
      spada.scale.setScalar(scala);
      gx0 = -halfW - 0.3 - L * scala;
      gx1 = halfW + 0.3 + 0.77 * scala;
      yBase = guarda.y - halfH * (camera.aspect < 0.9 ? 0.32 : 0.38);
      var yBrace = guarda.y - halfH * 0.95;
      brace.position.set(0, yBrace, 0.4);
      brace.scale.set(halfW * 2.6, halfH * 0.7, 1);
      matSc.uniforms.uBase.value.set(0, yBrace + 0.15, 0.4);
      matSc.uniforms.uLargo.value = halfW * 1.15;
      matSc.uniforms.uAlto.value = halfH * 1.25;
      matSc.uniforms.uPR.value = renderer.getPixelRatio();
      disegna(0);
    }

    function disegna(dt) {
      tempo += dt;
      prog += (obiettivo - prog) * Math.min(1, dt * 7 || 1);
      var p = opz.statico ? 0.5 : prog;
      var gx = gx0 + (gx1 - gx0) * p;
      spada.position.set(gx, yBase + Math.sin(p * Math.PI) * 0.14, 0);
      spada.rotation.set(1.05 - p * 0.8, 0.12, -0.035 + 0.025 * Math.sin(p * 5));
      var punta = gx + L * spada.scale.x;
      luceBrace.position.set(Math.max(-meta, Math.min(meta, punta - 1.2)), yBase - 0.9, 1.2);
      luceBrace.intensity = 2.2 + Math.sin(tempo * 9) * 0.25 + Math.sin(tempo * 23) * 0.12;
      var calore = 0.5 + 0.5 * Math.sin(Math.PI * Math.max(0, Math.min(1, p)));
      matBrace.uniforms.uTempo.value = tempo;
      matBrace.uniforms.uCalore.value = calore;
      matSc.uniforms.uTempo.value = tempo;
      matSc.uniforms.uCalore.value = calore;
      renderer.render(scene, camera);
    }

    var osserva = new ResizeObserver(function () { resize(); });
    osserva.observe(host);
    resize();

    var api = {
      visibile: false,
      setProgresso: function (p) { obiettivo = p; },
      frame: function (dt) { if (api.visibile && !opz.statico) disegna(dt); },
      // Per ogni colonna: il progresso in cui la punta della spada la raggiunge.
      soglie: function (colonne, larghezza) {
        var proietta = function (x) { vettore.set(x, yBase, 0).project(camera); return (vettore.x * 0.5 + 0.5) * larghezza; };
        var a = proietta(gx0 + L * spada.scale.x);
        var b = proietta(gx1 + L * spada.scale.x);
        return colonne.map(function (x) { return Math.max(0, Math.min(1, (x - a) / (b - a))); });
      },
      dispose: function () {
        osserva.disconnect();
        [geoLama, geoGuardia, geoManico, geoPomo, geoBrace, geoSc, geoCielo, geoStriscia].forEach(function (g) { g.dispose(); });
        [matLama, matOttone, matLegno, matBrace, matSc, matCielo, matStriscia].forEach(function (m) { m.dispose(); });
        texLegno.dispose();
        scene.environment = null;
        envRT.dispose();
        pmrem.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      },
    };
    return api;
  }
})();
