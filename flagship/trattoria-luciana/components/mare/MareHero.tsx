'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { puoUsareWebGL } from './capacita';
import s from './MareHero.module.css';

/* Il terzo strato: HTML prima, movimento poi, WebGL per ultimo.
   Il fermo immagine è già nella pagina; la scena 3D arriva dopo, solo se il
   dispositivo la regge, e si sovrappone quando ha disegnato il primo
   fotogramma. Se qualcosa va storto si toglie e resta l'immagine. */
const MareScena = dynamic(() => import('./MareScena'), { ssr: false });

export function MareHero() {
  const [attivo, setAttivo] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!puoUsareWebGL()) return;
    const avvia = () => setAttivo(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(avvia, { timeout: 1200 });
    else setTimeout(avvia, 300);
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    if (pronto) r.setAttribute('data-webgl', '');
    return () => r.removeAttribute('data-webgl');
  }, [pronto]);

  if (!attivo) return null;
  return (
    <div className={s.tela} data-pronto={pronto || undefined} aria-hidden="true">
      <MareScena onPronto={() => setPronto(true)} onRinuncia={() => { setPronto(false); setAttivo(false); }} />
    </div>
  );
}
