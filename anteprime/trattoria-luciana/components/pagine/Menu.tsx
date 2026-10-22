import { dizionario, t } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { menu, visibile, leggi } from '@/lib/contenuti';
import { euro } from '@/lib/formato';
import { Allergene, type Piatto } from '@/content/schema';
import { telefono } from '@/lib/recapiti';
import { TestaPagina } from '@/components/ui/TestaPagina';
import { Prezzo } from '@/components/ui/Prezzo';
import { Dc } from '@/components/ui/Dc';
import { Pranzo } from '@/components/home/Pranzo';
import s from './Menu.module.css';

const NUMERO = Object.fromEntries(Allergene.options.map((a, i) => [a, i + 1])) as Record<Allergene, number>;

function Allergeni({ piatto, lingua, segna }: { piatto: Piatto; lingua: Lingua; segna: boolean }) {
  const a = leggi(piatto.allergeni);
  if (!a || a.valore.length === 0) return null;
  const d = dizionario(lingua);
  const ordinati = [...a.valore].sort((x, y) => NUMERO[x] - NUMERO[y]);
  return (
    <p className={s.allergeni}>
      <span className="sr-only">{d.menu.contiene}: {ordinati.map((x) => d.allergeni[x]).join(', ')}</span>
      {ordinati.map((x) => (
        <abbr key={x} className={s.allergene} title={d.allergeni[x]} aria-hidden="true">{NUMERO[x]}</abbr>
      ))}
      {segna && a.daConfermare && <Dc lingua={lingua} />}
    </p>
  );
}

/* /menu — la carta completa dal CMS: categorie, piatti, prezzi, allergeni,
   disponibilità, piatto del giorno. In produzione compare solo ciò che il
   ristorante ha confermato. */
export function Menu({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const categorie = menu.categorie
    .map((c) => ({ ...c, piatti: c.piatti.filter(visibile) }))
    .filter((c) => c.piatti.length > 0);
  const coperto = leggi(menu.coperto);
  const note = menu.note.filter(visibile);
  const tel = telefono();

  return (
    <main id="contenuto" tabIndex={-1} data-pagina="menu">
      <TestaPagina lingua={lingua} sopra={d.menu.sopra} titolo={d.menu.titolo} intro={d.menu.intro} foto="orizzonte" />

      {categorie.length > 0 ? (
        <>
          <nav className={`${s.indice} tono-bianco`} aria-label={d.menu.vaiA} data-indice-menu>
            <ul role="list">
              {categorie.map((c) => (
                <li key={c.id}><a href={`#${c.id}`}>{t(c.nome, lingua)}</a></li>
              ))}
            </ul>
          </nav>

          <div className={`${s.carta} tono-bianco`} data-tono="bianco">
            {categorie.map((c) => (
              <section className={s.categoria} id={c.id} key={c.id} aria-labelledby={`${c.id}-titolo`}>
                <header className={s.testaCategoria}>
                  <h2 className="titolo-xl" id={`${c.id}-titolo`} data-righe>{t(c.nome, lingua)}</h2>
                  {c.nota && <p className={s.notaCategoria}>{t(c.nota, lingua)}</p>}
                </header>
                <ul role="list" className={s.piatti}>
                  {c.piatti.map((p) => (
                    <li className={s.piatto} key={p.id} data-rivela>
                      <div className={s.nomi}>
                        <h3 className={s.nome}>
                          <span lang="it">{p.nome.it}</span>
                          {p.piattoDelGiorno && <span className={`${s.giorno} etichetta`}>{d.menu.piattoDelGiorno}</span>}
                        </h3>
                        {lingua !== 'it' && p.nome[lingua] !== p.nome.it && <p className={s.traduzione}>{p.nome[lingua]}</p>}
                        {p.descrizione && <p className={s.descrizione}>{t(p.descrizione, lingua)}</p>}
                        <div className={s.dettagli}>
                          {d.disponibilita[p.disponibilita] && <span className={`${s.disponibilita} etichetta`}>{d.disponibilita[p.disponibilita]}</span>}
                          <Allergeni piatto={p} lingua={lingua} segna={p.status === 'confirmed'} />
                          {p.status !== 'confirmed' && <Dc lingua={lingua} />}
                        </div>
                      </div>
                      <Prezzo piatto={p} lingua={lingua} className={s.prezzo} segna={p.status === 'confirmed'} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <footer className={s.note}>
              {coperto && (
                <p className={s.coperto}>
                  {d.menu.coperto} <span className="cifra">{euro(coperto.valore, lingua)}</span>
                  {coperto.daConfermare && <Dc lingua={lingua} />}
                </p>
              )}
              <p>{d.menu.prezzi}</p>
              {note.map((n) => (
                <p key={n.testo.it}>{t(n.testo, lingua)}{n.status !== 'confirmed' && <Dc lingua={lingua} />}</p>
              ))}
            </footer>
          </div>
        </>
      ) : (
        <section className={`${s.vuoto} tono-bianco`} data-tono="bianco">
          <p className="testo-l">{d.menu.vuoto}</p>
          {tel && <a className="btn btn--pieno" href={tel.valore.href}>{tel.valore.testo}</a>}
        </section>
      )}

      <section className={`${s.legenda} tono-sabbia`} aria-labelledby="allergeni-titolo" data-tono="sabbia">
        <h2 className="titolo-l" id="allergeni-titolo">{d.menu.allergeniTitolo}</h2>
        <p className={s.legendaNota}>{d.menu.allergeniNota}</p>
        <ol className={s.legendaLista} role="list">
          {Allergene.options.map((a) => (
            <li key={a}><span className={s.allergene} aria-hidden="true">{NUMERO[a]}</span> {d.allergeni[a]}</li>
          ))}
        </ol>
      </section>

      <Pranzo lingua={lingua} numero={null} />
    </main>
  );
}
