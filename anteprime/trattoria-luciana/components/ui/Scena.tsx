import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';

/** "Scena 03 — Il territorio": la numerazione editoriale delle scene. */
export function Scena({ numero, nome, lingua, className }: { numero: number; nome: string; lingua: Lingua; className?: string }) {
  const n = String(numero).padStart(2, '0');
  return (
    <p className={`scena etichetta ${className ?? ''}`} data-rivela>
      <span className="sr-only">{dizionario(lingua).comune.scena} {n}: </span>
      <span className="scena__num" aria-hidden="true">{n}</span>
      <span className="scena__filo" aria-hidden="true" />
      <span>{nome}</span>
    </p>
  );
}
