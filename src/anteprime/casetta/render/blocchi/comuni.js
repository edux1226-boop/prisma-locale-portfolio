/* Blocchi presenti in tutte le pagine: testa, testata, piede, barra mobile,
   finestre di prenotazione e d'uscita, avvisi dell'anteprima. */
import { esc, md, senzaDc, etichettaDc, fascia, ePranzo, orariRaggruppati } from '../utili.js';
import {
  ico, nuovaScheda, ESTERNO, tel, wa, logo, corrente, maiuscola, allergeniUsati, stelle,
} from '../parti.js';
import { sprite } from '../icone.js';
import { scriptJsonld } from '../jsonld.js';

const PDF = 'menu-casetta-paparill.pdf';
export const urlPdf = (ctx) => `${ctx.base}${PDF}`;

function testa(ctx) {
  const seo = ctx.t.seo[ctx.pagina];
  const titolo = esc(senzaDc(seo.titolo));
  const descr = esc(senzaDc(seo.descrizione));
  const b = ctx.base;
  let robots = '';
  if (ctx.anteprima) robots = 'noindex, nofollow';
  else if (ctx.pagina === '404') robots = 'noindex';
  const avvio = ctx.anteprima
    ? `(function (d) {
    var r = d.documentElement;
    var m = d.querySelector('meta[name="anteprima-scadenza"]');
    var fine = m ? Date.parse(m.content) : NaN;
    if (fine && Date.now() > fine) { r.classList.add('is-scaduta'); return; }
    r.classList.add('js');
  })(document);`
    : 'document.documentElement.classList.add(\'js\');';

  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${titolo}</title>`,
    `<meta name="description" content="${descr}">`,
    robots && `<meta name="robots" content="${robots}">`,
    !ctx.anteprima && ctx.pagina !== '404' && `<link rel="canonical" href="${ctx.assoluto(ctx.pagina)}">`,
    `<meta name="theme-color" content="${ctx.sito.coloreTema}">`,
    '<meta name="color-scheme" content="light">',
    ctx.anteprima && `<!-- Scadenza dell'anteprima: si cambia in src/anteprime/casetta/contenuti/sito.json -->\n<meta name="anteprima-scadenza" content="${ctx.sito.scadenza}">`,
    '',
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="it_IT">',
    `<meta property="og:site_name" content="${esc(ctx.r.nome)}">`,
    `<meta property="og:title" content="${titolo}">`,
    `<meta property="og:description" content="${descr}">`,
    `<meta property="og:image" content="${ctx.dominioImmagini}${ctx.sito.immagineSocial}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    !ctx.anteprima && `<meta property="og:url" content="${ctx.assoluto(ctx.pagina)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    '',
    `<link rel="icon" href="${b}favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="${b}favicon-32.png" sizes="32x32" type="image/png">`,
    `<link rel="apple-touch-icon" href="${b}apple-touch-icon.png">`,
    `<link rel="manifest" href="${b}manifest.webmanifest">`,
    '<link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/assets/fonts/playfair-display.woff2" as="font" type="font/woff2" crossorigin>',
    '',
    `<script>\n  ${avvio}\n</script>`,
  ].filter((riga) => riga !== false && riga != null).join('\n');
}

function scaduta(ctx) {
  const pl = ctx.sito.prismaLocale;
  const testo = encodeURIComponent('Ciao Prisma Locale, l\'anteprima della Casetta di Paparill è scaduta.');
  return `<!-- Mostrato solo dopo la data di scadenza (vedi lo script nella testa). -->
<div class="scaduta">
  ${ico('casetta', 'scaduta__marchio')}
  <h1 class="scaduta__titolo">${esc(ctx.t.anteprima.scaduta)}</h1>
  <p class="scaduta__link">
    <a href="https://wa.me/${pl.whatsapp}?text=${testo}" rel="noopener">WhatsApp</a>
    <span aria-hidden="true">·</span>
    <a href="mailto:${pl.email}">${pl.email}</a>
  </p>
</div>`;
}

