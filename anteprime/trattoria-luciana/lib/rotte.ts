/* Lingue e pagine. L'italiano vive alla radice, inglese e tedesco hanno il
   prefisso e i propri indirizzi tradotti (/en/the-sea/, /de/das-meer/). */

export const LINGUE = ['it', 'en', 'de'] as const;
export type Lingua = (typeof LINGUE)[number];
export const LINGUA_BASE: Lingua = 'it';

export const PAGINE = ['home', 'storia', 'menu', 'mare', 'prenota', 'contatti'] as const;
export type Pagina = (typeof PAGINE)[number];

const SLUG: Record<Lingua, Record<Pagina, string>> = {
  it: { home: '', storia: 'storia', menu: 'menu', mare: 'il-mare', prenota: 'prenota', contatti: 'contatti' },
  en: { home: '', storia: 'story', menu: 'menu', mare: 'the-sea', prenota: 'book', contatti: 'contact' },
  de: { home: '', storia: 'geschichte', menu: 'speisekarte', mare: 'das-meer', prenota: 'reservieren', contatti: 'kontakt' },
};

export const NOME_LINGUA: Record<Lingua, string> = { it: 'Italiano', en: 'English', de: 'Deutsch' };
export const LOCALE: Record<Lingua, string> = { it: 'it-IT', en: 'en-GB', de: 'de-DE' };
export const OG_LOCALE: Record<Lingua, string> = { it: 'it_IT', en: 'en_GB', de: 'de_DE' };

export function isLingua(v: string): v is Lingua {
  return (LINGUE as readonly string[]).includes(v);
}

/** Percorso interno (senza base path, con la barra finale): /, /storia/, /en/story/ */
export function percorso(lingua: Lingua, pagina: Pagina, ancora?: string): string {
  const parti = [lingua === LINGUA_BASE ? '' : lingua, SLUG[lingua][pagina]].filter(Boolean);
  const base = parti.length ? `/${parti.join('/')}/` : '/';
  return ancora ? `${base}#${ancora}` : base;
}

/** Lo slug di una pagina interna, per generateStaticParams. */
export function slug(lingua: Lingua, pagina: Pagina): string {
  return SLUG[lingua][pagina];
}

/** Da slug a pagina, per la lingua data. */
export function paginaDaSlug(lingua: Lingua, s: string): Pagina | undefined {
  return PAGINE.find((p) => p !== 'home' && SLUG[lingua][p] === s);
}

/** Da un pathname (senza base path) alla sua lingua e pagina. */
export function analizza(pathname: string): { lingua: Lingua; pagina: Pagina } | null {
  const parti = pathname.split('/').filter(Boolean);
  const lingua: Lingua = parti[0] && isLingua(parti[0]) && parti[0] !== LINGUA_BASE ? parti[0] : LINGUA_BASE;
  const resto = lingua === LINGUA_BASE ? parti : parti.slice(1);
  if (resto.length === 0) return { lingua, pagina: 'home' };
  const pagina = resto.length === 1 ? paginaDaSlug(lingua, resto[0]) : undefined;
  return pagina ? { lingua, pagina } : null;
}
