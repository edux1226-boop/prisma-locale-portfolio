/* Ornamenti e illustrazioni a linea, tutti inline: niente file in più, colore da `currentColor`.
   Sono ornamenti d'epoca (ancora, bussola, bandiere), non copie del personaggio del logo. */

const base = (attr, vb, inner) =>
  `<svg ${attr} viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;

export const ancora = (attr = 'class="orn"') =>
  base(attr, '0 0 48 56', '<circle cx="24" cy="8" r="5"/><path d="M24 13v37M14 21h20M8 38c2 8 8 12 16 12s14-4 16-12M3 41l5-4 4 6M45 41l-5-4-4 6"/>');

export const bussola = (attr = 'class="orn"') =>
  base(
    attr,
    '0 0 64 64',
    '<circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="19" stroke-dasharray="1.5 4"/><path d="M32 4l4 24 24 4-24 4-4 24-4-24-24-4 24-4Z"/><path d="M13 13l13 13M51 13L38 26M13 51l13-13M51 51L38 38" stroke-width="1"/><circle cx="32" cy="32" r="2.4"/>',
  );

/* Il boccale della spillatura. La birra è un gruppo (`data-birra`) clippato sul vetro: si muove
   solo in `transform`. Senza movimento il gruppo resta a livello pieno. */
export const boccale = () => `<svg class="boccale" viewBox="0 -24 220 294" role="img" aria-label="Un boccale di birra che si riempie mentre si scorre il menu">
  <defs>
    <clipPath id="vetro"><rect x="34" y="-22" width="112" height="250" rx="8"/></clipPath>
    <linearGradient id="birra-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F0BE52"/><stop offset=".55" stop-color="#E2AC3E"/><stop offset="1" stop-color="#B56325"/>
    </linearGradient>
    <linearGradient id="luce-g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".14"/>
    </linearGradient>
  </defs>
  <path d="M146 70h22a22 22 0 0 1 22 22v62a22 22 0 0 1-22 22h-22" stroke="#B99A4F" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>
  <rect x="34" y="46" width="112" height="182" rx="8" fill="#1a1210"/>
  <g clip-path="url(#vetro)">
    <g data-birra class="boccale__birra">
      <rect x="30" y="40" width="120" height="260" fill="url(#birra-g)"/>
      <g fill="#FFE9A8" opacity=".5"><circle cx="58" cy="120" r="2"/><circle cx="92" cy="170" r="2.4"/><circle cx="120" cy="100" r="1.8"/><circle cx="74" cy="206" r="2"/><circle cx="126" cy="190" r="2.2"/></g>
      <g fill="#F4EDDE">
        <rect x="30" y="26" width="120" height="18"/>
        <circle cx="46" cy="28" r="11"/><circle cx="70" cy="22" r="13"/><circle cx="96" cy="24" r="14"/><circle cx="122" cy="22" r="13"/><circle cx="142" cy="28" r="10"/>
      </g>
      <path d="M30 44q15 8 30 0t30 0 30 0 30 0" stroke="#d9c9a0" stroke-width="2" fill="none"/>
    </g>
    <rect x="34" y="46" width="112" height="182" fill="url(#luce-g)"/>
  </g>
  <rect x="34" y="46" width="112" height="182" rx="8" stroke="#F4EDDE" stroke-opacity=".7" stroke-width="3" fill="none"/>
  <path d="M30 46h120" stroke="#F4EDDE" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <path d="M30 228h120v10a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z" fill="#2A1711" stroke="#B99A4F" stroke-width="2"/>
</svg>`;

/* Spina cromata (per le schede delle birre). */
export const spina = (colore, n) => {
  const c = { ambra: '#E2AC3E', oro: '#F0D27A', scura: '#6b3a1c' }[colore] ?? '#E2AC3E';
  return `<svg class="spina" viewBox="0 0 60 120" aria-hidden="true" focusable="false">
  <defs><linearGradient id="cromo-${n}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6C6A67"/><stop offset=".35" stop-color="#E4DFD2"/><stop offset=".7" stop-color="#B2A997"/><stop offset="1" stop-color="#5a5855"/></linearGradient></defs>
  <rect x="22" y="2" width="16" height="30" rx="3" fill="${c}" stroke="#0B0A0C" stroke-width="1.5"/>
  <rect x="10" y="30" width="40" height="22" rx="6" fill="url(#cromo-${n})"/>
  <rect x="26" y="50" width="8" height="38" fill="url(#cromo-${n})"/>
  <path d="M20 88h20l-4 14H24Z" fill="url(#cromo-${n})"/>
  <rect x="24" y="102" width="12" height="4" fill="#0B0A0C" opacity=".5"/>
