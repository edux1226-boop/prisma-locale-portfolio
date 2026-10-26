import { CONTATTI } from '../data/menu.js';

/* JSON-LD pronto per quando il sito sarà pubblico. Orari e CAP sono "da confermare"; l'URL è provvisorio. */
const URL_SITO = 'https://prismalocale.it/anteprime/lord-nelson/';

export function jsonLd() {
  const dati = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: 'Lord Nelson',
    description: 'Birreria e paninoteca a Scerne di Pineto: birra alla spina, hamburger e panini regionali.',
    url: URL_SITO,
    image: 'https://prismalocale.it/assets/img/lord-nelson-og.jpg',
    servesCuisine: ['Panini', 'Hamburger', 'Birra'],
    priceRange: '€€',
    telephone: '+393488226928',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTATTI.via,
      postalCode: CONTATTI.cap,
      addressLocality: CONTATTI.citta,
      addressRegion: CONTATTI.provincia,
      addressCountry: 'IT',
    },
    // DA CONFERMARE con i titolari: orari e giorno di chiusura. Segnaposto serale, non reale.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '19:00',
        closes: '24:00',
      },
    ],
  };
  return `<!-- Dati strutturati: orari (segnaposto) e CAP da confermare con i titolari. -->
<script type="application/ld+json">${JSON.stringify(dati, null, 2)}</script>`;
}
