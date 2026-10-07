import { orari, leggi, inAttesa } from '@/lib/contenuti';
import { dizionario, fmt, t } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import type { Giorno, Servizio } from '@/content/schema';
import { Dc } from './Dc';
import s from './Orari.module.css';

const GIORNI: Giorno[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

function fascia(serv: Servizio, lingua: Lingua) {
  return fmt(dizionario(lingua).orari.dalleAlle, { dalle: serv.dalle, alle: serv.alle });
}

/** Gli orari dal CMS. "compatti" per il piede e le schede, "settimana" per i contatti. */
export function Orari({ lingua, variante = 'compatti', className }: { lingua: Lingua; variante?: 'compatti' | 'settimana'; className?: string }) {
  const d = dizionario(lingua);
  const pranzo = leggi(orari.pranzo);
  const cena = leggi(orari.cena);
  const chiusura = leggi(orari.giornoChiusura);
  const stagione = leggi(orari.stagionalita);
  const attesaChiusura = inAttesa(orari.giornoChiusura);
  const attesaStagione = inAttesa(orari.stagionalita);

  if (!pranzo && !cena) return null;
  const chiusi = new Set(chiusura?.valore ?? []);
  const servizi = [
    { nome: d.orari.pranzo, dato: pranzo },
    { nome: d.orari.cena, dato: cena },
  ].filter((x) => x.dato);

  const extra = (
    <>
      {(chiusura || attesaChiusura) && (
        <div className={s.riga}>
          <dt>{d.orari.chiusura}</dt>
          <dd>
            {chiusura && chiusura.valore.length > 0
              ? chiusura.valore.map((g) => d.giorni[g]).join(', ')
              : null}
            {(attesaChiusura || chiusura?.daConfermare) && <Dc lingua={lingua} solo={!chiusura} />}
          </dd>
        </div>
      )}
      {(stagione || attesaStagione) && (
        <div className={s.riga}>
          <dt>{d.orari.stagione}</dt>
          <dd>
            {stagione && t(stagione.valore, lingua)}
            {(attesaStagione || stagione?.daConfermare) && <Dc lingua={lingua} solo={!stagione} />}
          </dd>
        </div>
      )}
    </>
  );

  if (variante === 'compatti') {
    return (
      <dl className={`${s.orari} ${className ?? ''}`}>
        {servizi.map(({ nome, dato }) => (
          <div className={s.riga} key={nome}>
            <dt>{nome}</dt>
            <dd className="cifra">
              {fascia(dato!.valore, lingua)}
              {dato!.daConfermare && <Dc lingua={lingua} />}
            </dd>
          </div>
        ))}
        {extra}
      </dl>
    );
  }

  return (
    <div className={className}>
      <table className={s.settimana}>
        <caption className="sr-only">{d.orari.titolo}</caption>
        <thead>
          <tr>
            <td />
            {servizi.map(({ nome, dato }) => (
              <th scope="col" key={nome} className="etichetta">
                {nome}
                {dato!.daConfermare && <Dc lingua={lingua} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GIORNI.map((g) => (
            <tr key={g} className={chiusi.has(g) ? s.chiuso : undefined}>
              <th scope="row">{d.giorni[g]}</th>
              {chiusi.has(g) ? (
                <td colSpan={servizi.length}>{d.orari.chiuso}</td>
              ) : (
                servizi.map(({ nome, dato }) => (
                  <td key={nome} className="cifra">{fascia(dato!.valore, lingua)}</td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <dl className={s.orari}>{extra}</dl>
    </div>
  );
}
