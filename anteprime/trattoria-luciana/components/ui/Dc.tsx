import { ANTEPRIMA } from '@/lib/sito';
import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';

/** Il segno "da confermare": esiste solo nell'anteprima. */
export function Dc({ lingua, testo, solo = false }: { lingua: Lingua; testo?: string; solo?: boolean }) {
  if (!ANTEPRIMA) return null;
  return <span className={solo ? 'dc dc--solo' : 'dc'}>{testo ?? dizionario(lingua).comune.daConfermare}</span>;
}
