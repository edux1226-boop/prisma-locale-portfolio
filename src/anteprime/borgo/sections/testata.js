import { ScrollTrigger, scrollToTarget } from '../../../js/core/motion.js';
import { initScrollSpy } from '../../../js/ui/nav.js';

/* La testata: trasparente sull'hero, poi carta velata con un filo.
   Scendendo si ritira, risalendo torna. Sopra le sezioni scure si scurisce. */
function initComportamento() {
  const testata = document.querySelector('[data-testata]');
  const hero = document.querySelector('[data-hero]');
  const sottoTestata = (bordo) => () => `${bordo} top+=${testata.offsetHeight}`;

  ScrollTrigger.create({
    trigger: hero,
    start: sottoTestata('bottom'),
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
      testata.classList.toggle('is-nascosta', y > ultimo && y > window.innerHeight * 0.9);
      ultimo = y;
    },
  });

  for (const scura of document.querySelectorAll('.giornata, .voci, .piede')) {
    ScrollTrigger.create({
      trigger: scura,
      start: sottoTestata('top'),
      end: sottoTestata('bottom'),
      onToggle: (self) => testata.classList.toggle('is-scura', self.isActive),
    });
  }

  initScrollSpy();
}

/* Il menu a tutto schermo su mobile, con <dialog> nativo. Il blocco dello
   scroll sotto le finestre è uno solo, in CSS (html:has(dialog:modal)). */
function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const apri = document.querySelector('[data-menu-apri]');

  apri.addEventListener('click', () => {
    menu.showModal();
    apri.setAttribute('aria-expanded', 'true');
  });
  menu.querySelector('[data-menu-chiudi]').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => apri.setAttribute('aria-expanded', 'false'));
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
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
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
