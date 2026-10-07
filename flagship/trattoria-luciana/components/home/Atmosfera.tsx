import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { Scena } from '@/components/ui/Scena';
import { Foto } from '@/components/ui/Foto';
import s from './Atmosfera.module.css';

const LUOGHI = [
  { foto: 'sala', classe: s.sala, proporzioni: '3 / 2' },
  { foto: 'pergola', classe: s.pergola, proporzioni: '4 / 5' },
  { foto: 'orizzonte', classe: s.mare, proporzioni: '16 / 9' },
] as const;

/* SCENA 08 — LA SALA, LA PERGOLA, IL MARE
   Tre posti dove sedersi. Le immagini respirano appena, come mosse dalla
   brezza; la pergola ha l'ombra delle foglie che scorre. */
export function Atmosfera({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua).home.atmosfera;
  return (
    <section className={`${s.atmosfera} tono-bianco`} id="atmosfera" aria-labelledby="atmosfera-titolo" data-tono="bianco">
      <div className={s.testa}>
        <Scena numero={8} nome={d.scena} lingua={lingua} />
        <h2 className="titolo-xl" id="atmosfera-titolo" data-righe>{d.titolo}</h2>
      </div>
      <ul className={s.luoghi} role="list">
        {d.luoghi.map((l, i) => (
          <li className={`${s.luogo} ${LUOGHI[i].classe}`} key={l.nome} data-rivela>
            <div className={s.cornice} data-parallasse={i === 1 ? '-0.06' : '0.05'}>
              <div className={s.brezza}>
                <Foto id={LUOGHI[i].foto} lingua={lingua} sizes="(min-width: 64em) 45vw, 100vw" proporzioni={LUOGHI[i].proporzioni}
                  verticaleQuando={i === 1 ? '(min-width: 0px)' : undefined} />
              </div>
              {i === 1 && <span className={s.foglie} aria-hidden="true" />}
            </div>
            <div className={s.didascalia}>
              <h3 className={s.nome}>{l.nome}</h3>
              <p className={s.testo}>{l.testo}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
