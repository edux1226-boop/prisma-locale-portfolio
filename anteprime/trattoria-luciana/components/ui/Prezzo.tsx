import { leggi } from '@/lib/contenuti';
import { euro } from '@/lib/formato';
import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import type { Piatto } from '@/content/schema';
import { Dc } from './Dc';

/** Il prezzo di un piatto, con l'unità ("all'etto", "bottiglia") e il suo stato. */
/** `segna`: false quando il piatto stesso porta già il segno "da confermare". */
export function Prezzo({ piatto, lingua, className, segna = true }: { piatto: Piatto; lingua: Lingua; className?: string; segna?: boolean }) {
  const p = leggi(piatto.prezzo);
  if (!p) return null;
  const unita = dizionario(lingua).unita[piatto.unita];
  return (
    <span className={className}>
      <span className="cifra">{euro(p.valore, lingua)}</span>
      {unita && <span className="tenue"> {unita}</span>}
      {segna && p.daConfermare && <Dc lingua={lingua} />}
    </span>
  );
}
