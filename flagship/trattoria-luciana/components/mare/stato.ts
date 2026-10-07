/* Lo stato condiviso tra la regia (scroll) e la scena del mare.
   Un oggetto semplice, letto a ogni fotogramma: nessun re-render React. */
export const statoMare = {
  /** 0 → 1: la superficie si avvicina (scritto dalla timeline dell'apertura). */
  avvicina: 0,
  /** Il palco è visibile? Se no, la scena non disegna. */
  visibile: true,
};
