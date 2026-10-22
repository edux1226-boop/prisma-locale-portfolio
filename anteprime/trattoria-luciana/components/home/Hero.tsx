import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { VIA } from '@/lib/recapiti';
import { Foto } from '@/components/ui/Foto';
import { Scena } from '@/components/ui/Scena';
import { MareHero } from '@/components/mare/MareHero';
import s from './Hero.module.css';

/** Le lettere del nome, una per una: emergono dall'acqua (CSS, nessuno script). */
function Lettere({ parola, da }: { parola: string; da: number }) {
  return (
    <>
      {[...parola].map((c, i) => (
        <span className={s.lettera} style={{ '--i': da + i } as React.CSSProperties} key={i}>{c}</span>
      ))}
    </>
  );
}

/* SCENA 01 — IL MARE
   La superficie del mare a tutto schermo. Il nome non arriva come un'insegna:
   emerge piano mentre la luce sull'acqua costruisce l'atmosfera. Scorrendo,
   la superficie si avvicina fino a diventare il blu della scena successiva. */
export function Hero({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  return (
    <section className={`${s.hero} tono-notte`} id="inizio" aria-labelledby="hero-titolo" data-tono="adriatico" data-hero>
      <div className={s.palco}>
        <div className={s.mare} data-hero-mare>
          <Foto id="mare-hero" lingua={lingua} sizes="100vw" verticaleQuando="(max-aspect-ratio: 4/5)" priorita className={s.still} />
          <span className={s.luccichio} aria-hidden="true" />
          <MareHero />
        </div>
        <div className={s.velo} aria-hidden="true" />
        <div className={s.immersione} aria-hidden="true" data-hero-immersione />
      </div>

      <div className={s.contenuto} data-hero-contenuto>
        <p className={`${s.luogo} etichetta`}>
          {d.home.hero.luogo} <span aria-hidden="true">—</span> {VIA}
        </p>
        <h1 className={s.logo} id="hero-titolo">
          <span className="sr-only">Trattoria Luciana</span>
          <span className={s.logoSopra} aria-hidden="true"><Lettere parola="Trattoria" da={0} /></span>
          <span className={s.logoNome} aria-hidden="true"><Lettere parola="Luciana" da={4} /></span>
        </h1>
        <p className={s.tagline}><em>{d.comune.tagline}</em></p>
      </div>

      <div className={s.piede} data-hero-piede>
        <Scena numero={1} nome={d.home.hero.scena} lingua={lingua} className={s.scena} />
        <p className={s.sotto}>{d.home.hero.sotto}</p>
        <a className={s.scorri} href="#famiglia">
          <span>{d.comune.scorri}</span>
          <span className={s.filo} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
