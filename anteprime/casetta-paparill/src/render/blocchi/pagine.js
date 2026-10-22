/* Blocchi delle pagine interne: galleria, prenota, chi siamo, contatti,
   eventi privati, lavora con noi, e i moduli. */
import { esc, md, senzaDc, etichettaDc, virgola, foto, grande, slot } from '../utili.js';
import { ico, nuovaScheda, ESTERNO, tel, wa, stelle, testoAlt } from '../parti.js';
import { widgetTheFork } from './comuni.js';

/* Una foto 4:3 dalla cartella delle immagini, con l'alt preso dai testi:
   <!-- @immagine sala/casetta-sera chiSiamo.fotoStoriaAlt [subito] --> */
const MISURE = '(min-width: 64em) 600px, (min-width: 40em) 80vw, 100vw';
function immagine(ctx, arg = '') {
  const [file, chiave, opzione] = arg.split(/\s+/);
  const alt = chiave ? chiave.split('.').reduce((nodo, k) => nodo?.[k], ctx.t) : '';
  if (chiave && typeof alt !== 'string') throw new Error(`[casetta] @immagine: testo "${chiave}" non trovato`);
  const subito = opzione === 'subito';
  return foto(file, { alt, sizes: MISURE, lazy: !subito, priorita: subito, ctx });
}

/* Galleria ---------------------------------------------------------------- */
function galleriaCategorie(ctx) {
  const t = ctx.t.galleriaPagina;
  const cat = ctx.galleria.categorie;
  const schede = cat.map((c, i) => `    <button class="schede__voce" type="button" role="tab" id="scheda-${c.id}" aria-controls="cat-${c.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''} data-scheda="${c.id}">${esc(c.titolo)} <span class="schede__conto">${c.foto.length}</span></button>`).join('\n');
  const pannelli = cat.map((c, ci) => {
    const voci = c.foto.map((f, i) => `      <li class="griglia-foto__voce">
        <button class="griglia-foto__apri" type="button" data-lightbox="${c.id}" data-grande="${grande(f.file)}" data-dida="${esc(f.dida)}" data-alt="${esc(testoAlt(ctx, f.alt))}">
          ${foto(f.file, { alt: f.alt, sizes: '(min-width: 64em) 390px, (min-width: 40em) 48vw, 100vw', lazy: !(ci === 0 && i < 3), priorita: ci === 0 && i === 0, ctx })}
          <span class="griglia-foto__zoom">${ico('ingrandisci')}</span>
        </button>
        <p class="griglia-foto__dida">${esc(f.dida)}</p>
      </li>`).join('\n');
    return `  <section class="galleria__pannello" id="cat-${c.id}" aria-labelledby="cat-${c.id}-titolo" data-pannello="${c.id}">
    <h2 class="galleria__titolo" id="cat-${c.id}-titolo">${esc(c.titolo)} <span class="galleria__conto">${c.foto.length} foto</span></h2>
    <ul class="griglia-foto" role="list">
${voci}
    </ul>
  </section>`;
  }).join('\n');
  return `<div class="galleria" data-galleria>
  <div class="schede" role="tablist" aria-label="${esc(t.schede)}" data-schede>
${schede}
  </div>
${pannelli}
</div>`;
}

