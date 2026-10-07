import Link from 'next/link';
import { dizionario, t } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { pescato, visibile, leggi } from '@/lib/contenuti';
import { Foto } from '@/components/ui/Foto';
import { Dc } from '@/components/ui/Dc';
import { Icona } from '@/components/ui/Icona';
import { MareHero } from '@/components/mare/MareHero';
import heroStile from '@/components/home/Hero.module.css';
import s from './Mare.module.css';

const IMMAGINI = ['roseto', 'paranza'] as const;

/* /il-mare — l'Adriatico di Roseto, la pesca, il calendario del pescato.
   L'apertura riprende il mare dell'home (stessa scena WebGL, stesso fermo). */
export function Mare({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const m = d.mare;
  const specie = pescato.specie.filter(visibile);
  const fermo = leggi(pescato.fermo);
  const mesiFermo = new Set(fermo?.valore.mesi ?? []);

  return (
    <main id="contenuto" tabIndex={-1} data-pagina="mare">
      <header className={`${s.apertura} tono-notte`} data-tono="notte" data-hero>
        <div className={heroStile.palco}>
          <div className={heroStile.mare} data-hero-mare>
            <Foto id="mare-hero" lingua={lingua} sizes="100vw" verticaleQuando="(max-aspect-ratio: 4/5)" priorita decorativa className={heroStile.still} />
            <span className={heroStile.luccichio} aria-hidden="true" />
            <MareHero />
          </div>
          <div className={heroStile.velo} aria-hidden="true" />
          <div className={heroStile.immersione} aria-hidden="true" data-hero-immersione />
        </div>
        <div className={s.aperturaTesto} data-hero-contenuto>
          <p className={`${s.sopra} etichetta`}><span className={s.filo} aria-hidden="true" /> {m.sopra}</p>
          <h1 className="titolo-gigante" data-righe>{m.titolo}</h1>
          <p className="testo-l" data-rivela>{m.intro}</p>
        </div>
      </header>

      <section className={`${s.capitoli} tono-adriatico`} data-tono="adriatico" aria-label={m.titolo}>
        {m.capitoli.map((c, i) => (
          <article className={s.capitolo} key={c.titolo}>
            <div className={s.foto} data-rivela>
              <Foto id={IMMAGINI[i]} lingua={lingua} sizes="(min-width: 64em) 50vw, 100vw" />
            </div>
            <div className={s.testo}>
              <span className={s.num} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="titolo-xl" data-righe>{c.titolo}</h2>
              <p className="testo-l" data-rivela>{c.testo}</p>
            </div>
          </article>
        ))}
      </section>

      {specie.length > 0 && (
        <section className={`${s.calendario} tono-avorio`} aria-labelledby="calendario-titolo" data-tono="avorio">
          <div className={s.calendarioTesta}>
            <h2 className="titolo-xl" id="calendario-titolo" data-righe>{m.calendario.titolo}</h2>
            <p className="testo-l" data-rivela>{m.calendario.testo}</p>
            <p className={s.indicativo}>
              {m.calendario.indicativo}
              {specie.some((x) => x.status !== 'confirmed') && <Dc lingua={lingua} />}
            </p>
          </div>
          <div className={s.tabellaScorre} tabIndex={0} role="region" aria-label={`${m.calendario.titolo}: ${m.calendario.stagione}`}>
            <table className={s.tabella}>
              <caption className="sr-only">{m.calendario.titolo}. {m.calendario.indicativo}</caption>
              <thead>
                <tr>
                  <th scope="col" className={`${s.colSpecie} etichetta`}>{m.calendario.specie}</th>
                  {d.mesi.map((mese, i) => (
                    <th scope="col" key={mese} className={`etichetta ${mesiFermo.has(i + 1) ? s.mFermo : ''}`}>
                      <abbr title={d.mesiInteri[i]}>{mese}</abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specie.map((sp) => (
                  <tr key={sp.id} data-rivela>
                    <th scope="row" className={s.colSpecie}>
                      <span className={s.nomeSpecie}>{t(sp.nome, lingua)}</span>
                      <span className={s.latino} lang="la">{sp.latino}</span>
                    </th>
                    {d.mesi.map((mese, i) => {
                      const si = sp.mesi.includes(i + 1);
                      return (
                        <td key={mese} className={`${si ? s.si : ''} ${mesiFermo.has(i + 1) ? s.mFermo : ''}`}>
                          <span className="sr-only">{si ? `${d.mesiInteri[i]}: ${m.calendario.stagione}` : ''}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.legenda}>
            <p><span className={`${s.campione} ${s.si}`} aria-hidden="true" /> {m.calendario.stagione}</p>
            {fermo && (
              <p>
                <span className={`${s.campione} ${s.mFermo}`} aria-hidden="true" /> {m.calendario.fermo}: {t(fermo.valore.nota, lingua)}
                {fermo.daConfermare && <Dc lingua={lingua} />}
              </p>
            )}
          </div>
        </section>
      )}

      <section className={`${s.domani} tono-notte`} aria-labelledby="domani-titolo" data-tono="notte">
        <div className={s.domaniSfondo} aria-hidden="true" data-parallasse="0.1">
          <Foto id="notte" lingua={lingua} sizes="100vw" verticaleQuando="(max-aspect-ratio: 4/5)" decorativa />
        </div>
        <div className={s.domaniTesto}>
          <h2 className="titolo-xxl" id="domani-titolo" data-righe>{m.rispetto.titolo}</h2>
          <p className="testo-l" data-rivela>{m.rispetto.testo}</p>
          <div className={s.azioni} data-rivela>
            <Link className="btn btn--accento" href={percorso(lingua, 'prenota')}>{d.comune.prenota} <Icona nome="freccia" /></Link>
            <Link className="btn btn--linea" href={percorso(lingua, 'menu')}>{d.home.menu.link}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
