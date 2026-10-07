import type { MetadataRoute } from 'next';
import { ANTEPRIMA } from '@/lib/sito';
import { urlSito } from '@/lib/seo';

export const dynamic = 'force-static';

/** L'anteprima non si indicizza; la produzione sì, con la sua sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (ANTEPRIMA) return { rules: { userAgent: '*', disallow: '/' } };
  const base = urlSito();
  return { rules: { userAgent: '*', allow: '/' }, sitemap: base ? `${base}/sitemap.xml` : undefined };
}
