'use client';

import { useEffect, useState } from 'react';
import s from './NotaAnteprima.module.css';

const CHIAVE = 'luciana-anteprima-lista';

type Voce = { id: string; titolo: string; testo: string };

/** La lista "cosa manca": ricorda le spunte su questo dispositivo e le mette
    nel messaggio per Prisma Locale. */
export function ListaMancanti({ voci, studio, nome }: { voci: Voce[]; studio: { whatsapp: string; email: string }; nome: string }) {
  const [pronte, setPronte] = useState<string[]>([]);

  useEffect(() => {
    try {
      const salvate = JSON.parse(localStorage.getItem(CHIAVE) ?? '[]');
      if (Array.isArray(salvate)) setPronte(salvate.filter((x) => typeof x === 'string'));
    } catch {
      /* archiviazione non disponibile: la lista funziona lo stesso */
    }
  }, []);

  const cambia = (id: string, si: boolean) => {
    const nuove = si ? [...new Set([...pronte, id])] : pronte.filter((x) => x !== id);
    setPronte(nuove);
    try { localStorage.setItem(CHIAVE, JSON.stringify(nuove)); } catch { /* idem */ }
  };

  const nomi = voci.filter((v) => pronte.includes(v.id)).map((v) => v.titolo.toLowerCase());
  let testo = `Ciao Prisma Locale, sono di ${nome}. Ho visto l'anteprima del sito.`;
  if (nomi.length) testo += ` Abbiamo già pronto: ${nomi.join(', ')}.`;

  return (
    <>
      <ul className={s.lista} role="list">
        {voci.map((v) => (
          <li key={v.id}>
            <label>
              <input type="checkbox" value={v.id} checked={pronte.includes(v.id)} onChange={(e) => cambia(v.id, e.target.checked)} />
              <span className={s.voce}><b>{v.titolo}</b><span>{v.testo}</span></span>
            </label>
          </li>
        ))}
      </ul>
      <div className={s.piede}>
        <p className={s.conto} aria-live="polite"><span>{pronte.length}</span> di {voci.length} pronti</p>
        <a className="btn btn--pieno" href={`https://wa.me/${studio.whatsapp}?text=${encodeURIComponent(testo)}`} target="_blank" rel="noopener">
          Rispondi a Prisma Locale<span className="sr-only"> su WhatsApp (si apre in una nuova scheda)</span>
        </a>
        <p className={s.mail}>
          oppure <a className="link" href={`mailto:${studio.email}?subject=${encodeURIComponent(`${nome}, materiale per il sito`)}&body=${encodeURIComponent(testo)}`}>{studio.email}</a>
        </p>
      </div>
    </>
  );
}
