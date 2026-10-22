import Link from 'next/link';
import { ristorante, leggi } from '@/lib/contenuti';
import { telefono, whatsapp, attesa } from '@/lib/recapiti';
import { dizionario } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { Icona } from './Icona';
import { Dc } from './Dc';
import s from './Percorsi.module.css';

/** Le tre strade per prenotare: telefono, WhatsApp (solo se confermato), richiesta online. */
export function Percorsi({ lingua, ancoraModulo, className, livello = 'h3' }: { lingua: Lingua; ancoraModulo?: string; className?: string; livello?: 'h2' | 'h3' }) {
  const d = dizionario(lingua);
  const T = livello;
  const tel = telefono();
  const wa = whatsapp(d.percorsi.whatsappTesto);
  const motore = leggi(ristorante.prenotazione.motore);
  const mostraTel = tel || attesa.telefono();
  const mostraWa = wa || attesa.whatsapp();
  const numero = (n: number) => String(n).padStart(2, '0');

  return (
    <ol className={`${s.percorsi} ${className ?? ''}`} role="list">
      {mostraTel && (
      <li className={s.percorso} data-rivela>
        <span className={s.num} aria-hidden="true">01</span>
        <T className={s.titolo}>{d.percorsi.telefono.titolo}</T>
        <p className={s.testo}>{d.percorsi.telefono.testo}</p>
        {tel ? (
          <a className="btn btn--pieno" href={tel.valore.href}>
            <Icona nome="telefono" /> {tel.valore.testo}
            {tel.daConfermare && <Dc lingua={lingua} />}
          </a>
        ) : (
          <span className="btn btn--linea" aria-disabled="true">
            {d.comune.chiama} <Dc lingua={lingua} />
          </span>
        )}
      </li>
      )}

      {mostraWa && (
        <li className={s.percorso} data-rivela>
          <span className={s.num} aria-hidden="true">{numero(mostraTel ? 2 : 1)}</span>
          <T className={s.titolo}>{d.percorsi.whatsapp.titolo}</T>
          <p className={s.testo}>{d.percorsi.whatsapp.testo}</p>
          {wa ? (
            <a className="btn btn--linea" href={wa.valore.href} target="_blank" rel="noopener">
              <Icona nome="whatsapp" /> {d.comune.whatsapp}
              <span className="sr-only"> {d.comune.nuovaScheda}</span>
              {wa.daConfermare && <Dc lingua={lingua} />}
            </a>
          ) : (
            <span className="btn btn--linea" aria-disabled="true">
              {d.comune.whatsapp} <Dc lingua={lingua} />
            </span>
          )}
        </li>
      )}

      <li className={s.percorso} data-rivela>
        <span className={s.num} aria-hidden="true">{numero(1 + Number(Boolean(mostraTel)) + Number(Boolean(mostraWa)))}</span>
        <T className={s.titolo}>{d.percorsi.online.titolo}</T>
        <p className={s.testo}>{d.percorsi.online.testo}</p>
        {motore && !motore.daConfermare ? (
          <a className="btn btn--accento" href={motore.valore.url} target="_blank" rel="noopener">
            {d.percorsi.motore.azione} <Icona nome="obliqua" />
            <span className="sr-only"> {d.comune.nuovaScheda}</span>
          </a>
        ) : ancoraModulo ? (
          <a className="btn btn--accento" href={`#${ancoraModulo}`}>
            {d.percorsi.online.azione} <Icona nome="giu" />
          </a>
        ) : (
          <Link className="btn btn--accento" href={percorso(lingua, 'prenota')}>
            {d.percorsi.online.azione} <Icona nome="freccia" />
          </Link>
        )}
      </li>
    </ol>
  );
}
