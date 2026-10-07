/* Rigenera le tavole provvisorie e il fermo immagine del mare in AVIF e
   WebP, nelle misure dichiarate in content/media.json, più l'immagine per
   le anteprime social e l'icona. Quando arrivano le foto vere: si mettono
   i file in public/media con lo stesso nome e in media.json la voce passa
   a "foto" e "confirmed".

   Uso:   node scripts/tavole/render.ts [solo-questi-id…] [--prova]
          --prova: misure piccole, PNG nella cartella indicata da $PROVA

   Richiede Playwright (con Chromium) e ffmpeg con libwebp e libaom. */

import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SCENE, type NomeScena } from './scene.ts';
import { pagina, type Uniformi } from './tela.ts';

type Variante = { file: string; larghezze: number[]; larghezza: number; altezza: number };
type Voce = { id: string; tipo: string; orizzontale?: Variante; verticale?: Variante };

let chromium: typeof import('playwright').chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const radice = fileURLToPath(new URL('../../', import.meta.url));
const pubblico = join(radice, 'public');
const args = process.argv.slice(2);
const prova = args.includes('--prova');
const solo = args.filter((a) => !a.startsWith('--'));
const cartellaProva = process.env.PROVA ?? tmpdir();

/* Quale scena dipinge ogni voce del CMS, e come si compone per orientamento. */
const REGIA: Record<string, { scena: NomeScena; o: Uniformi; v: Uniformi }> = {
  'mare-hero': {
    scena: 'mare',
    o: { uTempo: 12, uAvvicina: 0, uPuntatore: [0, 0], uLuce: 1, uGrana: 0.03 },
    v: { uTempo: 12, uAvvicina: 0, uPuntatore: [0, 0], uLuce: 1, uGrana: 0.03 },
  },
  roseto: { scena: 'roseto', o: { uTempo: 7, uOriz: 0.4, uCx: 0, uGrana: 0.035 }, v: { uTempo: 7, uOriz: 0.42, uCx: -0.12, uGrana: 0.035 } },
  paranza: { scena: 'paranza', o: { uTempo: 4, uOriz: 0.44, uCx: 0.02, uGrana: 0.035 }, v: { uTempo: 4, uOriz: 0.44, uCx: 0.2, uGrana: 0.035 } },
  lungomare: { scena: 'lungomare', o: { uTempo: 3, uOriz: 0.46, uCx: 0.05, uGrana: 0.04 }, v: { uTempo: 3, uOriz: 0.46, uCx: 0.0, uGrana: 0.04 } },
  pergola: { scena: 'pergola', o: { uTempo: 0, uOriz: 0.5, uCx: 0, uGrana: 0.03 }, v: { uTempo: 0, uOriz: 0.5, uCx: 0.06, uGrana: 0.03 } },
  notte: { scena: 'notte', o: { uTempo: 20, uOriz: 0.56, uCx: 0, uGrana: 0.035 }, v: { uTempo: 20, uOriz: 0.52, uCx: 0.32, uGrana: 0.035 } },
  orizzonte: { scena: 'orizzonte', o: { uTempo: 9, uOriz: 0.56, uCx: 0, uGrana: 0.03 }, v: { uTempo: 9, uOriz: 0.5, uCx: 0, uGrana: 0.03 } },
};

const ff = (a: string[]) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);
const media = JSON.parse(await readFile(join(radice, 'content/media.json'), 'utf8')) as { voci: Voce[] };
const tmp = await mkdtemp(join(tmpdir(), 'luciana-'));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pagina]', e.message));

/* Una pagina nuova per ogni tavola: niente stato condiviso tra un dipinto e l'altro. */
async function dipingi(scena: NomeScena, w: number, h: number, u: Uniformi, png: string) {
  const tela = await browser.newPage({ viewport: { width: w, height: h } });
  tela.on('pageerror', (e) => console.error(`[${scena}]`, e.message));
  await tela.setContent(pagina(SCENE[scena], w, h, u));
  await tela.waitForFunction('window.pronto === true', null, { timeout: 600_000 });
  await tela.locator('canvas').screenshot({ path: png });
  await tela.close();
}

