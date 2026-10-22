import { dizionario, fmt, t } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { pranzo, leggi, inAttesa, visibile } from '@/lib/contenuti';
import { euro } from '@/lib/formato';
import type { Giorno } from '@/content/schema';
import { Scena } from '@/components/ui/Scena';
import { Dc } from '@/components/ui/Dc';
import { Disegno } from '@/components/ui/Disegno';
import s from './Pranzo.module.css';

const ORDINE: Giorno[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

/** "Lun–Ven" se i giorni sono consecutivi, altrimenti l'elenco. */
function giorni(lista: Giorno[], brevi: Record<Giorno, string>) {
  const idx = lista.map((g) => ORDINE.indexOf(g)).sort((a, b) => a - b);
  const consecutivi = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutivi && idx.length > 2) return `${brevi[ORDINE[idx[0]]]}–${brevi[ORDINE[idx[idx.length - 1]]]}`;
  return idx.map((i) => brevi[ORDINE[i]]).join(', ');
}

/* SCENA 07 — IL PRANZO DI LUCIANA
   Il menu fisso di mezzogiorno, come il cartoncino scritto ogni mattina.
   Tutto dal CMS: senza conferma, in produzione la scena non compare. */
export function Pranzo({ lingua, numero = 7 }: { lingua: Lingua; numero?: number | null }) {
  if (!visibile(pranzo)) return null;
  const d = dizionario(lingua);
  const p = d.home.pranzo;
  const prezzo = leggi(pranzo.prezzo);
  const gg = leggi(pranzo.giorni);
  const orari = leggi(pranzo.orari);
  const comprende = leggi(pranzo.comprende);
  const nota = leggi(pranzo.nota);
  const oggi = pranzo.piatti.filter(visibile);

  return (
    <section className={`${s.pranzo} tono-avorio`} id="pranzo-di-luciana" aria-labelledby="pranzo-titolo" data-tono="avorio">
      <div className={s.testo}>
        {numero !== null && <Scena numero={numero} nome={p.scena} lingua={lingua} />}
        <h2 className={`${s.titolo} titolo-gigante`} id="pranzo-titolo" data-righe>{p.titolo}</h2>
        <p className={`${s.corpo} testo-l`} data-rivela>{p.testo}</p>
        {pranzo.status === 'needs_confirmation' && <p data-rivela><Dc lingua={lingua} solo /></p>}
      </div>

      <article className={s.cartoncino} aria-labelledby="pranzo-titolo" data-rivela>
        <Disegno nome="piatto" className={s.disegno} />
        <dl className={s.dati}>
          {(gg || inAttesa(pranzo.giorni)) && (
            <div>
              <dt className="etichetta">{p.giorni}</dt>
              <dd>{gg ? giorni(gg.valore, d.giorniBrevi) : null}{(gg?.daConfermare || !gg) && <Dc lingua={lingua} solo={!gg} />}</dd>
            </div>
          )}
          {(orari || inAttesa(pranzo.orari)) && (
            <div>
              <dt className="etichetta">{p.orario}</dt>
              <dd className="cifra">
                {orari ? fmt(d.orari.dalleAlle, { dalle: orari.valore.dalle, alle: orari.valore.alle }) : null}
                {(orari?.daConfermare || !orari) && <Dc lingua={lingua} solo={!orari} />}
              </dd>
            </div>
          )}
          {(prezzo || inAttesa(pranzo.prezzo)) && (
            <div className={s.prezzo}>
              <dt className="etichetta">{p.prezzo}</dt>
              <dd>
                {prezzo && <><span className={`${s.cifra} cifra`}>{euro(prezzo.valore, lingua)}</span> <span className="tenue">{p.aPersona}</span></>}
                {(prezzo?.daConfermare || !prezzo) && <Dc lingua={lingua} solo={!prezzo} />}
              </dd>
            </div>
          )}
        </dl>

        {comprende && (
          <div className={s.blocco}>
            <h3 className="etichetta">{p.comprende}{comprende.daConfermare && <Dc lingua={lingua} />}</h3>
            <ul role="list" className={s.lista}>
              {comprende.valore.map((c) => <li key={c.it}>{t(c, lingua)}</li>)}
            </ul>
          </div>
        )}

        {oggi.length > 0 && (
          <div className={s.blocco}>
            <h3 className="etichetta">{p.oggi}{oggi.some((x) => x.status !== 'confirmed') && <Dc lingua={lingua} />}</h3>
            <ul role="list" className={s.oggi}>
              {oggi.map((x) => (
                <li key={x.nome.it}>
                  <span className={`${s.portata} etichetta`}>{p.portate[x.portata]}</span>
                  <span className={s.piatto}>{t(x.nome, lingua)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nota && <p className={s.nota}>{t(nota.valore, lingua)}{nota.daConfermare && <Dc lingua={lingua} />}</p>}
      </article>
    </section>
  );
}
