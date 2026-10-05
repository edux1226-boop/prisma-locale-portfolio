import { ScrollTrigger, lockScroll, scrollToTarget } from '../../../js/core/motion.js';

/* La testata: trasparente sull'hero, poi carta velata con un filo.
   Scendendo si ritira, risalendo torna. Sopra le sezioni scure si scurisce. */
function initComportamento() {
  const testata = document.querySelector('[data-testata]');
  const hero = document.querySelector('[data-hero]');

  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom top+=90',
    onEnter: () => testata.classList.add('is-solida'),
    onLeaveBack: () => testata.classList.remove('is-solida', 'is-nascosta'),
  });

  let ultimo = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      if (Math.abs(y - ultimo) < 6) return;
      const giu = y > ultimo;
      testata.classList.toggle('is-nascosta', giu && y > window.innerHeight * 0.9);
      ultimo = y;
    },
  });

  for (const scura of document.querySelectorAll('.giornata, .voci, .piede')) {
    ScrollTrigger.create({
      trigger: scura,
      start: 'top top+=40',
      end: 'bottom top+=40',
      onToggle: (self) => testata.classList.toggle('is-scura', self.isActive),
    });
  }

  // La voce del menu corrispondente alla sezione in vista.
  const voci = [...testata.querySelectorAll('.testata__nav a')];
  for (const voce of voci) {
    const sezione = document.querySelector(voce.getAttribute('href'));
    if (!sezione) continue;
    ScrollTrigger.create({
      trigger: sezione,
      start: 'top center',
      end: 'bottom center',
      onToggle(self) {
        if (self.isActive) {
          voci.forEach((v) => v.removeAttribute('aria-current'));
          voce.setAttribute('aria-current', 'true');
        } else {
          voce.removeAttribute('aria-current');
        }
      },
    });
  }
}

/* Il menu a tutto schermo su mobile, con <dialog> nativo. */
function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const apri = document.querySelector('[data-menu-apri]');
  const chiudi = menu.querySelector('[data-menu-chiudi]');

  apri.addEventListener('click', () => {
    menu.showModal();
    apri.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-aperto');
    lockScroll(true);
  });
  chiudi.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    apri.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-aperto');
    lockScroll(false);
  });
}

/* Link interni: chiudono le finestre aperte, scorrono con Lenis e portano
   il focus sulla sezione d'arrivo. */
function initAncore() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const aperte = document.querySelectorAll('dialog[open]');
    aperte.forEach((d) => d.close());
    // l'evento "close" arriva dopo: lo scroll va sbloccato subito
    if (aperte.length) lockScroll(false);
    requestAnimationFrame(() => scrollToTarget(target, () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }));
  });
}

export function initTestata() {
  initMenu();
  initAncore();
  initComportamento();
}
