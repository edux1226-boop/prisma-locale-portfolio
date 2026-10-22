import Link from 'next/link';
import { dizionario, t } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { storia, visibile, leggi, inAttesa } from '@/lib/contenuti';
import { TestaPagina } from '@/components/ui/TestaPagina';
import { Foto } from '@/components/ui/Foto';
import { Dc } from '@/components/ui/Dc';
import { Icona } from '@/components/ui/Icona';
import s from './Storia.module.css';

/* /storia — la famiglia Ruggieri, capitolo per capitolo (dal CMS). */
export function Storia({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const capitoli = storia.capitoli.filter(visibile);
  return (
    <main id="contenuto" tabIndex={-1} data-pagina="storia">
      <TestaPagina lingua={lingua} sopra={d.storia.sopra} titolo={d.storia.titolo} intro={d.storia.intro} foto="lungomare" />

      {capitoli.length > 0 && (
        <section className={`${s.capitoli} tono-sabbia`} aria-label={d.storia.titolo} data-tono="sabbia">
          <span className={s.linea} aria-hidden="true" data-storia-linea />
          <ol role="list">
            {capitoli.map((c, i) => {
              const anno = leggi(c.anno);
              return (
                <li className={s.capitolo} key={c.id} data-capitolo>
                  <div className={s.foto} data-rivela>
                    {c.fotografie[0] && (
                      <Foto id={c.fotografie[0]} lingua={lingua} sizes="(min-width: 64em) 40vw, 100vw" proporzioni="4 / 5" verticaleQuando="(min-width: 0px)" />
                    )}
                  </div>
                  <div className={s.testo}>
                    <p className={`${s.numero} etichetta`} data-rivela>
                      {d.storia.capitolo} {String(i + 1).padStart(2, '0')}
                    </p>
                    {(anno || inAttesa(c.anno)) && (
                      <p className={`${s.anno} cifra`} data-rivela>
                        {anno?.valore}
                        {(anno?.daConfermare || !anno) && <Dc lingua={lingua} solo={!anno} testo={!anno ? d.storia.annoDaConfermare : undefined} />}
                      </p>
                    )}
                    <h2 className="titolo-xl" data-righe>{t(c.titolo, lingua)}</h2>
                    <p className="testo-l" data-rivela>
                      {t(c.testo, lingua)}
                      {c.status !== 'confirmed' && <Dc lingua={lingua} />}
                    </p>
                    {c.didascalia && <p className={s.didascalia}>{t(c.didascalia, lingua)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className={`${s.chiusura} tono-adriatico`} aria-labelledby="storia-chiusura" data-tono="adriatico">
        <h2 className="titolo-xxl" id="storia-chiusura" data-righe><em>{d.storia.chiusura}</em></h2>
        <div className={s.azioni} data-rivela>
          <Link className="btn btn--accento" href={percorso(lingua, 'prenota')}>{d.comune.prenota} <Icona nome="freccia" /></Link>
          <Link className="btn btn--linea" href={percorso(lingua, 'menu')}>{d.home.menu.link}</Link>
        </div>
      </section>
    </main>
  );
}