function inizio(ctx) {
  const parti = [
    `<a class="salta" href="#contenuto">${esc(ctx.t.testata.salta)}</a>`,
    sprite(allergeniUsati(ctx)),
  ];
  if (ctx.anteprima) parti.push(scaduta(ctx), '<div class="filigrana" aria-hidden="true"></div>');
  return parti.join('\n');
}

const voceNav = (ctx, id) => `<li><a href="${ctx.url(id)}"${corrente(ctx, id)}>${esc(ctx.sito.pagine[id].voce)}</a></li>`;

function testata(ctx) {
  const t = ctx.t;
  const voci = ctx.sito.navigazione.map((id) => `        ${voceNav(ctx, id)}`).join('\n');
  const vociMobile = ['home', ...ctx.sito.navigazione, 'prenota']
    .map((id) => `      ${voceNav(ctx, id)}`).join('\n');
  return `<header class="testata" data-testata>
  <div class="testata__barra contenitore">
    ${logo(ctx)}
    <nav class="testata__nav" aria-label="Principale">
      <ul role="list">
${voci}
      </ul>
    </nav>
    <a class="btn btn--accento testata__prenota" href="${ctx.url('prenota')}"${corrente(ctx, 'prenota')} data-prenota="testata">${ico('calendario')}${esc(t.comuni.prenota)}</a>
    <button class="testata__apri" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="menu-mobile" data-menu-apri>
      ${ico('menu')}<span>${esc(t.testata.apriMenu)}</span>
    </button>
  </div>
</header>

<dialog class="menu-mobile" id="menu-mobile" aria-label="Menu del sito" data-menu-mobile>
  <div class="menu-mobile__testa">
    ${logo(ctx, { decorativo: true })}
    <button class="menu-mobile__chiudi" type="button" data-menu-chiudi>${esc(t.testata.chiudiMenu)} ${ico('chiudi')}</button>
  </div>
  <nav class="menu-mobile__nav" aria-label="Principale">
    <ul role="list">
${vociMobile}
    </ul>
  </nav>
  <div class="menu-mobile__piede">
    <a class="btn btn--accento btn--largo" href="${ctx.url('prenota')}" data-prenota="menu-mobile">${ico('calendario')}${esc(t.comuni.prenota)}</a>
    <div class="menu-mobile__contatti">
      <a class="btn btn--secondario" href="${tel(ctx)}" data-posizione="menu-mobile">${ico('telefono')}${esc(t.comuni.chiama)}</a>
      <a class="btn btn--secondario" href="${wa(ctx, t.sceltaPrenotazione.whatsappMessaggio)}" ${ESTERNO} data-posizione="menu-mobile">${ico('whatsapp')}${esc(t.comuni.whatsapp)}${nuovaScheda(ctx)}</a>
    </div>
    <p class="menu-mobile__indirizzo">${ico('posizione')}${esc(ctx.r.indirizzo.via)}, ${esc(ctx.r.indirizzo.citta)}</p>
  </div>
</dialog>`;
}

function briciole(ctx) {
  return `<nav class="briciole" aria-label="Percorso">
  <ol role="list">
    <li><a href="${ctx.url('home')}">Home</a></li>
    <li><span aria-current="page">${esc(ctx.sito.pagine[ctx.pagina].voce)}</span></li>
  </ol>
</nav>`;
}

/* Orari in breve: "lun–mar, gio–sab · 19:00–23:00". */
export function orariBreve(ctx, classe = 'orari-breve') {
  const t = ctx.t.comuni;
  const righe = orariRaggruppati(ctx.r.orari.giorni).map((g) => {
    const quando = g.fasce.length
      ? g.fasce.map((f) => `<span class="orari-breve__fascia"><span class="orari-breve__pasto">${ePranzo(f) ? t.pranzo : t.cena}</span> ${fascia(f)}</span>`).join(' ')
      : `<span class="orari-breve__chiuso">${esc(t.chiuso)}</span>`;
    return `  <li><span class="orari-breve__giorni">${esc(maiuscola(g.giorni))}</span> ${quando}</li>`;
  }).join('\n');
  return `<ul class="${classe}" role="list">\n${righe}\n</ul>`;
}

