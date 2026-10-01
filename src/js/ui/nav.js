import { gsap, ScrollTrigger, scrollToTarget, lockScroll, prefersReducedMotion } from '../core/motion.js';

/* Header a capsula: diventa pieno appena si lascia la cima, si nasconde
   quando si scende e torna quando si risale. */
export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const update = (y, goingDown) => {
    header.classList.toggle('is-solid', y > 24);
    const keepVisible = header.contains(document.activeElement) || document.querySelector('[data-menu]')?.open;
    header.classList.toggle('is-hidden', goingDown && y > window.innerHeight * 0.8 && !keepVisible);
  };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => update(self.scroll(), self.direction === 1),
  });
  update(window.scrollY, false);
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}

/* Link interni: scorrimento morbido via Lenis, poi il focus passa alla
   destinazione, così tastiera e lettori di schermo restano allineati. */
export function initAnchors() {
  const menu = document.querySelector('[data-menu]');

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    event.preventDefault();

    const go = () => {
      scrollToTarget(target, () => {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
      history.pushState(null, '', `#${id}`);
    };

    if (menu?.open) {
      menu.close();
      requestAnimationFrame(go);
    } else {
      go();
    }
  });
}

/* Menu mobile su <dialog>: trappola del focus, Esc e ritorno del focus
   sono quelli nativi del browser. */
export function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const openButton = document.querySelector('[data-menu-open]');
  const closeButton = document.querySelector('[data-menu-close]');
  if (!menu || !openButton) return;

  openButton.addEventListener('click', () => {
    menu.showModal();
    lockScroll(true);
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        menu.querySelectorAll('.menu__list li, .menu__foot'),
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.05 },
      );
    }
  });
  closeButton?.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => lockScroll(false));
}

/* Voce di navigazione attiva in base alla sezione al centro dello schermo.
   Va creato per ultimo: le sezioni sotto la storia pinnata devono essere
   misurate dopo che il pin ha aggiunto il suo spazio. */
export function initScrollSpy() {
  const links = [...document.querySelectorAll('[data-spy]')];
  const setActive = (active) => {
    for (const link of links) {
      if (link === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  for (const link of links) {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) continue;
    ScrollTrigger.create({
      trigger: target,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) setActive(link);
        else if (link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
      },
    });
  }
}
