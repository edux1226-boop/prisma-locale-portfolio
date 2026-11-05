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

// Toggle "Riduci animazioni"
const toggle = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
if (toggle) {
  toggle.setAttribute('aria-pressed', String(reduced));
  toggle.addEventListener('click', () => {
    const next = root.dataset.motion === 'reduced' ? 'full' : 'reduced';
    write(next);
    root.dataset.motion = next;
    toggle.setAttribute('aria-pressed', String(next === 'reduced'));
  });
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

export {};
