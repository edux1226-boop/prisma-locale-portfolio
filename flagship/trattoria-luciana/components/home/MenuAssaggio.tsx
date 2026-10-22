import Link from 'next/link';
import { dizionario, t } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { menu, visibile } from '@/lib/contenuti';
import { Scena } from '@/components/ui/Scena';
import { Prezzo } from '@/components/ui/Prezzo';
import { Icona } from '@/components/ui/Icona';
import s from './MenuAssaggio.module.css';

/* SCENA 06 — IL MENU
   Un assaggio dal CMS: i piatti "in evidenza", impaginati come in una
   rivista gastronomica. Prezzi e disponibilità arrivano dal ristorante. */
export function MenuAssaggio({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const piatti = menu.categorie.flatMap((c) =>
    c.piatti.filter((p) => p.inEvidenza && visibile(p)).map((p) => ({ categoria: c, piatto: p })),
  );
  return (
    <section className={`${s.menu} tono-bianco`} id="menu" aria-labelledby="menu-titolo" data-tono="bianco">
      <div className={s.testa}>
        <Scena numero={6} nome={d.home.menu.scena} lingua={lingua} />
        <h2 className="titolo-xl" id="menu-titolo" data-righe>{d.home.menu.titolo}</h2>
        <p className={`${s.intro} testo-l`} data-rivela>{d.home.menu.testo}</p>
      </div>

      {piatti.length > 0 && (
        <ul className={s.piatti} role="list">
          {piatti.map(({ categoria, piatto }) => (
            <li className={s.piatto} key={piatto.id} data-rivela>
              <p className={`${s.categoria} etichetta`}>{t(categoria.nome, lingua)}</p>
              <h3 className={s.nome}>
                <span lang="it">{piatto.nome.it}</span>
                {lingua !== 'it' && piatto.nome[lingua] !== piatto.nome.it && (
                  <span className={s.traduzione}>{piatto.nome[lingua]}</span>
                )}
              </h3>
              {piatto.descrizione && <p className={s.descrizione}>{t(piatto.descrizione, lingua)}</p>}
              <Prezzo piatto={piatto} lingua={lingua} className={s.prezzo} />
            </li>
          ))}
        </ul>
      )}

      <div className={s.piede}>
        <p className={s.nota}>{d.home.menu.nota}</p>
        <Link className="btn btn--pieno" href={percorso(lingua, 'menu')}>
          {d.home.menu.link} <Icona nome="freccia" />
        </Link>
      </div>
    </section>
  );
}
