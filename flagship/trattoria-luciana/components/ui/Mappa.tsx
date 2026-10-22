import { dizionario } from '@/i18n';
import { NOME } from '@/lib/contenuti';
import { VIA } from '@/lib/recapiti';
import type { Lingua } from '@/lib/rotte';
import s from './Mappa.module.css';

/* Mappa disegnata, non un iframe: niente cookie di terzi, niente peso,
   stessa palette del sito. Il lungomare corre lungo la spiaggia, il mare è a est. */

// alberi del lungomare: [x, y] lungo la strada
const PALME = Array.from({ length: 13 }, (_, i) => {
  const y = 30 + i * 48;
  return [352 + y * 0.085, y] as const;
});

export function Mappa({ lingua, id = 'mappa' }: { lingua: Lingua; id?: string }) {
  const m = dizionario(lingua).home.dove.mappa;
  return (
    <figure className={s.mappa}>
      <svg viewBox="0 0 600 660" role="img" aria-labelledby={`${id}-desc`}>
        <desc id={`${id}-desc`}>{m.descrizione}</desc>
        <defs>
          <pattern id={`${id}-onde`} width="34" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 8q8.5-6 17 0t17 0" fill="none" stroke="#F3EEE4" strokeOpacity=".16" strokeWidth="1" />
          </pattern>
          <pattern id={`${id}-sabbia`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r=".9" fill="#102B35" fillOpacity=".16" />
            <circle cx="7.5" cy="7.5" r=".9" fill="#102B35" fillOpacity=".1" />
          </pattern>
        </defs>

        {/* il paese: isolati a ovest del lungomare */}
        <g fill="none" stroke="#102B35" strokeOpacity=".16" strokeWidth="1">
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => {
              const y = 24 + r * 80;
              const x = 40 + c * 72;
              return <rect key={`${r}-${c}`} x={x} y={y} width="56" height="62" rx="3" transform="skewX(4.87)" />;
            }),
          )}
        </g>

        {/* il mare e la riva */}
        <path d="M420 -10 C 430 160 440 330 455 500 S 470 640 480 670 H610 V-10Z" fill="#102B35" />
        <path d="M420 -10 C 430 160 440 330 455 500 S 470 640 480 670 H610 V-10Z" fill={`url(#${id}-onde)`} />
        <path d="M372 -10 L420 -10 C 430 160 440 330 455 500 S 470 640 480 670 L 428 670 Z" fill={`url(#${id}-sabbia)`} />

        {/* il lungomare */}
        <path d="M350 -10 L408 670" stroke="#102B35" strokeWidth="5" strokeLinecap="round" />
        <g fill="#89927C">
          {PALME.map(([x, y]) => (
            <circle key={y} cx={x + 14} cy={y} r="3.2" />
          ))}
        </g>

        <text className={s.strada} transform="translate(350 392) rotate(85.1)">{m.lungomare.toUpperCase()}</text>
        <text className={s.mare} transform="translate(520 220) rotate(85.1)">{m.mare.toUpperCase()}</text>
        <text className={s.spiaggia} transform="translate(392 120) rotate(85.1)">{m.spiaggia.toUpperCase()}</text>
        <text className={s.citta} x="44" y="618">{m.citta.toUpperCase()}</text>

        <g transform="translate(60 64)" stroke="#102B35" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 30V-6M-6 1 0-7 6 1" />
        </g>
        <text className={s.nord} x="54" y="118">{m.nord}</text>

        {/* la trattoria */}
        <g transform="translate(378 318)" className={s.punto}>
          <circle className={s.alone} r="26" />
          <circle r="9" fill="#A96F59" stroke="#FAF7F0" strokeWidth="2" />
        </g>
        <path d="M352 318 H300" stroke="#102B35" strokeOpacity=".5" />
        <text className={s.nome} x="292" y="312" textAnchor="end">{NOME}</text>
        <text className={s.via} x="292" y="336" textAnchor="end">{VIA}</text>
      </svg>
      <figcaption className={s.nota}>{m.nonInScala}</figcaption>
    </figure>
  );
}
