/* Dati strutturati schema.org (JSON-LD) per ogni pagina: il ristorante,
   il sito, la pagina, le briciole e, nella pagina del menu, il menu intero.

   Niente aggregateRating con i voti di TripAdvisor: Google non accetta in
   pagina valutazioni raccolte su altri siti né recensioni "su se stessi"
   per attività locali, e mostrarle esporrebbe a un'azione manuale. */
import { senzaDc } from './utili.js';

const DIETE = { vegetariano: 'https://schema.org/VegetarianDiet', senzaGlutine: 'https://schema.org/GlutenFreeDiet' };

function orariSchema(giorni) {
  const gruppi = new Map();
  for (const g of giorni) {
    for (const [da, a] of g.fasce) {
      const chiave = `${da}-${a}`;
      if (!gruppi.has(chiave)) gruppi.set(chiave, { opens: da, closes: a, giorni: [] });
      gruppi.get(chiave).giorni.push(`https://schema.org/${g.schema}`);
    }
  }
  return [...gruppi.values()].map(({ opens, closes, giorni: dayOfWeek }) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek, opens, closes,
  }));
}

function ristorante(ctx) {
  const { r } = ctx;
  const id = `${ctx.dominio}/#ristorante`;
  const sameAs = [r.tripadvisor?.url, r.thefork?.url, r.social?.facebook, r.social?.instagram].filter(Boolean);
  return {
    '@type': 'Restaurant',
    '@id': id,
    name: r.nome,
    alternateName: r.nomeCompleto,
    description: senzaDc(r.descrizione),
    url: ctx.assoluto('home'),
    telephone: r.telefono.numero,
    email: r.email,
    image: [
      `${ctx.dominioImmagini}/assets/img/casetta/hero-2048.webp`,
      `${ctx.dominioImmagini}/assets/img/casetta/piatti/chitarra-pallottine-1200.webp`,
      `${ctx.dominioImmagini}/assets/img/casetta/piatti/arrosticini-1200.webp`,
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.indirizzo.via,
      postalCode: r.indirizzo.cap,
      addressLocality: r.indirizzo.citta,
      addressRegion: r.indirizzo.provincia,
      addressCountry: r.indirizzo.paese,
    },
    ...(r.coordinate ? { geo: { '@type': 'GeoCoordinates', latitude: r.coordinate.lat, longitude: r.coordinate.lng } } : {}),
    servesCuisine: r.cucina,
    priceRange: r.fasciaPrezzo,
    openingHoursSpecification: orariSchema(r.orari.giorni),
    hasMenu: ctx.assoluto('menu'),
    acceptsReservations: ctx.assoluto('prenota'),
    founder: { '@type': 'Person', name: r.titolare },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function menu(ctx) {
  const voce = (p) => ({
    '@type': 'MenuItem',
    name: p.nome,
    description: senzaDc(p.descrizione),
    offers: { '@type': 'Offer', price: String(p.prezzo), priceCurrency: 'EUR' },
    ...(p.foto ? { image: `${ctx.dominioImmagini}/assets/img/casetta/piatti/${p.foto}-1200.webp` } : {}),
    ...((p.vegetariano || p.senzaGlutine) ? {
      suitableForDiet: [p.vegetariano && DIETE.vegetariano, p.senzaGlutine && DIETE.senzaGlutine].filter(Boolean),
    } : {}),
  });
  const sezioni = ctx.menu.sezioni.map((s) => ({
    '@type': 'MenuSection', name: s.titolo, description: senzaDc(s.intro), hasMenuItem: s.piatti.map(voce),
  }));
  const d = ctx.menu.degustazioni;
  sezioni.push({
    '@type': 'MenuSection',
    name: d.titolo,
    description: senzaDc(d.intro),
    hasMenuItem: d.menu.map((m) => ({
      '@type': 'MenuItem',
      name: `${m.nome} (${m.portate} portate)`,
      description: m.piatti.join(', '),
      offers: { '@type': 'Offer', price: String(m.prezzo), priceCurrency: 'EUR' },
    })),
  });
  return {
    '@type': 'Menu',
    '@id': `${ctx.assoluto('menu')}#menu`,
    name: `Menu · ${ctx.r.nome}`,
    url: ctx.assoluto('menu'),
    inLanguage: 'it-IT',
    hasMenuSection: sezioni,
  };
}

const TIPI_PAGINA = {
  'chi-siamo': 'AboutPage',
  contatti: 'ContactPage',
  galleria: 'CollectionPage',
};

export function jsonld(ctx) {
  const { pagina } = ctx;
  const seo = ctx.t.seo[pagina];
  const url = ctx.assoluto(pagina);
  const grafo = [ristorante(ctx), {
    '@type': 'WebSite',
    '@id': `${ctx.dominio}/#sito`,
    url: ctx.assoluto('home'),
    name: ctx.r.nome,
    inLanguage: 'it-IT',
    publisher: { '@id': `${ctx.dominio}/#ristorante` },
  }];

  if (pagina === '404') return grafo;

  const pagNodo = {
    '@type': TIPI_PAGINA[pagina] ?? 'WebPage',
    '@id': `${url}#pagina`,
    url,
    name: senzaDc(seo.titolo),
    description: senzaDc(seo.descrizione),
    inLanguage: 'it-IT',
    isPartOf: { '@id': `${ctx.dominio}/#sito` },
    about: { '@id': `${ctx.dominio}/#ristorante` },
  };
  grafo.push(pagNodo);

  if (pagina !== 'home') {
    pagNodo.breadcrumb = { '@id': `${url}#briciole` };
    grafo.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#briciole`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: ctx.assoluto('home') },
        { '@type': 'ListItem', position: 2, name: ctx.sito.pagine[pagina].voce, item: url },
      ],
    });
  }
  if (pagina === 'menu') {
    const m = menu(ctx);
    pagNodo.mainEntity = { '@id': m['@id'] };
    grafo.push(m);
  }
  return grafo;
}

export function scriptJsonld(ctx) {
  const dati = { '@context': 'https://schema.org', '@graph': jsonld(ctx) };
  // "<" negli script spezzerebbe il tag: lo si scrive come escape unicode.
  const testo = JSON.stringify(dati, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${testo}\n</script>`;
}
