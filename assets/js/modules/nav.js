/**
 * Navigazione: stato "stuck", pannello mobile, link attivo in base alla sezione,
 * barra azione mobile che compare dopo la hero.
 */

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');
  const dock = document.querySelector('[data-dock]');

  /* ---- Sfondo della navbar quando si scorre ---- */
  if (nav) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:32px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
      ([entry]) => nav.classList.toggle('is-stuck', !entry.isIntersecting)
    ).observe(sentinel);
  }

  /* ---- Pannello mobile ---- */
  const closePanel = () => {
    if (!panel) return;
    panel.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  };

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    });

    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) closePanel();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });
  }

  /* ---- Link attivo ---- */
  const links = [...document.querySelectorAll('[data-nav-link]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* ---- Barra azione mobile ---- */
  const hero = document.querySelector('[data-hero]');
  if (dock && hero) {
    new IntersectionObserver(
      ([entry]) => dock.classList.toggle('is-visible', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(hero);
  }
}