for (const voce of media.voci) {
  const regia = REGIA[voce.id];
  if (!regia || voce.tipo === 'foto' || (solo.length && !solo.includes(voce.id))) continue;
  for (const [variante, u] of [[voce.orizzontale, regia.o], [voce.verticale, regia.v]] as const) {
    if (!variante) continue;
    const scala = prova ? 0.35 : 1;
    const w = Math.round(variante.larghezza * scala);
    const h = Math.round(variante.altezza * scala);
    const png = prova ? join(cartellaProva, `${variante.file}.png`) : join(tmp, `${variante.file}.png`);
    await dipingi(regia.scena, w, h, u, png);
    if (prova) { console.log('·', png); continue; }
    for (const l of variante.larghezze) {
      const dest = join(pubblico, 'media', `${variante.file}-${l}`);
      const filtro = ['-vf', `scale=${l}:-2:flags=lanczos`];
      ff(['-i', png, ...filtro, '-c:v', 'libwebp', '-quality', '80', `${dest}.webp`]);
      ff(['-i', png, ...filtro, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '6', '-pix_fmt', 'yuv420p', `${dest}.avif`]);
      console.log('✓', `${variante.file}-${l}`);
    }
    if (voce.id === 'mare-hero' && variante === voce.orizzontale) await writeFile(join(tmp, 'og-fondo.png'), await readFile(png));
  }
}

/* L'immagine per le anteprime social: il mare dell'apertura con il nome. */
if (!prova && (!solo.length || solo.includes('og'))) {
  const fondoPng = join(tmp, 'og-fondo.png');
  let fondo: Buffer;
  try { fondo = await readFile(fondoPng); } catch {
    await dipingi('mare', 2560, 1440, REGIA['mare-hero'].o, fondoPng);
    fondo = await readFile(fondoPng);
  }
  const font = async (f: string) => (await readFile(join(radice, 'assets/fonts', f))).toString('base64');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:S;src:url(data:font/woff2;base64,${await font('instrument-serif.woff2')})}
  @font-face{font-family:S;font-style:italic;src:url(data:font/woff2;base64,${await font('instrument-serif-italic.woff2')})}
  @font-face{font-family:N;src:url(data:font/woff2;base64,${await font('instrument-sans.woff2')});font-weight:400 700}
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#071B22}
  .f{position:absolute;inset:0;background:url(data:image/png;base64,${fondo.toString('base64')}) center 40%/cover}
  .v{position:absolute;inset:0;background:radial-gradient(60% 60% at 50% 50%,rgba(7,27,34,.35),transparent 70%),linear-gradient(180deg,rgba(7,27,34,.5),transparent 35%,transparent 60%,rgba(7,27,34,.6))}
  .t{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;text-align:center;color:#FAF7F0;font-family:S}
  .a{font-size:40px;letter-spacing:.34em;margin-right:-.34em;text-transform:uppercase}
  .b{font-size:150px;line-height:.86;letter-spacing:.04em;text-transform:uppercase}
  .c{margin-top:22px;font-style:italic;font-size:38px;color:#D8C8AD}
  .d{position:absolute;bottom:34px;left:0;right:0;text-align:center;font-family:N;font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:#B49A6A}
  </style></head><body><div class="f"></div><div class="v"></div>
  <div class="t"><div class="a">Trattoria</div><div class="b">Luciana</div><div class="c">Dal mare, alla tavola.</div></div>
  <div class="d">Roseto degli Abruzzi · Lungomare Trieste 60</div></body></html>`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const png = join(tmp, 'og.png');
  await page.screenshot({ path: png });
  ff(['-i', png, '-q:v', '3', join(pubblico, 'media', 'og.jpg')]);
  console.log('✓ og.jpg');

  // l'icona per i telefoni, dallo stesso SVG del sito
  const svg = await readFile(join(pubblico, 'icona.svg'), 'utf8');
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', '<svg width="180" height="180" ')}</body></html>`);
  await page.screenshot({ path: join(pubblico, 'apple-touch-icon.png'), clip: { x: 0, y: 0, width: 180, height: 180 } });
  console.log('✓ apple-touch-icon.png');
}

await browser.close();
await rm(tmp, { recursive: true, force: true });
