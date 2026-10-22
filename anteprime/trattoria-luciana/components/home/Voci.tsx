import { dizionario, fmt } from '@/i18n';
import { LOCALE, type Lingua } from '@/lib/rotte';
import { recensioni, leggi, inAttesa, visibile } from '@/lib/contenuti';
import { Scena } from '@/components/ui/Scena';
import { Dc } from '@/components/ui/Dc';
import s from './Voci.module.css';

/* SCENA 09 — LA VOCE DEGLI OSPITI
   Solo recensioni verificate, citate nella loro lingua con fonte e data.
   Le frasi d'esempio esistono solo nell'anteprima (lo schema impedisce di
   confermarle). Senza recensioni confermate la scena non compare. */
export function Voci({ lingua }: { lingua: Lingua }) {
  const lista = recensioni.recensioni.filter(visibile);
  if (lista.length === 0) return null;
  const d = dizionario(lingua).home.voci;
  const sintesi = leggi(recensioni.sintesi);
  const numero = new Intl.NumberFormat(LOCALE[lingua], { maximumFractionDigits: 1 });

  return (
    <section className={`${s.voci} tono-adriatico`} id="voci" aria-labelledby="voci-titolo" data-tono="adriatico">
      <div className={s.testa}>
        <Scena numero={9} nome={d.scena} lingua={lingua} />
        <h2 className="sr-only" id="voci-titolo">{d.titolo}</h2>
        {sintesi ? (
          <p className={s.sintesi} data-rivela>
            <span className={s.voto}>{numero.format(sintesi.valore.punteggio)}</span>
            <span className={s.su}>{fmt(d.su, { su: sintesi.valore.su })}</span>
            <span className={s.fonte}>
              {fmt(d.sintesi, { numero: numero.format(sintesi.valore.numero), fonte: sintesi.valore.fonte })}
              {sintesi.daConfermare && <Dc lingua={lingua} />}
            </span>
          </p>
        ) : inAttesa(recensioni.sintesi) ? (
          <p className={s.sintesi} data-rivela>
            <span className={s.voto} aria-hidden="true">–,–</span>
            <span className={s.fonte}><Dc lingua={lingua} solo /></span>
          </p>
        ) : null}
      </div>

      <ul className={s.citazioni} role="list">
        {lista.map((r, i) => (
          <li key={r.id} className={i === 0 ? s.prima : undefined} data-rivela>
            <figure className={s.voce}>
              <blockquote lang={r.lingua} className={s.frase}>
                <p>{r.testo}</p>
              </blockquote>
              <figcaption className={s.firma}>
                {r.esempio ? (
                  <>
                    <span>{d.esempio}</span>
                    <span className="dc">{d.sostituire}</span>
                  </>
                ) : (
                  <>
                    {r.autore && <span className={s.autore}>{r.autore}</span>}
                    <span className={s.dove}>
                      {r.url ? <a className="link" href={r.url} target="_blank" rel="noopener">{d.fonti[r.fonte]}</a> : d.fonti[r.fonte]}
                      {r.data && <> · {r.data}</>}
                    </span>
                    {r.status !== 'confirmed' && <Dc lingua={lingua} />}
                  </>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
