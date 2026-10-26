import { SEDI, ORDINE_SEDI, SOCIAL, indirizzoCompleto } from '../data/sedi.js';

/* JSON-LD pronto per quando il sito sarà pubblico. Orari, civico di Pineto e telefono di Roseto
   sono "da confermare" (vedi data/sedi.js). L'URL è provvisorio. */
const URL_SITO = 'https://prismalocale.it/anteprime/morsi/';

const sede = (s) => ({
  '@type': 'Restaurant',
  name: `Morsi ${s.nome}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: s.via,
    postalCode: s.cap,
    addressLocality: s.citta,
    addressRegion: s.provincia,
    addressCountry: 'IT',
  },
  ...(s.tel ? { telephone: `+39 ${s.tel}` } : {}),
  servesCuisine: ['Smash burger', 'Fried chicken'],
  priceRange: '€€',
  openingHoursSpecification: s.orari.fasce.map((f) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: f.giorni,
    opens: f.apre,
    closes: f.chiude,
  })),
  ...(s.deliveroo ? { hasMenu: s.deliveroo } : {}),
  description: indirizzoCompleto(s),
});

export function jsonLd() {
  const dati = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Morsi',
    alternateName: 'Morsi Burger',
    slogan: 'No fast food ma quality food',
    url: URL_SITO,
    image: 'https://prismalocale.it/assets/img/morsi-og.jpg',
    servesCuisine: ['Smash burger', 'Fried chicken'],
    priceRange: '€€',
    sameAs: [SOCIAL.instagram, SOCIAL.facebook],
    department: ORDINE_SEDI.map((id) => sede(SEDI[id])),
    location: ORDINE_SEDI.map((id) => sede(SEDI[id]).address),
  };
  return `<!-- Dati strutturati: orari, civico di Pineto e telefono di Roseto da confermare con i titolari. -->
<script type="application/ld+json">${JSON.stringify(dati, null, 2)}</script>`;
}
