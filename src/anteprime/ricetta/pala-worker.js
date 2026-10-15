import { disegnaPala } from './pala.js';

/* Disegna la pala fuori dal thread principale e la restituisce come bitmap. */
self.onmessage = ({ data }) => {
  const { id, opzioni } = data;
  try {
    const tela = new OffscreenCanvas(1, 1);
    disegnaPala(tela, opzioni);
    const bitmap = tela.transferToImageBitmap();
    self.postMessage({ id, bitmap }, [bitmap]);
  } catch (errore) {
    self.postMessage({ id, errore: String(errore) });
  }
};
