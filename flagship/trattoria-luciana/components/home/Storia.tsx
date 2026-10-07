import Link from 'next/link';
import { dizionario } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { ristorante, leggi, inAttesa } from '@/lib/contenuti';
import { Scena } from '@/components/ui/Scena';
import { Foto } from '@/components/ui/Foto';
import { Dc } from '@/components/ui/Dc';
import { Icona } from '@/components/ui/Icona';
import s from './Storia.module.css';

/* SCENA 04 — LA FAMIGLIA
   Passato e presente sulla stessa immagine: scorrendo, il seppia di allora
   si dissolve nel colore di oggi. Accanto, il posto per la foto d'archivio. */
export function Storia({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua).home.storia;
  const anno = leggi(ristorante.fondazione);
  const annoInAttesa = inAttesa(ristorante.fondazione);
  return (
    <section className={`${s.storia} tono-sabbia`} id="la-famiglia" aria-labelledby="storia-titolo" data-tono="sabbia">
      <div className={s.testo}>
        <Scena numero={4} nome={d.scena} lingua={lingua} />
        <h2 className="titolo-xxl" id="storia-titolo" data-righe>{d.titolo}</h2>
        {(anno || annoInAttesa) && (
          <p className={s.dal} data-rivela>
            <span className={s.dalParola}>{d.dal}</span>{' '}
            <span className={`${s.dalAnno} cifra`}>{anno ? anno.valore : '19··'}</span>
            {(annoInAttesa || anno?.daConfermare) && <Dc lingua={lingua} />}
          </p>
        )}
        <p className={`${s.corpo} testo-l`} data-rivela>{d.testo}</p>
        <Link className="btn btn--pieno" href={percorso(lingua, 'storia')} data-rivela>
          {d.link} <Icona nome="freccia" />
        </Link>
      </div>

      <figure className={s.dissolvenza} data-dissolvenza>
        <div className={s.oggi}>
          <Foto id="lungomare" lingua={lingua} sizes="(min-width: 64em) 50vw, 100vw" />
        </div>
        <div className={s.allora} aria-hidden="true">
          <Foto id="lungomare" lingua={lingua} sizes="(min-width: 64em) 50vw, 100vw" decorativa />
        </div>
        <figcaption className={s.didascalie} aria-hidden="true">
          <span className="etichetta">{d.allora}</span>
          <span className="etichetta">{d.oggi}</span>
        </figcaption>
      </figure>

      <div className={s.archivio} data-rivela>
        <Foto id="archivio" lingua={lingua} sizes="(min-width: 64em) 22vw, 60vw" proporzioni="4 / 5" />
      </div>
    </section>
  );
}
