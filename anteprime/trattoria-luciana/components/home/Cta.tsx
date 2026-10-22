import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { Scena } from '@/components/ui/Scena';
import { Foto } from '@/components/ui/Foto';
import { Percorsi } from '@/components/ui/Percorsi';
import s from './Cta.module.css';

/* SCENA 11 — LA TAVOLA
   Si torna al mare, di notte. L'ultima scena è la più semplice: prenotare. */
export function Cta({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  return (
    <section className={`${s.cta} tono-notte`} id="prenota" aria-labelledby="cta-titolo" data-tono="notte">
      <div className={s.sfondo} aria-hidden="true" data-parallasse="0.12">
        <Foto id="notte" lingua={lingua} sizes="100vw" verticaleQuando="(max-aspect-ratio: 4/5)" decorativa />
      </div>
      <div className={s.velo} aria-hidden="true" />
      <div className={s.contenuto}>
        <Scena numero={11} nome={d.home.cta.scena} lingua={lingua} className={s.scena} />
        <h2 className={`${s.titolo} titolo-gigante`} id="cta-titolo">
          <span className={s.riga} data-righe>{d.home.cta.righe[0]}</span>{' '}
          <span className={s.riga} data-righe><em>{d.home.cta.righe[1]}</em></span>
        </h2>
        <p className={`${s.testo} testo-l`} data-rivela>{d.home.cta.testo}</p>
        <Percorsi lingua={lingua} className={s.percorsi} />
      </div>
    </section>
  );
}
