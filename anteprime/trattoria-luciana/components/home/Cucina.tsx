import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { Scena } from '@/components/ui/Scena';
import { Foto } from '@/components/ui/Foto';
import s from './Cucina.module.css';

const IMMAGINI = ['paranza', 'pescato', 'cucina', 'pergola'] as const;

/* SCENA 05 — DAL PESCATO ALLA TAVOLA
   Quattro passaggi, quattro immagini. Su desktop il palco resta fermo e ogni
   immagine entra con una maschera sulla precedente: il mare diventa cucina,
   la cucina diventa tavola. */
export function Cucina({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua).home.cucina;
  return (
    <section className={`${s.cucina} tono-avorio`} id="cucina" aria-labelledby="cucina-titolo" data-tono="avorio" data-cucina>
      <div className={s.testa}>
        <Scena numero={5} nome={d.scena} lingua={lingua} />
        <h2 className="titolo-xxl" id="cucina-titolo" data-righe>{d.titolo}</h2>
        <p className={`${s.intro} testo-l`} data-rivela>{d.intro}</p>
      </div>

      <div className={s.palco} data-cucina-palco>
        <ol className={s.passi} role="list">
          {d.passi.map((p, i) => (
            <li className={s.passo} key={p.titolo} data-cucina-passo={i}>
              <div className={s.foto} data-cucina-foto={i}>
                <Foto id={IMMAGINI[i]} lingua={lingua} sizes="(min-width: 64em) 40vw, 100vw" proporzioni="4 / 5" verticaleQuando="(min-width: 0px)" />
              </div>
              <div className={s.didascalia} data-cucina-testo={i}>
                <span className={s.num} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={s.titolo}>{p.titolo}</h3>
                <p className={s.testo}>{p.testo}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className={s.progresso} aria-hidden="true"><span data-cucina-progresso /></div>
      </div>
    </section>
  );
}
