import type { Lingua } from '@/lib/rotte';
import type { Testo } from '@/content/schema';
import { it, type Dizionario } from './it';
import { en } from './en';
import { de } from './de';

const DIZIONARI: Record<Lingua, Dizionario> = { it, en, de };

export function dizionario(lingua: Lingua): Dizionario {
  return DIZIONARI[lingua];
}

/** Riempie i segnaposto {nome} di una stringa. */
export function fmt(stringa: string, valori: Record<string, string | number>): string {
  return stringa.replace(/\{(\w+)\}/g, (tutto, k: string) => (k in valori ? String(valori[k]) : tutto));
}

/** Un testo del CMS nella lingua della pagina. */
export function t(testo: Testo, lingua: Lingua): string {
  return testo[lingua];
}

export type { Dizionario };
