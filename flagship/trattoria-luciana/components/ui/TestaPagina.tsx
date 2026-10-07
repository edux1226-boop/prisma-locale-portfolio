import { Foto } from './Foto';
import type { Lingua } from '@/lib/rotte';
import s from './TestaPagina.module.css';

/** L'apertura delle pagine interne: sempre sul blu del mare, come l'home. */
export function TestaPagina({
  lingua, sopra, titolo, intro, foto, children,
}: { lingua: Lingua; sopra: string; titolo: string; intro?: string; foto?: string; children?: React.ReactNode }) {
  return (
    <header className={`${s.testa} tono-notte`} data-tono="notte" data-testa-pagina>
      {foto && (
        <div className={s.sfondo} aria-hidden="true" data-parallasse="0.18">
          <Foto id={foto} lingua={lingua} sizes="100vw" verticaleQuando="(max-aspect-ratio: 4/5)" priorita decorativa />
        </div>
      )}
      <div className={s.velo} aria-hidden="true" />
      <div className={s.contenuto}>
        <p className={`${s.sopra} etichetta`}>
          <span className={s.filo} aria-hidden="true" /> {sopra}
        </p>
        <h1 className={`${s.titolo} titolo-gigante`} data-righe>{titolo}</h1>
        {intro && <p className={`${s.intro} testo-l`} data-rivela>{intro}</p>}
        {children}
      </div>
    </header>
  );
}
