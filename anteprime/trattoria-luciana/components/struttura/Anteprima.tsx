import { STUDIO } from '@/lib/sito';
import { NOME } from '@/lib/contenuti';
import { percorso, type Lingua } from '@/lib/rotte';
import s from './Anteprima.module.css';

/* Solo nell'anteprima: avviso fisso, filigrana e pagina di scadenza.
   I testi sono in italiano in ogni lingua: sono per il ristorante. */

export function Anteprima({ lingua }: { lingua: Lingua }) {
  const wa = `https://wa.me/${STUDIO.whatsapp}?text=${encodeURIComponent(`Ciao Prisma Locale, l'anteprima di ${NOME} è scaduta.`)}`;
  return (
    <>
      <div className={s.scaduta} lang="it">
        <p className={s.scadutaMarchio} aria-hidden="true">{NOME}</p>
        <h1 className={s.scadutaTitolo}>Anteprima scaduta, contatta Prisma Locale</h1>
        <p className={s.scadutaLink}>
          <a href={wa} rel="noopener">WhatsApp</a>
          <span aria-hidden="true">·</span>
          <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
        </p>
      </div>
      <aside className={s.avviso} aria-label="Anteprima" lang="it">
        <span className={s.punto} aria-hidden="true" />
        Anteprima riservata<span className={s.extra}> · immagini provvisorie</span> ·{' '}
        <a href={`${percorso('it', 'home')}#nota`}>Prisma Locale</a>
      </aside>
      <div className={s.filigrana} aria-hidden="true" />
    </>
  );
}