/* Prenota ----------------------------------------------------------------- */
function costruttoreWhatsapp(ctx) {
  const t = ctx.t.prenotaPagina.whatsapp;
  const persone = Array.from({ length: 10 }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === 2 ? ' selected' : ''}>${n} ${n === 1 ? 'persona' : 'persone'}</option>`)
    .join('') + '<option value="11">Più di 10</option>';
  const giorni = ctx.r.orari.giorni.map((g) => ({ nome: g.nome, ore: g.fasce.flatMap((f) => slot(f)) }));
  const tutte = [...new Set(giorni.flatMap((g) => g.ore))].sort();
  const ore = tutte.map((o) => `<option>${o}</option>`).join('');
  const iniziale = t.messaggioVuoto.replace('{persone}', '2 persone');
  return `<form class="wa" data-wa novalidate
      data-numero="${ctx.r.whatsapp.numero}"
      data-modello="${esc(t.messaggio)}"
      data-modello-vuoto="${esc(t.messaggioVuoto)}"
      data-chiuso="${esc(t.chiuso)}"
      data-piu="${esc(t.piuDi)}"
      data-orari="${esc(JSON.stringify(giorni))}">
  <div class="wa__campi">
    <div class="campo">
      <label for="wa-persone">${esc(t.persone)}</label>
      <select id="wa-persone" name="persone" data-wa-persone>${persone}</select>
    </div>
    <div class="campo">
      <label for="wa-data">${esc(t.data)}</label>
      <input id="wa-data" name="data" type="date" data-wa-data>
    </div>
    <div class="campo">
      <label for="wa-ora">${esc(t.ora)}</label>
      <select id="wa-ora" name="ora" data-wa-ora><option value="">—</option>${ore}</select>
    </div>
  </div>
  <p class="wa__avviso" role="status" data-wa-avviso></p>
  <div class="wa__anteprima">
    <p class="wa__etichetta">${esc(t.anteprima)}</p>
    <p class="wa__fumetto" data-wa-testo>${esc(iniziale)}</p>
  </div>
  <a class="btn btn--wa btn--grande btn--largo" href="${wa(ctx, iniziale)}" ${ESTERNO} data-wa-link data-posizione="prenota">${ico('whatsapp')}${esc(t.bottone)}${nuovaScheda(ctx)}</a>
</form>`;
}

function prenotaCanali(ctx) {
  const t = ctx.t.prenotaPagina;
  const r = ctx.r;
  return `<div class="canali">
  <section class="canale canale--telefono" aria-labelledby="canale-telefono">
    <span class="canale__icona">${ico('telefono')}</span>
    <h2 class="canale__titolo" id="canale-telefono">${esc(t.telefono.titolo)}</h2>
    <p>${md(t.telefono.testo, ctx)}</p>
    <p class="canale__numero"><a href="${tel(ctx)}" data-posizione="prenota">${esc(r.telefono.visibile)}</a></p>
    <p class="canale__numero canale__numero--piccolo"><a href="${tel(ctx, 'cellulare')}" data-posizione="prenota">${esc(r.cellulare.visibile)}</a></p>
    <a class="btn btn--accento btn--grande btn--largo" href="${tel(ctx)}" data-posizione="prenota">${ico('telefono')}${esc(ctx.t.comuni.chiama)}</a>
  </section>

  <section class="canale canale--whatsapp" aria-labelledby="canale-whatsapp">
    <span class="canale__icona">${ico('whatsapp')}</span>
    <h2 class="canale__titolo" id="canale-whatsapp">${esc(t.whatsapp.titolo)}${r.whatsapp.daConfermare ? etichettaDc(ctx, 'numero da confermare') : ''}</h2>
    <p>${md(t.whatsapp.testo, ctx)}</p>
    ${costruttoreWhatsapp(ctx)}
  </section>

  <section class="canale canale--thefork" aria-labelledby="canale-thefork">
    <span class="canale__icona">${ico('posate')}</span>
    <h2 class="canale__titolo" id="canale-thefork">${esc(t.thefork.titolo)}</h2>
    <p>${md(t.thefork.testo, ctx)}</p>
    ${widgetTheFork(ctx)}
  </section>

  <section class="canale canale--gruppi" aria-labelledby="canale-gruppi">
    <span class="canale__icona">${ico('persone')}</span>
    <h2 class="canale__titolo" id="canale-gruppi">${esc(t.gruppi.titolo)}</h2>
    <p>${md(t.gruppi.testo, ctx)}</p>
    <p class="canale__nota">${md(r.prenotazioni.notaGruppi, ctx)}</p>
    <a class="btn btn--secondario" href="#gruppi">${esc(t.gruppi.link)} ${ico('freccia')}</a>
  </section>
</div>`;
}

/* Contatti ---------------------------------------------------------------- */
function contattiSchede(ctx) {
  const t = ctx.t.contattiPagina;
  const r = ctx.r;
  const ind = r.indirizzo;
  return `<ul class="schede-contatto" role="list">
  <li class="scheda-contatto">
    <span class="scheda-contatto__icona">${ico('posizione')}</span>
    <h2 class="scheda-contatto__titolo">${esc(t.indirizzo)}</h2>
    <address>${esc(r.nomeCompleto)}<br>${esc(ind.via)}<br>${esc(ind.cap)} ${esc(ind.citta)} (${esc(ind.provincia)})</address>
    <a class="link-freccia" href="${esc(r.google.indicazioni)}" ${ESTERNO}>${esc(t.indicazioni)} ${ico('esterno')}${nuovaScheda(ctx)}</a>
  </li>
  <li class="scheda-contatto">
    <span class="scheda-contatto__icona">${ico('telefono')}</span>
    <h2 class="scheda-contatto__titolo">${esc(t.telefono)}</h2>
    <p><a class="link-forte" href="${tel(ctx)}" data-posizione="contatti">${esc(r.telefono.visibile)}</a></p>
  </li>
  <li class="scheda-contatto">
    <span class="scheda-contatto__icona">${ico('whatsapp')}</span>
    <h2 class="scheda-contatto__titolo">${esc(t.cellulare)}${r.whatsapp.daConfermare ? etichettaDc(ctx) : ''}</h2>
    <p><a class="link-forte" href="${tel(ctx, 'cellulare')}" data-posizione="contatti">${esc(r.cellulare.visibile)}</a></p>
    <a class="link-freccia" href="${wa(ctx, ctx.t.sceltaPrenotazione.whatsappMessaggio)}" ${ESTERNO} data-posizione="contatti">WhatsApp ${ico('esterno')}${nuovaScheda(ctx)}</a>
  </li>
  <li class="scheda-contatto">
    <span class="scheda-contatto__icona">${ico('email')}</span>
    <h2 class="scheda-contatto__titolo">${esc(t.email)}</h2>
    <p><a class="link-forte link-forte--lungo" href="mailto:${esc(r.email)}">${esc(r.email)}</a></p>
  </li>
</ul>`;
}

/* La mappa di Google si carica solo su richiesta: prima nessun cookie. */
function mappa(ctx) {
  const t = ctx.t.contattiPagina.mappa;
  const r = ctx.r;
  return `<div class="mappa" data-mappa data-src="${esc(r.google.embed)}" data-titolo="${esc(t.titoloIframe)}">
  <div class="mappa__segnaposto">
    <svg class="mappa__disegno" viewBox="0 0 640 400" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="640" height="400" class="mappa__fondo"/>
      <g class="mappa__isolati">
        <path d="M-10 118 214 80l40 92-226 40Z"/><path d="M276 70 470 36l28 108-196 36Z"/><path d="M520 28l140-22v126l-116 18Z"/>
        <path d="M-10 250 250 206l34 120-292 50Z"/><path d="M308 200 520 164l30 122-214 40Z"/><path d="M572 156l80-12v130l-56 10Z"/>
      </g>
      <g class="mappa__strade">
        <path d="M-20 232 660 116"/><path d="M262 -20 330 420"/><path d="M-20 98 660-14"/><path d="M520 -10 586 420"/>
      </g>
      <path class="mappa__strada-nome" id="mappa-via" d="M60 230 600 138"/>
      <text class="mappa__testo"><textPath href="#mappa-via" startOffset="6%">Via Salara</textPath></text>
    </svg>
    <span class="mappa__segno">${ico('casetta')}</span>
    <div class="mappa__testo-box">
      <p>${md(t.consenso, ctx)}</p>
      <div class="mappa__azioni">
        <button class="btn btn--primario" type="button" data-mappa-carica>${ico('posizione')}${esc(t.carica)}</button>
        <a class="btn btn--secondario" href="${esc(r.google.mappe)}" ${ESTERNO}>${esc(t.apri)} ${ico('esterno')}${nuovaScheda(ctx)}</a>
      </div>
    </div>
  </div>
</div>`;
}

function arrivare(ctx) {
  const t = ctx.t.contattiPagina;
  const a = ctx.r.arrivare;
  const voci = [['auto', t.auto, a.auto], ['treno', t.treno, a.treno], ['autobus', t.autobus, a.autobus], ['parcheggio', t.parcheggio, a.parcheggio]]
    .map(([icona, titolo, testo]) => `  <div class="arrivare__voce"><dt>${ico(icona)}${esc(titolo)}</dt><dd>${md(testo, ctx)}</dd></div>`).join('\n');
  return `<dl class="arrivare">\n${voci}\n</dl>`;
}

function votoFinale(ctx) {
  const ta = ctx.r.tripadvisor;
  const t = ctx.t.contattiPagina.recensioni;
  return `<div class="voto-finale">
  <div class="voto-finale__cifra">
    <p class="voto__cifra"><span aria-hidden="true">${virgola(ta.voto)}</span><span class="sr-only">${virgola(ta.voto)} su 5</span></p>
    ${stelle(ta.voto, { decorative: true, classe: 'stelle stelle--grandi' })}
    <p>${ta.recensioni} recensioni su TripAdvisor</p>
  </div>
  <div class="voto-finale__testo">
    <h2 class="voto-finale__titolo">${esc(t.titolo)}</h2>
    <p>${md(t.testo, ctx)}</p>
    <div class="voto-finale__azioni">
      <a class="btn btn--primario" href="${esc(ta.url)}" ${ESTERNO}>${ico('stella')}${esc(t.link)}${nuovaScheda(ctx)}</a>
      ${ctx.r.thefork.url ? `<a class="btn btn--secondario" href="${esc(ctx.r.thefork.url)}" ${ESTERNO}>${ico('posate')}TheFork${nuovaScheda(ctx)}</a>` : `<span class="badge badge--chiaro">${ico('posate', 'badge__ico')}<span class="badge__testo"><b>TheFork</b><span>Punteggio e link${etichettaDc(ctx, 'da collegare')}</span></span></span>`}
    </div>
  </div>
</div>`;
}

/* Chi siamo --------------------------------------------------------------- */
function filosofia(ctx) {
  const voci = ctx.t.chiSiamo.filosofia.voci.map((v, i) => `  <li class="principio" data-rivela>
    <span class="principio__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <h3 class="principio__titolo">${esc(v.titolo)}</h3>
    <p>${md(v.testo, ctx)}</p>
  </li>`).join('\n');
  return `<ol class="principi" role="list">\n${voci}\n</ol>`;
}

function team(ctx) {
  const t = ctx.t.chiSiamo.team;
  const persone = t.persone.map((p) => {
    const segnaposto = p.nome.includes('[dc]');
    return `  <li class="persona" data-rivela>
    <div class="persona__ritratto" role="img" aria-label="${esc(`${t.fotoInArrivo}: ${senzaDc(p.ruolo)}`)}">
      ${segnaposto ? ico('chef', 'persona__ico') : `<span class="persona__iniziali" aria-hidden="true">${esc(p.iniziali)}</span>`}
      ${ctx.anteprima ? `<span class="persona__nota">${esc(t.fotoInArrivo)}</span>` : ''}
    </div>
    <h3 class="persona__nome">${md(p.nome, ctx)}</h3>
    <p class="persona__ruolo">${esc(p.ruolo)}</p>
    <p class="persona__bio">${md(p.bio, ctx)}</p>
  </li>`;
  }).join('\n');
  return `<ul class="persone" role="list">\n${persone}\n</ul>`;
}

/* Eventi privati ---------------------------------------------------------- */
const ICONE_OCCASIONI = ['torta', 'colomba', 'valigetta', 'calici'];

function eventiOccasioni(ctx) {
  const voci = ctx.t.eventi.occasioni.voci.map((v, i) => `  <li class="carta carta--icona" data-rivela>
    <span class="carta__icona">${ico(ICONE_OCCASIONI[i % ICONE_OCCASIONI.length])}</span>
    <h3 class="carta__titolo">${esc(v.titolo)}</h3>
    <p>${md(v.testo, ctx)}</p>
  </li>`).join('\n');
  return `<ul class="carte carte--quattro" role="list">\n${voci}\n</ul>`;
}

function eventiPassi(ctx) {
  const voci = ctx.t.eventi.passi.voci.map((v, i) => `  <li class="passo" data-rivela>
    <span class="passo__num" aria-hidden="true">${i + 1}</span>
    <h3 class="passo__titolo">${esc(v.titolo)}</h3>
    <p>${md(v.testo, ctx)}</p>
  </li>`).join('\n');
  return `<ol class="passi" role="list">\n${voci}\n</ol>`;
}

const elencoSpunte = (ctx, voci) => `<ul class="spunte" role="list">\n${voci.map((v) => `  <li>${ico('spunta')}<span>${md(v, ctx)}</span></li>`).join('\n')}\n</ul>`;

/* Lavora con noi ---------------------------------------------------------- */
const ICONE_RUOLI = ['posate', 'chef', 'piatto'];

function lavoraRuoli(ctx) {
  const t = ctx.t.lavora.ruoli;
  const voci = t.voci.map((v, i) => `  <li class="carta carta--icona" data-rivela>
    <span class="carta__icona">${ico(ICONE_RUOLI[i % ICONE_RUOLI.length])}</span>
    <h3 class="carta__titolo">${esc(v.titolo)}</h3>
    <p>${md(v.testo, ctx)}</p>
  </li>`).join('\n');
  return `<ul class="carte carte--tre" role="list">\n${voci}\n</ul>\n<p class="nota-piccola">${md(t.nota, ctx)}</p>`;
}

/* Moduli ------------------------------------------------------------------ */
function campo(id, etichetta, controllo, { obbligatorio = false, aiuto = '', errore = '', classe = '' } = {}) {
  return `<div class="campo${classe ? ` ${classe}` : ''}">
      <label for="${id}">${etichetta}${obbligatorio ? ' <span class="campo__obbl" aria-hidden="true">*</span>' : ''}</label>
      ${controllo}
      ${aiuto ? `<p class="campo__aiuto" id="${id}-aiuto">${aiuto}</p>` : ''}
      ${errore ? `<p class="campo__errore" id="${id}-errore" data-errore hidden>${errore}</p>` : ''}
    </div>`;
}

function modulo(ctx, tipo = 'eventi') {
  const m = ctx.t.moduli;
  const e = m.errori;
  const lavoro = tipo === 'lavoro';
  const p = lavoro ? 'cv' : 'ev';
  const nomeModulo = lavoro ? 'candidature' : 'eventi';
  const online = !ctx.anteprima;
  const attributi = online
    ? ` name="${nomeModulo}" method="POST" data-netlify="true" netlify-honeypot="bot-field"${lavoro ? ' enctype="multipart/form-data"' : ''}`
    : '';
  const facoltativo = ` <small>(${esc(m.facoltativo)})</small>`;

  const comuniCampi = [
    campo(`${p}-nome`, esc(m.nome), `<input id="${p}-nome" name="nome" type="text" autocomplete="name" required data-regola="nome">`, { obbligatorio: true, errore: esc(e.nome) }),
    campo(`${p}-email`, esc(m.email), `<input id="${p}-email" name="email" type="email" autocomplete="email" required data-regola="email">`, { obbligatorio: true, errore: esc(e.email), classe: 'campo--meta' }),
    campo(`${p}-telefono`, esc(m.telefono), `<input id="${p}-telefono" name="telefono" type="tel" autocomplete="tel" inputmode="tel" required data-regola="telefono">`, { obbligatorio: true, errore: esc(e.telefono), classe: 'campo--meta' }),
  ];

  const specifici = lavoro
    ? [
      campo(`${p}-ruolo`, esc(m.ruolo), `<select id="${p}-ruolo" name="ruolo">${m.ruoli.map((x) => `<option>${esc(x)}</option>`).join('')}</select>`, { classe: 'campo--meta' }),
      `<fieldset class="scelte campo--meta">
      <legend>${esc(m.disponibilita)}</legend>
      ${m.disponibilitaVoci.map((x, i) => `<label><input type="radio" name="disponibilita" value="${esc(x)}"${i === 0 ? ' checked' : ''}><span>${esc(x)}</span></label>`).join('\n      ')}
    </fieldset>`,
      campo(`${p}-cv`, `${esc(m.cv)}${facoltativo}`, `<input id="${p}-cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-describedby="${p}-cv-aiuto" data-regola="cv">`, { aiuto: esc(m.cvAiuto), errore: esc(e.cv) }),
    ]
    : [
      campo(`${p}-tipo`, esc(m.tipo), `<select id="${p}-tipo" name="tipo">${m.tipi.map((x) => `<option>${esc(x)}</option>`).join('')}</select>`, { classe: 'campo--meta' }),
      campo(`${p}-ospiti`, esc(m.ospiti), `<input id="${p}-ospiti" name="ospiti" type="number" inputmode="numeric" min="1" max="300" required data-regola="ospiti">`, { obbligatorio: true, errore: esc(e.ospiti), classe: 'campo--meta' }),
      campo(`${p}-data`, `${esc(m.data)}${facoltativo}`, `<input id="${p}-data" name="data" type="date" data-regola="data">`, { errore: esc(e.data), classe: 'campo--meta' }),
    ];

  const aiuto = lavoro ? m.messaggioAiutoLavoro : m.messaggioAiuto;
  const messaggio = campo(`${p}-messaggio`, `${esc(m.messaggio)}${facoltativo}`, `<textarea id="${p}-messaggio" name="messaggio" rows="4" aria-describedby="${p}-messaggio-aiuto"></textarea>`, { aiuto: esc(aiuto) });

  return `<form class="modulo" data-modulo novalidate${attributi}>
    ${online ? `<input type="hidden" name="form-name" value="${nomeModulo}">\n    <p hidden><label>Non compilare: <input name="bot-field"></label></p>` : ''}
    <p class="modulo__legenda"><span aria-hidden="true">*</span> campi obbligatori</p>
    ${comuniCampi.join('\n    ')}
    ${specifici.join('\n    ')}
    ${messaggio}
    <div class="consenso">
      <label><input id="${p}-privacy" type="checkbox" name="privacy" required data-regola="privacy"><span>${esc(lavoro ? m.privacyCandidatura : m.privacy)}${etichettaDc(ctx, 'informativa da collegare')}</span></label>
      <p class="campo__errore" id="${p}-privacy-errore" data-errore hidden>${esc(e.privacy)}</p>
    </div>
    <div class="modulo__piede">
      <button class="btn btn--accento btn--grande" type="submit">${esc(lavoro ? m.inviaCandidatura : m.invia)} ${ico('freccia')}</button>
      ${ctx.anteprima ? `<p class="modulo__nota">${esc(m.notaAnteprima)}</p>` : ''}
    </div>
    <div class="modulo__grazie" role="status" tabindex="-1" data-modulo-grazie hidden>
      <p class="modulo__grazie-titolo" data-modello="${esc(m.grazie)}"></p>
      <p>${esc(m.grazieTesto)}</p>
    </div>
  </form>`;
}

export const pagine = {
  immagine,
  'galleria-categorie': galleriaCategorie,
  'prenota-canali': prenotaCanali,
  'contatti-schede': contattiSchede,
  mappa,
  arrivare,
  'voto-finale': votoFinale,
  filosofia,
  team,
  'eventi-occasioni': eventiOccasioni,
  'eventi-passi': eventiPassi,
  'eventi-dettagli': (ctx) => elencoSpunte(ctx, ctx.t.eventi.dettagli.voci),
  'lavora-ruoli': lavoraRuoli,
  modulo,
};
