import { MAX_SMASH, CX, STRATI, ordine, posizioni } from '../data/panino.js';

/* Il selettore x1 … x4 e la pila di strati. Funziona sia senza movimento (cambio immediato)
   sia con GSAP (gli strati cadono e si spostano). La pila si ricompone sempre dal basso. */

const $ = (sel, r = document) => r.querySelector(sel);

export function creaPila({ gsap = null } = {}) {
  const palco = $('[data-palco]');
  const livelli = {};
  for (const s of ordine(MAX_SMASH)) {
    const pos = palco.querySelector(`[data-pos="${s.id}"]`);
    livelli[s.id] = { ...s, pos, strato: pos.querySelector('[data-strato]') };
  }
  let n = 2;

  const mostra = (id, y, animato) => {
    const L = livelli[id];
    L.pos.style.display = '';
    if (gsap && animato) {
      gsap.killTweensOf(L.pos);
      gsap.to(L.pos, { y, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    } else if (gsap) {
      gsap.set(L.pos, { x: CX, y });
    } else {
      L.pos.setAttribute('transform', `translate(${CX} ${y})`);
    }
  };

  /** Ricompone la pila per `quanti` smash. `visibili` (opzionale) limita gli strati mostrati. */
  const imposta = (quanti, { animato = false, soloBase = false } = {}) => {
    n = quanti;
    const pos = posizioni(soloBase ? 1 : quanti);
    for (const s of ordine(quanti)) {
      const L = livelli[s.id];
      const attivo = soloBase ? !s.extra : s.visibile;
      if (attivo) {
        const nuovo = L.pos.style.display === 'none';
        mostra(s.id, pos[s.id], animato && !nuovo);
        if (nuovo && gsap && animato) {
          gsap.fromTo(L.strato, { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'bounce.out', overwrite: 'auto' });
        } else if (nuovo && gsap) {
          gsap.set(L.strato, { y: 0, opacity: 1 });
        }
      } else if (L.pos.style.display !== 'none') {
        if (gsap && animato) {
          gsap.to(L.strato, { y: -70, opacity: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto', onComplete: () => (L.pos.style.display = 'none') });
        } else {
          L.pos.style.display = 'none';
        }
      }
    }
  };

  return { imposta, livelli, get n() { return n; } };
}

/** Collega i bottoni x1…x4 (radiogroup) a una funzione `scegli(n)`. */
export function collegaSelettore(scegli) {
  const gruppo = $('[data-smash-sel]');
  const stato = $('[data-smash-stato]');
  if (!gruppo) return { imposta() {}, abilita() {} };
  const bottoni = [...gruppo.querySelectorAll('[data-x]')];
  const imposta = (n) => {
    for (const b of bottoni) {
      const on = Number(b.dataset.x) === n;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    if (stato) stato.textContent = `Panino con ${n} smash`;
  };
  const vai = (n, focus = false) => {
    if (gruppo.dataset.bloccato === 'true') return;
    imposta(n);
    scegli(n);
    if (focus) bottoni[n - 1].focus();
  };
  gruppo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-x]');
    if (b) vai(Number(b.dataset.x));
  });
  gruppo.addEventListener('keydown', (e) => {
    const i = bottoni.findIndex((b) => b === document.activeElement);
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (i < 0 || !passo) return;
    e.preventDefault();
    vai(((i + passo + MAX_SMASH) % MAX_SMASH) + 1, true);
  });
  return {
    imposta,
    // finché il panino non è costruito (scroll), il selettore è spento
    abilita(on) {
      gruppo.dataset.bloccato = String(!on);
      for (const b of bottoni) b.toggleAttribute('aria-disabled', !on);
      if (!on) for (const b of bottoni) b.setAttribute('aria-disabled', 'true');
      else for (const b of bottoni) b.removeAttribute('aria-disabled');
    },
  };
}

/** Senza movimento: pila statica con x2 (già nell'HTML), selettore attivo e cambio immediato. */
export function initSmashStatico() {
  if (!$('[data-palco]')) return;
  const pila = creaPila();
  collegaSelettore((n) => pila.imposta(n));
  // niente piastra senza movimento: resta solo il panino finito
  const p = $('[data-piastra]');
  if (p) p.style.display = 'none';
}
