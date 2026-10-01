import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/home.css';

import {
  gsap,
  ScrollTrigger,
  MQ,
  startSmoothScroll,
  stopSmoothScroll,
  refreshWhenAssetsLoad,
  whenIdle,
} from './core/motion.js';
import { initHeader, initAnchors, initMenu, initScrollSpy } from './ui/nav.js';
import { initTitleReveals, initFades, showEverything } from './ui/reveal.js';
import { fontsReady, playIntro, skipIntro } from './ui/intro.js';
import { initBench } from './ui/beams.js';
import { initForm } from './ui/form.js';
import { initStory } from './story.js';
import { initHero } from './hero.js';

initHeader();
initAnchors();
initMenu();
initForm();

const hero = document.querySelector('[data-hero]');
const saveData = navigator.connection?.saveData === true;
let introDone = false;

/* Ogni effetto vive dentro gsap.matchMedia: se cambia la preferenza di
   movimento o il formato, tutto viene smontato e rimontato da capo. */
gsap.matchMedia().add(
  { motion: MQ.motion, desktop: MQ.desktop, fine: MQ.finePointer, row: MQ.storyRow },
  (context) => {
    const { motion, desktop, fine, row } = context.conditions;

    if (!motion) {
      introDone = true;
      skipIntro();
      showEverything();
      initScrollSpy();
      return undefined;
    }

    startSmoothScroll();

    // Il 3D è solo per desktop con mouse; altrove l'immagine statica.
    const wants3D = desktop && fine;
    const use3D = wants3D && !saveData && 'WebGL2RenderingContext' in window;
    const disposeHero = initHero({ use3D });
    if (wants3D && !use3D) hero?.classList.add('hero--still');

    if (!introDone) {
      introDone = true;
      fontsReady().then(playIntro);
    } else {
      skipIntro();
    }

    /* Quello che sta sotto la piega si prepara a browser libero, a piccoli
       pezzi, dall'alto in basso: il pin della storia prima delle sezioni
       che sposta. */
    let active = true;
    let disposeStory = null;
    let stopTitles = null;
    const later = (job) => whenIdle(() => active && context.add(job));
    later(() => { disposeStory = initStory({ vertical: !row }); });
    later(() => { initFades(); initBench(); });
    later(() => {
      stopTitles = initTitleReveals(document, context);
      initScrollSpy();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => {
      active = false;
      disposeHero();
      disposeStory?.();
      stopTitles?.();
      stopSmoothScroll();
    };
  },
);

refreshWhenAssetsLoad();
