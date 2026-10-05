/* Blocchi della homepage. */
import { esc, md, senzaDc, etichettaDc, virgola, foto, grande } from '../utili.js';
import {
  ico, nuovaScheda, ESTERNO, tel, stelle, piattiPerId, fotoPerFile, testoAlt, prezzo,
} from '../parti.js';
import { orariBreve } from './comuni.js';

const HERO = '/assets/img/casetta/hero';

function precaricaHero() {
  return `<link rel="preload" as="image" type="image/avif" media="(max-aspect-ratio: 4/5)" imagesrcset="${HERO}-v-720.avif 720w, ${HERO}-v-1080.avif 1080w" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="image" type="image/avif" media="(min-aspect-ratio: 4/5)" imagesrcset="${HERO}-1280.avif 1280w, ${HERO}-2048.avif 2048w" imagesizes="100vw" fetchpriority="high">`;
}

function heroFoto(ctx) {
  return `<picture class="hero__foto">
    <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcset="${HERO}-v-720.avif 720w, ${HERO}-v-1080.avif 1080w" sizes="100vw">
    <source media="(max-aspect-ratio: 4/5)" type="image/webp" srcset="${HERO}-v-720.webp 720w, ${HERO}-v-1080.webp 1080w" sizes="100vw">
    <source type="image/avif" srcset="${HERO}-1280.avif 1280w, ${HERO}-2048.avif 2048w" sizes="100vw">
    <img src="${HERO}-1280.webp" srcset="${HERO}-1280.webp 1280w, ${HERO}-2048.webp 2048w" sizes="100vw"
         width="2048" height="1152" fetchpriority="high" decoding="async"
         alt="${esc(testoAlt(ctx, ctx.t.home.hero.fotoAlt))}">
  </picture>`;
}

/* Il titolo con il test A/B: la variante si sceglie prima del primo disegno
   (script in linea subito dopo il titolo), quindi niente salti. */
function heroTitolo(ctx) {
  const [primo, ...altre] = ctx.t.home.hero.titoli;
  const varianti = Object.fromEntries(altre.map((v) => [v.id, senzaDc(v.testo)]));
  return `<h1 class="hero__titolo" id="hero-titolo" data-ab-varianti="${esc(JSON.stringify(varianti))}">${md(primo.testo, ctx)}</h1>
    <script>
      /* Test A/B del titolo: una variante per visitatore, ricordata sul
         dispositivo; ?titolo=b nell'indirizzo forza una variante. */
      (function () {
        var h = document.getElementById('hero-titolo');
        var v = JSON.parse(h.getAttribute('data-ab-varianti'));
        var ids = ['${primo.id}'].concat(Object.keys(v));
        var k = 'casetta-ab-titolo';
        var s = (location.search.match(/[?&]titolo=([a-z])/) || [])[1];
        try { s = s || localStorage.getItem(k); } catch (e) {}
        if (ids.indexOf(s) < 0) s = ids[Math.floor(Math.random() * ids.length)];
        try { localStorage.setItem(k, s); } catch (e) {}
        if (v[s]) h.textContent = v[s];
        document.documentElement.setAttribute('data-ab-titolo', s);
      })();
    </script>`;
}

function heroVoto(ctx) {
  const ta = ctx.r.tripadvisor;
  return `<p class="hero__voto">${stelle(ta.voto, { decorative: true })}<span><strong>${virgola(ta.voto)} su 5</strong> · ${ta.recensioni} ${esc(ctx.t.home.hero.sottotitolo)}</span></p>`;
}

function heroBadge(ctx) {
  const voci = ctx.t.home.hero.badge.map((b) => {
    const url = b.link === 'tripadvisor' ? ctx.r.tripadvisor.url : ctx.r.thefork.url;
    const interno = `${ico(b.icona, 'badge__ico')}<span class="badge__testo"><b>${esc(b.marchio)}</b><span>${md(b.testo, ctx)}</span></span>`;
    return url
      ? `<li><a class="badge" href="${esc(url)}" ${ESTERNO}>${interno}${nuovaScheda(ctx)}</a></li>`
      : `<li><span class="badge">${interno}</span></li>`;
  }).join('\n      ');
  return `<ul class="hero__badge" role="list">
      ${voci}
    </ul>`;
}

function percheCarte(ctx) {
  const carte = ctx.t.home.perche.carte.map((c) => `  <li class="carta carta--icona" data-rivela>
    <span class="carta__icona">${ico(c.icona)}</span>
    <h3 class="carta__titolo">${md(c.titolo, ctx)}</h3>
    <p>${md(c.testo, ctx)}</p>
  </li>`).join('\n');
  return `<ul class="carte carte--tre" role="list">\n${carte}\n</ul>`;
}

