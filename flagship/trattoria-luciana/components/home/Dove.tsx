import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { orariVisibili } from '@/lib/contenuti';
import { CITTA, LINK_INDICAZIONI, LINK_MAPPA, telefono, attesa } from '@/lib/recapiti';
import { Scena } from '@/components/ui/Scena';
import { Mappa } from '@/components/ui/Mappa';
import { Orari } from '@/components/ui/Orari';
import { Icona } from '@/components/ui/Icona';
import { Dc } from '@/components/ui/Dc';
import s from './Dove.module.css';

/* SCENA 10 — DOVE SIAMO: Lungomare Trieste 60. */
export function Dove({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const tel = telefono();
  return (
    <section className={`${s.dove} tono-sabbia`} id="dove" aria-labelledby="dove-titolo" data-tono="sabbia">
      <div className={s.mappa} data-rivela>
        <Mappa lingua={lingua} id="mappa-home" />
      </div>
      <div className={s.dati}>
        <Scena numero={10} nome={d.home.dove.scena} lingua={lingua} />
        <h2 className="titolo-xl" id="dove-titolo" data-righe>{d.home.dove.titolo}</h2>
        <p className={`${s.citta} testo-l`} data-rivela>{CITTA}</p>
        <p className={s.testo} data-rivela>{d.home.dove.testo}</p>
        {orariVisibili() && (
          <div className={s.orari} data-rivela>
            <h3 className="etichetta">{d.orari.titolo}</h3>
            <Orari lingua={lingua} />
          </div>
        )}
        <div className={s.azioni} data-rivela>
          <a className="btn btn--pieno" href={LINK_INDICAZIONI} target="_blank" rel="noopener">
            <Icona nome="mappa" /> {d.recapiti.indicazioni}<span className="sr-only"> {d.comune.nuovaScheda}</span>
          </a>
          <a className="btn btn--linea" href={LINK_MAPPA} target="_blank" rel="noopener">
            {d.recapiti.mappa} <Icona nome="obliqua" /><span className="sr-only"> {d.comune.nuovaScheda}</span>
          </a>
          {tel ? (
            <a className="btn btn--linea" href={tel.valore.href}>
              <Icona nome="telefono" /> {tel.valore.testo}{tel.daConfermare && <Dc lingua={lingua} />}
            </a>
          ) : attesa.telefono() ? (
            <span className="btn btn--linea" aria-disabled="true">{d.recapiti.telefono} <Dc lingua={lingua} /></span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
