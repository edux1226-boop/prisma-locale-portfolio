import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { Scena } from '@/components/ui/Scena';
import s from './Intro.module.css';

/* SCENA 02 — UNA STORIA DI FAMIGLIA
   Il blu in cui si è immersa l'apertura: qui diventa il fondo di una frase. */
export function Intro({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua).home.intro;
  return (
    <section className={`${s.intro} tono-adriatico`} id="famiglia" aria-labelledby="intro-titolo" data-tono="adriatico">
      <Scena numero={2} nome={d.scena} lingua={lingua} />
      <h2 className={`${s.titolo} titolo-xxl`} id="intro-titolo">
        {d.righe.map((r, i) => (
          <span key={i} className={s.riga} data-righe>{r} </span>
        ))}
      </h2>
      <svg className={s.onda} viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" data-traccia>
        <path d="M0 20 C 100 6, 200 34, 300 20 S 500 6, 600 20 S 800 34, 900 20 S 1100 6, 1200 20" />
      </svg>
      <p className={`${s.testo} testo-l`} data-rivela>{d.testo}</p>
    </section>
  );
}