function piattiScelti(ctx) {
  const tutti = piattiPerId(ctx);
  const t = ctx.t.menuPagina;
  const carte = ctx.t.home.piatti.scelti.map((id) => {
    const p = tutti.get(id);
    if (!p) throw new Error(`[casetta] piatto "${id}" non trovato nel menu (testi.home.piatti.scelti)`);
    return `  <li class="carta carta--piatto" data-rivela>
    ${foto(`piatti/${p.foto}`, { alt: p.fotoAlt, sizes: '(min-width: 72em) 400px, (min-width: 40em) 60vw, 130vw', classe: 'carta__foto', ctx })}
    <div class="carta__corpo">
      ${p.consigliato ? `<p class="tag tag--chef">${ico('chef')}${esc(t.consigliato)}</p>` : ''}
      <h3 class="carta__titolo"><a class="carta__link" href="${ctx.url('menu')}#piatto-${p.id}">${esc(p.nome)}</a></h3>
      <p class="carta__testo">${md(p.descrizione, ctx)}</p>
      <p class="carta__prezzo">${prezzo(p.prezzo)}</p>
    </div>
  </li>`;
  }).join('\n');
  return `<ul class="carte carte--piatti" role="list">\n${carte}\n</ul>`;
}

function galleriaHome(ctx) {
  const tutte = fotoPerFile(ctx);
  const voci = ctx.galleria.home.map((file) => {
    const f = tutte.get(file);
    if (!f) throw new Error(`[casetta] foto "${file}" non trovata in galleria.json`);
    return `  <li class="mosaico__voce">
    <button class="mosaico__apri" type="button" data-lightbox="home" data-grande="${grande(f.file)}" data-dida="${esc(f.dida)}" data-alt="${esc(testoAlt(ctx, f.alt))}">
      ${foto(f.file, { alt: f.alt, sizes: '(min-width: 72em) 380px, (min-width: 48em) 33vw, 50vw', ctx })}
      <span class="mosaico__dida">${esc(f.dida)}</span>
    </button>
  </li>`;
  }).join('\n');
  return `<ul class="mosaico" role="list">\n${voci}\n</ul>`;
}

function recensioni(ctx) {
  const ta = ctx.r.tripadvisor;
  const t = ctx.t.recensioniWidget;
  if (ta.widget) return `<div class="recensioni-widget">${ta.widget}</div>`;
  const voci = ctx.recensioni.voci.map((v) => `  <li class="recensione" data-rivela>
    <figure>
      ${stelle(v.voto)}
      <blockquote>
        <p class="recensione__titolo">${esc(v.titolo)}</p>
        <p>«${md(v.testo, ctx)}»</p>
      </blockquote>
      <figcaption>${ctx.recensioni.esempio ? `${esc(t.esempio)}${etichettaDc(ctx, 'da sostituire')}` : esc(v.autore)}</figcaption>
    </figure>
  </li>`).join('\n');
  return `<div class="voto">
  <p class="voto__cifra"><span aria-hidden="true">${virgola(ta.voto)}</span><span class="sr-only">${virgola(ta.voto)} ${esc(t.su)}</span></p>
  ${stelle(ta.voto, { decorative: true, classe: 'stelle stelle--grandi' })}
  <p class="voto__testo">${ta.recensioni} recensioni su TripAdvisor</p>
  <a class="voto__link" href="${esc(ta.url)}" ${ESTERNO}>${esc(ctx.t.home.recensioni.link)} ${ico('esterno')}${nuovaScheda(ctx)}</a>
</div>
${ctx.anteprima && ctx.recensioni.esempio ? `<p class="avviso-demo">${ico('info')}<span>${esc(t.notaAnteprima)}</span></p>` : ''}
<ul class="recensioni" role="list">
${voci}
</ul>`;
}

function doveBreve(ctx) {
  const r = ctx.r;
  const ind = r.indirizzo;
  return `<div class="dove-breve">
  <div class="dove-breve__blocco">
    <h3 class="dove-breve__titolo">${ico('posizione')}${esc(ind.via)}</h3>
    <p>${esc(ind.cap)} ${esc(ind.citta)} (${esc(ind.provincia)})</p>
    <a class="link-freccia" href="${esc(r.google.indicazioni)}" ${ESTERNO}>Indicazioni stradali ${ico('esterno')}${nuovaScheda(ctx)}</a>
  </div>
  <div class="dove-breve__blocco">
    <h3 class="dove-breve__titolo">${ico('orologio')}${esc(ctx.t.dove.orariTitolo)}${r.orari.daConfermare ? etichettaDc(ctx) : ''}</h3>
    ${orariBreve(ctx)}
  </div>
  <div class="dove-breve__blocco">
    <h3 class="dove-breve__titolo">${ico('telefono')}${esc(ctx.t.dove.contattiTitolo)}</h3>
    <p><a class="link-forte" href="${tel(ctx)}" data-posizione="dove">${esc(r.telefono.visibile)}</a></p>
    <p><a class="link-forte" href="${tel(ctx, 'cellulare')}" data-posizione="dove">${esc(r.cellulare.visibile)}</a></p>
  </div>
</div>`;
}

export const home = {
  'precarica-hero': precaricaHero,
  'hero-foto': heroFoto,
  'hero-titolo': heroTitolo,
  'hero-voto': heroVoto,
  'hero-badge': heroBadge,
  'perche-carte': percheCarte,
  'piatti-scelti': piattiScelti,
  'galleria-home': galleriaHome,
  recensioni,
  'dove-breve': doveBreve,
};
