import { u } from '../data/url';

const paths = ['/', '/menu/', '/allergeni/', '/privacy/'].map(u);

export function GET({ site }: { site?: URL }) {
  const base = site ?? new URL('https://www.grillburger.it');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
