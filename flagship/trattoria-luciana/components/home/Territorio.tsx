import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { Scena } from '@/components/ui/Scena';
import { Foto } from '@/components/ui/Foto';
import s from './Territorio.module.css';

/* SCENA 03 — IL TERRITORIO
   Il blu diventa una fotografia: la finestra si apre dalla linea
   dell'orizzonte e rivela Roseto. Poi tre parole, tre luoghi: la città, il
   mare, la regione. Su desktop la scena resta ferma mentre si scorre. */
export function Territorio({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua).home.territorio;
  return (
    <section className={`${s.territorio} tono-adriatico`} id="territorio" aria-labelledby="territorio-titolo" data-tono="adriatico" data-territorio>
      <div className={s.palco} data-territorio-palco>
        <div className={s.finestra} data-territorio-finestra>
          <div className={s.immagine} data-territorio-immagine>
            <Foto id="roseto" lingua={lingua} sizes="100vw" verticaleQuando="(max-aspect-ratio: 4/5)" />
          </div>
          <div className={s.velo} aria-hidden="true" />
        </div>
        <div className={s.testa}>
          <Scena numero={3} nome={d.scena} lingua={lingua} className={s.scena} />
          <h2 className={`${s.titolo} titolo-xl`} id="territorio-titolo" data-righe>{d.titolo}</h2>
        </div>
        <ol className={s.voci} role="list">
          {d.voci.map((v, i) => (
            <li className={s.voce} key={v.nome} data-territorio-voce={i}>
              <p className={s.nome}>
                <span className={s.numero} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {v.nome} <em className={s.sotto}>{v.sotto}</em>
              </p>
              <p className={s.testo}>{v.testo}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
