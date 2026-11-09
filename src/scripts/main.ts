// Entry unico (JS iniziale). Tutto il resto e' caricato a richiesta.
const root = document.documentElement;
root.classList.add('js');

const KEY = 'gb-motion';
const read = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
const write = (v: string) => {
  try { localStorage.setItem(KEY, v); } catch { /* storage bloccato: nessun problema */ }
};
const sysReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stored = read();
const reduced = stored === 'reduced' || (stored !== 'full' && sysReduced);
root.dataset.motion = reduced ? 'reduced' : 'full';

// Toggle "Riduci animazioni" (header desktop e menu mobile)
const toggles = document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]');
toggles.forEach((toggle) => {
  toggle.setAttribute('aria-pressed', String(reduced));
  toggle.addEventListener('click', () => {
    const next = root.dataset.motion === 'reduced' ? 'full' : 'reduced';
    write(next);
    root.dataset.motion = next;
    toggles.forEach((t) => t.setAttribute('aria-pressed', String(next === 'reduced')));
  });
});

// Menu mobile a tutto schermo
const mbtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const mnav = document.querySelector<HTMLElement>('[data-mnav]');
if (mbtn && mnav) {
  const set = (open: boolean) => {
    mbtn.setAttribute('aria-expanded', String(open));
    mnav.classList.toggle('open', open);
    mnav.inert = !open;
    root.classList.toggle('nav-open', open);
  };
  mbtn.addEventListener('click', () => set(mbtn.getAttribute('aria-expanded') !== 'true'));
  mnav.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width:860px)').addEventListener('change', (m) => { if (m.matches) set(false); });
}

// Reveal: fallback a IntersectionObserver solo dove animation-timeline non c'e'
if (!CSS.supports('animation-timeline: view()')) {
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

// Menu: chip attivo in base alla sezione visibile
const chips = document.querySelectorAll<HTMLAnchorElement>('.chips a');
if (chips.length) {
  const byId = new Map([...chips].map((a) => [a.getAttribute('href')!.slice(1), a]));
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      chips.forEach((c) => c.classList.remove('on'));
      const a = byId.get(e.target.id);
      if (a) { a.classList.add('on'); a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: root.dataset.motion === 'reduced' ? 'auto' : 'smooth' }); }
    }
  }, { rootMargin: '-35% 0px -60% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

// Mappa click-to-load: nessuno script/cookie di terzi finche' l'utente non lo chiede
document.querySelectorAll<HTMLButtonElement>('[data-load-map]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const box = btn.closest<HTMLElement>('.map');
    if (!box) return;
    const f = document.createElement('iframe');
    f.src = btn.dataset.src!;
    f.title = 'Mappa di Grill Burger, Via Nazionale 531, Roseto degli Abruzzi';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer';
    box.replaceChildren(f);
  });
});

// Extra desktop: import dinamico, dopo il primo paint
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  idle(() => { void import('./desktop').then((m) => m.initDesktop()); });
}

// Dispositivo capace di effetti pesanti: no risparmio dati, almeno 4 core e 4 GB, rete non lenta
const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
const strong = !nav.connection?.saveData && !/(^|-)2g$|3g/.test(nav.connection?.effectiveType ?? '') && (nav.hardwareConcurrency ?? 8) > 4 && (nav.deviceMemory ?? 8) > 2;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Sfondo WebGL dell'hero e scroll fluido: import dinamici, solo dopo il primo paint e solo su dispositivi capaci
if (!reduced && strong) {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-gl]');
  if (canvas) idle(() => { void import('./hero-gl').then((m) => m.initHeroGL(canvas)).catch(() => {}); });
  if (fine) idle(() => { void import('./smooth').then((m) => m.initSmooth()).catch(() => {}); });
}

// Prefetch delle pagine interne al passaggio del mouse o al tocco (richiesta a bassa priorita', una sola volta)
const seen = new Set<string>();
const warm = (e: Event) => {
  const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a || a.origin !== location.origin || a.target === '_blank' || a.pathname === location.pathname || seen.has(a.pathname)) return;
  seen.add(a.pathname);
  void fetch(a.pathname, { credentials: 'omit', priority: 'low' } as RequestInit).catch(() => {});
};
document.addEventListener('pointerover', warm, { passive: true });
document.addEventListener('touchstart', warm, { passive: true });
