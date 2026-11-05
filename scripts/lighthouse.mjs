// Lighthouse su pagine chiave, mobile e desktop. Richiede `npm run preview` attivo e Chrome (CHROME_PATH).
// Esce con errore se una categoria scende sotto la soglia.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const min = { performance: 0.95, accessibility: 1, 'best-practices': 1, seo: 1 };
mkdirSync('lighthouse-reports', { recursive: true });
let failed = false;
for (const path of ['/', '/menu/', '/allergeni/']) {
  for (const preset of ['mobile', 'desktop']) {
    const out = `lighthouse-reports/${path.replaceAll('/', '_') || 'home'}-${preset}.json`;
    const args = ['--yes', 'lighthouse@12', base + path, '--only-categories=performance,accessibility,best-practices,seo',
      '--chrome-flags=--headless=new --no-sandbox', '--output=json', `--output-path=${out}`, '--quiet'];
    if (preset === 'desktop') args.push('--preset=desktop');
    execFileSync('npx', args, { stdio: 'ignore', shell: process.platform === 'win32' });
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const line = Object.entries(min).map(([k, t]) => { const s = r.categories[k].score; if (s < t) failed = true; return `${k}:${Math.round(s * 100)}`; });
    console.log(path, preset, line.join(' '), 'LCP', r.audits['largest-contentful-paint'].displayValue, 'CLS', r.audits['cumulative-layout-shift'].displayValue);
  }
}
process.exit(failed ? 1 : 0);