</svg>`;
};

/* Bandiere dei Big: gonfaloni a coda di rondine con un simbolo a linea oro.
   Idee grafiche (non bandiere ufficiali), da confermare con i titolari. */
const EMBLEMI = {
  americano:
    '<rect x="26" y="20" width="26" height="22"/><g fill="currentColor" stroke="none"><circle cx="33" cy="26" r="1.3"/><circle cx="39" cy="26" r="1.3"/><circle cx="45" cy="26" r="1.3"/><circle cx="36" cy="32" r="1.3"/><circle cx="42" cy="32" r="1.3"/><circle cx="33" cy="38" r="1.3"/><circle cx="39" cy="38" r="1.3"/><circle cx="45" cy="38" r="1.3"/></g><path d="M56 26h30M56 34h26M30 49h54M30 57h50M30 65h40"/>',
  campano: '<path d="M24 68l22-38 8 8 8-8 26 38"/><path d="M52 26c-4-5 2-8-1-13"/><circle cx="82" cy="30" r="6"/><path d="M30 68h56"/>',
  norcino: '<path d="M40 38q16-18 32 0Z"/><path d="M44 40q0 22 12 28 12-6 12-28M56 22v-6M48 30l-3 4M64 30l3 4"/>',
  ligure: '<path d="M51 20h6v21h31v6H57v21h-6V47H26v-6h25Z"/>',
  piemontese: '<path d="M36 22h40v24q0 16-20 22-20-6-20-22Z"/><path d="M56 28v34M40 42h32"/>',
  veneto: '<path d="M56 68V36q0-14 14-12 12 2 10 12"/><path d="M56 46H42M56 54H42M56 62H42"/><path d="M30 68h52" />',
};

export const bandiera = (id, attr = 'class="bandiera"') =>
  base(
    attr,
    '0 0 120 150',
    `<path d="M14 6v140" stroke-width="2.2"/><circle cx="14" cy="5" r="3" fill="currentColor"/><path d="M14 14h94L92 44l16 30H14Z" class="bandiera__telo"/>${EMBLEMI[id] ?? ''}`,
  );

/* Mappa schematica (non in scala): il mare a est, la ferrovia, la strada e il locale. */
export const mappa = () => `<svg class="mappa__svg" viewBox="0 0 560 340" role="img" aria-label="Mappa schematica: via Volturno 107 a Scerne di Pineto, con il mare a est. Non in scala.">
  <rect width="560" height="340" fill="#15110f"/>
  <path d="M430 0h130v340H430q22-60-6-110t0-120Q440 50 430 0Z" fill="#1d2a30"/>
  <g stroke="#3d5560" stroke-width="1.4" fill="none" opacity=".8"><path d="M452 60q12-6 24 0t24 0t24 0M462 120q12-6 24 0t24 0M450 190q12-6 24 0t24 0t24 0M466 260q12-6 24 0t24 0"/></g>
  <text x="512" y="164" fill="#7e98a3" font-family="Oswald, sans-serif" font-size="13" letter-spacing="3" text-anchor="middle" transform="rotate(90 512 164)">MARE ADRIATICO</text>
  <path d="M385 0q-6 170 8 340" stroke="#6b5a3c" stroke-width="2.4" stroke-dasharray="9 6" fill="none"/>
  <text x="372" y="322" fill="#8c7a55" font-family="Oswald, sans-serif" font-size="11" letter-spacing="2" transform="rotate(-90 372 322)">FERROVIA</text>
  <path d="M250 0q10 170 0 340" stroke="#4a3a2a" stroke-width="12" fill="none"/>
  <path d="M250 0q10 170 0 340" stroke="#B99A4F" stroke-width="1" stroke-dasharray="14 10" fill="none" opacity=".7"/>
  <text x="232" y="64" fill="#8c7a55" font-family="Oswald, sans-serif" font-size="11" letter-spacing="2" text-anchor="end" transform="rotate(-90 232 64)">SS16</text>
  <path d="M40 190h210M250 190h135" stroke="#3b2d22" stroke-width="9" fill="none"/>
  <path d="M40 190h345" stroke="#B99A4F" stroke-width="1" stroke-dasharray="6 7" fill="none" opacity=".6"/>
  <path d="M120 40v300M80 250h170M300 90h85M300 250h85" stroke="#2a2019" stroke-width="5" fill="none"/>
  <text x="48" y="176" fill="#c9b27a" font-family="Oswald, sans-serif" font-size="13" letter-spacing="2.4">VIA VOLTURNO</text>
  <g transform="translate(205 190)">
    <circle r="22" fill="#E2AC3E" opacity=".16"/><circle r="13" fill="#E2AC3E" opacity=".28"/>
    <path d="M0-26c-9 0-15 6-15 14 0 10 15 26 15 26s15-16 15-26c0-8-6-14-15-14Z" fill="#E2AC3E" stroke="#0B0A0C" stroke-width="2"/><circle cy="-12" r="5" fill="#0B0A0C"/>
  </g>
  <g transform="translate(60 60)" stroke="#B99A4F" fill="none" stroke-width="1.4"><circle r="20"/><path d="M0-16l4 14 12 2-12 2-4 14-4-14-12-2 12-2Z"/></g>
  <text x="60" y="34" fill="#B99A4F" font-family="Oswald, sans-serif" font-size="12" text-anchor="middle">N</text>
</svg>`;
