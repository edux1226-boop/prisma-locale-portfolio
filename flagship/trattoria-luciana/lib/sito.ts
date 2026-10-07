/* Configurazione del sito che dipende da dove e come viene pubblicato.
   I valori arrivano da next.config.ts (variabili d'ambiente della build). */

export type Modalita = 'anteprima' | 'produzione';

export const MODALITA: Modalita = process.env.NEXT_PUBLIC_SITE_MODE === 'produzione' ? 'produzione' : 'anteprima';

/** Anteprima riservata: noindex, filigrana, scadenza, dati da confermare visibili e segnati. */
export const ANTEPRIMA = MODALITA === 'anteprima';

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Data oltre la quale l'anteprima mostra solo "Anteprima scaduta" (ora italiana). */
export const SCADENZA = '2026-12-15T23:59:59+01:00';

/** Prisma Locale, per la nota dell'anteprima e la pagina di scadenza. */
export const STUDIO = {
  nome: 'Prisma Locale',
  url: 'https://prismalocale.it/',
  email: 'info@prismalocale.it',
  whatsapp: '393758350800',
} as const;

/** Percorso pubblico di un file in /public, con la sottocartella di pubblicazione. */
export function asset(percorso: string): string {
  return `${BASE_PATH}${percorso.startsWith('/') ? '' : '/'}${percorso}`;
}
