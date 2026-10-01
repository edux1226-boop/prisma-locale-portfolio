import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/page.css';

import { gsap, ScrollTrigger, MQ, startSmoothScroll, stopSmoothScroll, refreshWhenAssetsLoad } from './core/motion.js';
import { initHeader, initAnchors, initMenu } from './ui/nav.js';
import { initTitleReveals, initFades, showEverything } from './ui/reveal.js';
import { fontsReady, skipIntro } from './ui/intro.js';

/* Pagine interne: stesso linguaggio della home, senza le mosse firma.
   Un solo ingresso orchestrato per il titolo, poi tutto quieto. */
initHeader();
initAnchors();
initMenu();

let introDone = false;

function playPageIntro() {
  const lines = document.querySelectorAll('.line__in');
  const bits = document.querySelectorAll('[data-intro]');
  gsap.set(lines, { y: 0, yPercent: 105 });
  gsap.set(bits, { opacity: 0, y: 14 });
  document.documentElement.classList.remove('is-loading');
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.05)
    .to(bits, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }, 0.25);
}

gsap.matchMedia().add({ motion: MQ.motion }, (context) => {
  if (!context.conditions.motion) {
    introDone = true;
    skipIntro();
    showEverything();
    return undefined;
  }
  startSmoothScroll();
  const stopTitles = initTitleReveals(document, context);
  initFades();
  ScrollTrigger.sort();
  if (!introDone) {
    introDone = true;
    fontsReady().then(playPageIntro);
  } else {
    skipIntro();
  }
  return () => {
    stopTitles();
    stopSmoothScroll();
  };
});

refreshWhenAssetsLoad();