/* Tabella degli orari, giorno per giorno; lo script segna "oggi". */
function orariTabella(ctx) {
  const t = ctx.t.comuni;
  const righe = ctx.r.orari.giorni.map((g, i) => {
    const pranzo = g.fasce.filter(ePranzo).map(fascia).join(', ');
    const cena = g.fasce.filter((f) => !ePranzo(f)).map(fascia).join(', ');
    const celle = g.fasce.length
      ? `<td>${pranzo || '<span class="orari__no">—</span>'}</td><td>${cena || '<span class="orari__no">—</span>'}</td>`
      : `<td colspan="2" class="orari__chiuso">${esc(t.chiuso)}</td>`;
    return `      <tr data-giorno="${(i + 1) % 7}"><th scope="row">${esc(maiuscola(g.nome))}</th>${celle}</tr>`;
  }).join('\n');
  return `<table class="orari">
  <caption>${esc(ctx.t.prenotaPagina.info.orari)}${ctx.r.orari.daConfermare ? etichettaDc(ctx) : ''}</caption>
  <thead>
    <tr><th scope="col"><span class="sr-only">Giorno</span></th><th scope="col">${esc(t.pranzo)}</th><th scope="col">${esc(t.cena)}</th></tr>
  </thead>
  <tbody data-orari>
${righe}
  </tbody>
</table>
<p class="orari__nota">${md(ctx.r.orari.nota, ctx)}</p>`;
}

/* La fascia "Prenota": in fondo a quasi tutte le pagine. Con "widget",
   accanto ai pulsanti compare il calendario di TheFork. */
