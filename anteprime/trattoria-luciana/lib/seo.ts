import 'server-only';
import type { Metadata } from 'next';
import { ristorante, orari, NOME } from './contenuti';
import { ANTEPRIMA, BASE_PATH } from './sito';
import { LINGUE, OG_LOCALE, percorso, type Lingua, type Pagina } from './rotte';
import { dizionario } from '@/i18n';
import { LINK_MAPPA } from './recapiti';
import type { Giorno } from '@/content/schema';

/* Metadati, canonical, hreflang e dati strutturati. Nei dati strutturati
   entra solo ciò che è confermato, anche nell'anteprima: sono dati per i
   motori di ricerca, non per chi guarda la pagina. */

const ANTEPRIMA_URL = 'https://prismalocale.it/anteprime/trattoria-luciana';

/** Origine pubblica con la sottocartella, senza barra finale. */
export function urlSito(): string | null {
  const daEnv = process.env.SITE_URL?.replace(/\/$/, '');
  if (daEnv) return daEnv;
  if (ristorante.dominio.status === 'confirmed' && ristorante.dominio.value) {
    return `${ristorante.dominio.value.replace(/\/$/, '')}${BASE_PATH}`;
  }
  return ANTEPRIMA ? ANTEPRIMA_URL : null;
}

export function assoluto(percorsoInterno: string): string | undefined {
  const base = urlSito();
  return base ? `${base}${percorsoInterno}` : undefined;
}

export function metadati(lingua: Lingua, pagina: Pagina): Metadata {
  const m = dizionario(lingua).meta.pagine[pagina];
  const base = urlSito();
  const qui = percorso(lingua, pagina);
  const og = assoluto('/media/og.jpg');
  return {
    title: m.titolo,
    description: m.descrizione,
    metadataBase: base ? new URL(`${base}/`) : undefined,
    alternates: base
      ? {
          canonical: `${base}${qui}`,
          languages: {
            ...Object.fromEntries(LINGUE.map((l) => [l, `${base}${percorso(l, pagina)}`])),
            'x-default': `${base}${percorso('it', pagina)}`,
          },
        }
      : undefined,
    robots: ANTEPRIMA ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: NOME,
      title: m.titolo,
      description: m.descrizione,
      locale: OG_LOCALE[lingua],
      alternateLocale: LINGUE.filter((l) => l !== lingua).map((l) => OG_LOCALE[l]),
      url: base ? `${base}${qui}` : undefined,
      images: og ? [{ url: og, width: 1200, height: 630, alt: NOME }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: m.titolo, description: m.descrizione, images: og ? [og] : undefined },
    formatDetection: { telephone: false, address: false, email: false },
    icons: { icon: `${BASE_PATH}/icona.svg`, apple: `${BASE_PATH}/apple-touch-icon.png` },
  };
}

const GIORNO_SCHEMA: Record<Giorno, string> = {
  lun: 'Monday', mar: 'Tuesday', mer: 'Wednesday', gio: 'Thursday', ven: 'Friday', sab: 'Saturday', dom: 'Sunday',
};

/** Restaurant (schema.org), solo con i dati confermati. */
export function jsonLd(lingua: Lingua) {
  const c = <T,>(x: { value: T | null; status: string }) => (x.status === 'confirmed' ? x.value : null);
  const base = urlSito();
  const ind = c(ristorante.indirizzo);
  const geo = c(ristorante.coordinate);
  const pranzo = c(orari.pranzo);
  const cena = c(orari.cena);
  const chiusi = new Set(c(orari.giornoChiusura) ?? []);
  const aperti = (Object.keys(GIORNO_SCHEMA) as Giorno[]).filter((g) => !chiusi.has(g)).map((g) => GIORNO_SCHEMA[g]);
  const fasce = [pranzo, cena].filter((x): x is NonNullable<typeof x> => Boolean(x));
  const social = [c(ristorante.social.instagram), c(ristorante.social.facebook)].filter(Boolean);
  const descr = c(ristorante.descrizione);
  const anno = c(ristorante.fondazione);

  const dati: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': base ? `${base}/#ristorante` : undefined,
    name: NOME,
    description: descr?.[lingua],
    url: base ? `${base}${percorso(lingua, 'home')}` : undefined,
    image: assoluto('/media/og.jpg'),
    address: ind ? {
      '@type': 'PostalAddress',
      streetAddress: ind.via,
      postalCode: ind.cap,
      addressLocality: ind.citta,
      addressRegion: ind.regione,
      addressCountry: ind.paese,
    } : undefined,
    geo: geo ? { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } : undefined,
    hasMap: LINK_MAPPA,
    telephone: c(ristorante.telefono) ?? undefined,
    email: c(ristorante.email) ?? undefined,
    servesCuisine: c(ristorante.cucina) ?? undefined,
    priceRange: c(ristorante.fasciaPrezzo) ?? undefined,
    foundingDate: anno ? String(anno) : undefined,
    acceptsReservations: true,
    hasMenu: base ? `${base}${percorso(lingua, 'menu')}` : undefined,
    openingHoursSpecification: fasce.length
      ? fasce.map((f) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: aperti, opens: f.dalle, closes: f.alle }))
      : undefined,
    sameAs: social.length ? social : undefined,
  };
  return JSON.parse(JSON.stringify(dati));
}
