import { ScrollTrigger, lockScroll, scrollToTarget } from '../../../js/core/motion.js';

const SCURE = '.galleria, .prenota, .piede';

/* La testata: trasparente sull'acqua dell'hero; dopo, più bassa, su carta
   piena. Scendendo si ritira, risalendo torna. Sulle sezioni blu si scurisce. */
function initComportamento() {
  const testata = document.querySelector('[data-testata]');
  const hero = document.querySelector('[data-hero]');
  const banchina = document.querySelector('[data-banchina]');

  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom top+=80',
    onEnter: () => { testata.classList.add('is-compatta'); banchina?.classList.add('is-visibile'); },
    onLeaveBack: () => {
      testata.classList.remove('is-compatta', 'is-nascosta');
      banchina?.classList.remove('is-visibile');
    },
  });

  let ultimo = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      if (Math.abs(y - ultimo) < 8) return;
      testata.classList.toggle('is-nascosta', y > ultimo && y > window.innerHeight * 1.2);
      ultimo = y;
    },
  });

  for (const scura of document.querySelectorAll(SCURE)) {
    ScrollTrigger.create({
      trigger: scura,
      start: 'top top+=40',
      end: 'bottom top+=40',
      onToggle: (self) => testata.classList.toggle('is-scura', self.isActive),
    });
  }

  // La voce del menu della sezione in vista.
  const voci = [...testata.querySelectorAll('.testata__nav a')];
  for (const voce of voci) {
    const sezione = document.querySelector(voce.getAttribute('href'));
    if (!sezione) continue;
    // "La cucina" comprende lo specchio, i piatti e Gennaro
    const fine = voce.getAttribute('href') === '#cucina' ? document.querySelector('.persona') : sezione;
    ScrollTrigger.create({
      trigger: sezione,
      start: 'top center',
      endTrigger: fine,
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

/* Senza movimento ScrollTrigger non gira: bastano due osservatori. */
function initSenzaMovimento() {
  const testata = document.querySelector('[data-testata]');
  const banchina = document.querySelector('[data-banchina]');
  const hero = document.querySelector('[data-hero]');
  new IntersectionObserver(([voce]) => {
    testata.classList.toggle('is-compatta', !voce.isIntersecting);
    banchina?.classList.toggle('is-visibile', !voce.isIntersecting);
  }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
}

/* L'indice a tutto schermo su telefono e tablet, con <dialog> nativo. */
function initIndice() {
  const indice = document.querySelector('[data-indice]');
  const apri = document.querySelector('[data-indice-apri]');
  const chiudi = indice.querySelector('[data-indice-chiudi]');
  apri.addEventListener('click', () => {
    indice.showModal();
    apri.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-aperto');
    lockScroll(true);
  });
  chiudi.addEventListener('click', () => indice.close());
  indice.addEventListener('close', () => {
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
    if (aperte.length) lockScroll(false);
    requestAnimationFrame(() => scrollToTarget(target, () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }));
  });
}

export function initTestata({ movimento }) {
  initIndice();
  initAncore();
  if (movimento) initComportamento();
  else initSenzaMovimento();
}