export function widgetTheFork(ctx) {
  const tf = ctx.r.thefork;
  const t = ctx.t.prenotaPagina.thefork;
  if (tf.widget) {
    return `<iframe class="thefork thefork--widget" src="${esc(tf.widget)}" title="${esc(t.titolo)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  const link = tf.url
    ? `<a class="btn btn--secondario" href="${esc(tf.url)}" ${ESTERNO} data-prenota="thefork">${esc(t.link)}${ico('esterno')}${nuovaScheda(ctx)}</a>`
    : '';
  if (!ctx.anteprima) return link;
  // Solo nell'anteprima: un calendario finto mostra dove andrà il widget vero.
  const oggi = new Date();
  const giorni = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + i + 1);
    const chiuso = ctx.r.orari.giorni[(d.getDay() + 6) % 7].fasce.length === 0;
    const nome = d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
    return `<li class="${i === 1 ? 'is-scelto' : ''}${chiuso ? ' is-chiuso' : ''}"><span>${nome}</span><b>${d.getDate()}</b></li>`;
  }).join('');
  const ore = ['19:30', '20:00', '20:30', '21:00', '21:30'].map((o, i) => `<li${i === 2 ? ' class="is-scelto"' : ''}>${o}</li>`).join('');
  return `<div class="thefork thefork--segnaposto" id="thefork">
  <p class="thefork__marchio">${ico('posate')}<span>TheFork</span></p>
  <p class="thefork__testo">${esc(t.segnaposto)}</p>
  <div class="thefork__finto" aria-hidden="true">
    <p class="thefork__riga"><span>2 persone</span><span>${ico('calendario')}</span></p>
    <ul class="thefork__giorni">${giorni}</ul>
    <ul class="thefork__ore">${ore}</ul>
  </div>
  <p class="thefork__nota">${esc(t.segnapostoNota)}${etichettaDc(ctx, 'da collegare')}</p>
  ${link}
</div>`;
}

function bottoneTheFork(ctx, posizione) {
  const tf = ctx.r.thefork;
  if (tf.url) {
    return `<a class="btn btn--chiaro" href="${esc(tf.url)}" ${ESTERNO} data-prenota="thefork" data-posizione="${posizione}">${ico('posate')}${esc(ctx.t.comuni.thefork)}${nuovaScheda(ctx)}</a>`;
  }
  return `<a class="btn btn--chiaro" href="${ctx.url('prenota')}#thefork" data-prenota="thefork" data-posizione="${posizione}">${ico('posate')}${esc(ctx.t.comuni.thefork)}</a>`;
}

function prenotaFascia(ctx, arg) {
  const conWidget = arg === 'widget';
  const testi = ctx.pagina === 'menu'
    ? { titolo: ctx.t.menuPagina.prenotaTitolo, testo: ctx.t.menuPagina.prenotaTesto }
    : ctx.t.home.prenota;
  const c = ctx.t.comuni;
  return `<section class="fascia-prenota${conWidget ? ' fascia-prenota--widget' : ''}" aria-labelledby="fascia-prenota-titolo">
  <div class="contenitore fascia-prenota__griglia">
    <div class="fascia-prenota__testo">
      <h2 class="fascia-prenota__titolo" id="fascia-prenota-titolo">${md(testi.titolo, ctx)}</h2>
      <p>${md(testi.testo, ctx)}</p>
      <div class="fascia-prenota__azioni">
        <a class="btn btn--accento btn--grande" href="${tel(ctx)}" data-posizione="fascia">${ico('telefono')}${esc(c.chiama)} <span class="btn__extra">${esc(ctx.r.telefono.visibile)}</span></a>
        <a class="btn btn--chiaro btn--grande" href="${wa(ctx, ctx.t.sceltaPrenotazione.whatsappMessaggio)}" ${ESTERNO} data-posizione="fascia">${ico('whatsapp')}${esc(c.whatsapp)}${nuovaScheda(ctx)}</a>
        ${conWidget ? '' : bottoneTheFork(ctx, 'fascia')}
      </div>
      <p class="fascia-prenota__nota">${ico('orologio')}<span>${md(ctx.r.prenotazioni.tempoRisposta, ctx)}</span></p>
    </div>
${conWidget ? `    <div class="fascia-prenota__widget">\n${widgetTheFork(ctx)}\n    </div>` : ''}
  </div>
</section>`;
}

function piede(ctx) {
  const t = ctx.t.piede;
  const r = ctx.r;
  const ind = r.indirizzo;
  const link = ctx.sito.piede.map((id) => `        ${voceNav(ctx, id)}`).join('\n');
  const social = [
    r.social.facebook && `<li><a href="${esc(r.social.facebook)}" ${ESTERNO}>${ico('facebook')}${esc(t.facebook)}${nuovaScheda(ctx)}</a></li>`,
    r.social.instagram
      ? `<li><a href="${esc(r.social.instagram)}" ${ESTERNO}>${ico('instagram')}${esc(t.instagram)}${nuovaScheda(ctx)}</a></li>`
      : `<li><span class="piede__spento">${ico('instagram')}${esc(t.instagram)} <small>${esc(t.instagramPresto)}</small></span></li>`,
    `<li><a href="${esc(r.tripadvisor.url)}" ${ESTERNO}>${ico('stella')}TripAdvisor${nuovaScheda(ctx)}</a></li>`,
  ].filter(Boolean).join('\n        ');
  const pl = ctx.sito.prismaLocale;
  const legali = ctx.anteprima
    ? `<span>${esc(t.privacy)}</span> · <span>${esc(t.cookie)}</span>${etichettaDc(ctx, 'da collegare')}`
    : `<a href="${ctx.base}privacy/">${esc(t.privacy)}</a> · <a href="${ctx.base}cookie/">${esc(t.cookie)}</a>`;
  return `<footer class="piede">
  <div class="contenitore piede__griglia">
    <div class="piede__marchio">
      ${logo(ctx, { chiaro: true })}
      <p class="piede__motto">${md(t.motto, ctx)}</p>
      <address class="piede__indirizzo">
        <a href="${esc(r.google.indicazioni)}" ${ESTERNO}>${ico('posizione')}<span>${esc(ind.via)}<br>${esc(ind.cap)} ${esc(ind.citta)} (${esc(ind.provincia)})</span>${nuovaScheda(ctx)}</a>
      </address>
    </div>
    <div class="piede__colonna">
      <h2 class="piede__titolo">${esc(t.orari)}${r.orari.daConfermare ? etichettaDc(ctx) : ''}</h2>
      ${orariBreve(ctx, 'orari-breve orari-breve--piede')}
    </div>
    <div class="piede__colonna">
      <h2 class="piede__titolo">${esc(t.contatti)}</h2>
      <ul class="piede__contatti" role="list">
        <li><a href="${tel(ctx)}" data-posizione="piede">${ico('telefono')}${esc(r.telefono.visibile)}</a></li>
        <li><a href="${tel(ctx, 'cellulare')}" data-posizione="piede">${ico('telefono')}${esc(r.cellulare.visibile)}</a></li>
        <li><a href="mailto:${esc(r.email)}">${ico('email')}${esc(r.email)}</a></li>
      </ul>
    </div>
    <nav class="piede__colonna" aria-labelledby="piede-sito">
      <h2 class="piede__titolo" id="piede-sito">${esc(t.sito)}</h2>
      <ul class="piede__link" role="list">
${link}
      </ul>
    </nav>
    <div class="piede__colonna">
      <h2 class="piede__titolo">${esc(t.seguici)}</h2>
      <ul class="piede__social" role="list">
        ${social}
      </ul>
    </div>
  </div>
  <div class="contenitore piede__base">
    <p>© ${new Date().getFullYear()} ${esc(r.nomeCompleto)} · ${esc(t.piva)} ${md(r.legale.partitaIva, ctx)}</p>
    <p>${legali}</p>
    <p>${esc(ctx.anteprima ? t.creditoAnteprima : t.credito)} <a href="${pl.sito}">${esc(pl.nome)}</a></p>
  </div>
</footer>`;
}

function barra(ctx) {
  const t = ctx.t.barra;
  return `<nav class="barra" aria-label="${esc(t.etichetta)}" data-barra>
  <a class="barra__voce" href="${tel(ctx)}" data-posizione="barra">${ico('telefono')}<span>${esc(t.chiama)}</span></a>
  <a class="barra__voce" href="${wa(ctx, ctx.t.sceltaPrenotazione.whatsappMessaggio)}" ${ESTERNO} data-posizione="barra">${ico('whatsapp')}<span>${esc(t.whatsapp)}</span>${nuovaScheda(ctx)}</a>
  <a class="barra__voce barra__voce--prenota" href="${ctx.url('prenota')}"${corrente(ctx, 'prenota')} data-prenota="barra">${ico('calendario')}<span>${esc(t.prenota)}</span></a>
</nav>`;
}

/* "Prenota un tavolo": su ogni pulsante di prenotazione si apre la scelta
   del canale. Senza script il link porta alla pagina Prenota. */
function sceltaPrenotazione(ctx) {
  const t = ctx.t.sceltaPrenotazione;
  const tf = ctx.r.thefork;
  const theforkHref = tf.url ? `href="${esc(tf.url)}" ${ESTERNO}` : `href="${ctx.url('prenota')}#thefork"`;
  return `<dialog class="scelta" aria-labelledby="scelta-titolo" data-scelta>
  <div class="scelta__foglio">
    <div class="scelta__testa">
      <h2 class="scelta__titolo" id="scelta-titolo">${esc(t.titolo)}</h2>
      <button class="scelta__chiudi" type="button" data-scelta-chiudi><span class="sr-only">Chiudi</span>${ico('chiudi')}</button>
    </div>
    <p class="scelta__intro">${esc(t.intro)}</p>
    <ul class="scelta__opzioni" role="list">
      <li><a class="opzione opzione--accento" href="${tel(ctx)}" data-posizione="scelta">${ico('telefono')}<span><b>${esc(t.telefono)}</b><small>${esc(ctx.r.telefono.visibile)}</small></span></a></li>
      <li><a class="opzione" href="${wa(ctx, t.whatsappMessaggio)}" ${ESTERNO} data-posizione="scelta">${ico('whatsapp')}<span><b>${esc(t.whatsapp)}</b><small>${esc(ctx.r.whatsapp.visibile)}</small></span>${nuovaScheda(ctx)}</a></li>
      <li><a class="opzione" ${theforkHref} data-prenota="thefork" data-posizione="scelta">${ico('posate')}<span><b>${esc(t.thefork)}</b><small>Disponibilità in tempo reale</small></span>${tf.url ? nuovaScheda(ctx) : ''}</a></li>
      <li><a class="opzione opzione--leggera" href="${ctx.url('prenota')}#gruppi">${ico('persone')}<span><b>${esc(t.gruppi)}</b></span></a></li>
    </ul>
    <a class="scelta__tutte" href="${ctx.url('prenota')}">${esc(t.tutte)} ${ico('freccia')}</a>
  </div>
</dialog>`;
}

/* Popup d'uscita, solo desktop: lo apre lo script, una volta per sessione. */
function uscita(ctx) {
  if (['prenota', '404'].includes(ctx.pagina)) return '';
  const t = ctx.t.uscita;
  return `<dialog class="uscita" aria-labelledby="uscita-titolo" data-uscita>
  <div class="uscita__foglio">
    <button class="uscita__chiudi" type="button" data-uscita-chiudi><span class="sr-only">Chiudi</span>${ico('chiudi')}</button>
    <span class="uscita__icona">${ico('ricette')}</span>
    <h2 class="uscita__titolo" id="uscita-titolo">${esc(t.titolo)}</h2>
    <p>${md(t.testo, ctx)}</p>
    <div class="uscita__azioni">
      <a class="btn btn--primario" href="${urlPdf(ctx)}" download data-traccia="menu_pdf" data-posizione="uscita">${ico('scarica')}${esc(t.pdf)}</a>
      <a class="btn btn--secondario" href="${ctx.url('prenota')}" data-prenota="uscita">${esc(t.prenota)}</a>
    </div>
    <button class="uscita__no" type="button" data-uscita-chiudi>${esc(t.chiudi)}</button>
  </div>
</dialog>`;
}

/* Il banner dei cookie esiste solo se c'è un ID di Google Analytics. */
function cookie(ctx) {
  if (!ctx.sito.ga4) return '';
  const t = ctx.t.cookie;
  return `<section class="cookie" aria-label="Cookie" data-cookie data-ga4="${esc(ctx.sito.ga4)}" hidden>
  <p>${md(t.testo, ctx)} <a href="${ctx.base}cookie/">${esc(t.link)}</a></p>
  <div class="cookie__azioni">
    <button class="btn btn--secondario" type="button" data-cookie-scelta="no">${esc(t.rifiuta)}</button>
    <button class="btn btn--primario" type="button" data-cookie-scelta="si">${esc(t.accetta)}</button>
  </div>
</section>`;
}

function avvisoAnteprima(ctx) {
  const t = ctx.t.anteprima;
  return `<p class="anteprima" role="note"><span class="anteprima__punto" aria-hidden="true"></span>${esc(t.avviso)}<span class="anteprima__extra"> · ${esc(t.avvisoExtra)}</span> · <a href="${ctx.url('home')}#nota">Prisma Locale</a></p>`;
}

function fine(ctx) {
  return [
    barra(ctx),
    sceltaPrenotazione(ctx),
    uscita(ctx),
    cookie(ctx),
    ctx.anteprima ? avvisoAnteprima(ctx) : '',
  ].filter(Boolean).join('\n\n');
}

/* La nota di Prisma Locale per i titolari: solo nell'anteprima, in home. */
function nota(ctx) {
  if (!ctx.anteprima) return '';
  const t = ctx.t.anteprima.nota;
  const pl = ctx.sito.prismaLocale;
  const voci = t.voci.map((v) => `      <li><label><input type="checkbox" value="${esc(v.id)}"><span class="lista__voce"><b>${esc(v.titolo)}</b><span>${esc(v.testo)}</span></span></label></li>`).join('\n');
  const firma = t.firma.replace('{scadenza}', ctx.sito.scadenzaLeggibile);
  return `<!-- Solo per l'anteprima: la nota di Prisma Locale ai titolari. -->
<aside class="nota" id="nota" aria-labelledby="nota-titolo" tabindex="-1">
  <div class="nota__foglio contenitore">
    <p class="occhiello">${esc(t.etichetta)}</p>
    <h2 class="nota__titolo" id="nota-titolo">${esc(t.titolo)}</h2>
    <p class="nota__intro">${esc(t.intro)}</p>
    <ul class="lista" role="list" data-lista data-messaggio="${esc(t.messaggio)}" data-messaggio-pronti="${esc(t.messaggioPronti)}" data-wa="${pl.whatsapp}">
${voci}
    </ul>
    <div class="nota__piede">
      <p class="nota__conto" aria-live="polite"><span data-conto>0</span> ${esc(t.di)} ${t.voci.length} ${esc(t.conto)}</p>
      <a class="btn btn--primario" href="https://wa.me/${pl.whatsapp}?text=${encodeURIComponent(t.messaggio)}" ${ESTERNO} data-invia>${ico('whatsapp')}${esc(t.rispondi)}<span class="sr-only"> su WhatsApp ${esc(ctx.t.comuni.nuovaScheda)}</span></a>
      <p class="nota__mail">${esc(t.oppure)} <a href="mailto:${pl.email}?subject=${encodeURIComponent('La Casetta di Paparill, materiale per il sito')}">${pl.email}</a></p>
    </div>
    <p class="nota__firma">${esc(firma)}</p>
  </div>
</aside>`;
}

/* Il visore delle foto: uno per pagina, riempito dallo script. */
function lightbox(ctx) {
  const t = ctx.t.galleriaPagina;
  return `<dialog class="lightbox" aria-label="${esc(t.apri)}" data-lightbox-finestra>
  <figure class="lightbox__figura" data-lightbox-figura>
    <figcaption class="lightbox__dida" data-lightbox-dida></figcaption>
  </figure>
  <p class="lightbox__conto" aria-live="polite" data-lightbox-conto></p>
  <button class="lightbox__btn lightbox__btn--prec" type="button" data-lightbox-prec><span class="sr-only">${esc(t.precedente)}</span>${ico('prec')}</button>
  <button class="lightbox__btn lightbox__btn--succ" type="button" data-lightbox-succ><span class="sr-only">${esc(t.successiva)}</span>${ico('succ')}</button>
  <button class="lightbox__chiudi" type="button" data-lightbox-chiudi>${esc(t.chiudi)} ${ico('chiudi')}</button>
</dialog>`;
}

/* Un avviso visibile solo nell'anteprima; l'argomento è il percorso del
   testo dentro testi.json (es. <!-- @avviso menuPagina.notaAnteprima -->). */
function avviso(ctx, percorso) {
  if (!ctx.anteprima) return '';
  const testo = percorso.split('.').reduce((nodo, parte) => nodo?.[parte], ctx.t);
  if (typeof testo !== 'string') throw new Error(`[casetta] @avviso: testo "${percorso}" non trovato`);
  return `<p class="avviso-demo">${ico('info')}<span>${md(testo, ctx)}</span></p>`;
}

export const comuni = {
  testa,
  avviso,
  jsonld: scriptJsonld,
  inizio,
  testata,
  briciole,
  'prenota-fascia': prenotaFascia,
  'orari-breve': (ctx) => orariBreve(ctx),
  'orari-tabella': orariTabella,
  piede,
  fine,
  nota,
  lightbox,
  stelle: (ctx, voto) => stelle(Number(voto)),
};
