import type Lenis from 'lenis';

/* Lo scorrimento morbido (Lenis) è della regia; qui chi deve solo
   fermarlo o usarlo (menu, ancore) lo trova senza dipendere da lei. */

let lenis: Lenis | null = null;

export function impostaLenis(l: Lenis | null) {
  lenis = l;
}

export function lenisAttivo(): Lenis | null {
  return lenis;
}

export function fermaScorrimento(ferma: boolean) {
  if (!lenis) return;
  if (ferma) lenis.stop();
  else lenis.start();
}
