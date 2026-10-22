import type { MetadataRoute } from 'next';
import { LINGUE, PAGINE, percorso } from '@/lib/rotte';
import { urlSito } from '@/lib/seo';

export const dynamic = 'force-static';

/** Tutte le pagine in tutte le lingue, ognuna con le sue alternative. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSito();
  if (!base) return [];
  return PAGINE.flatMap((pagina) =>
    LINGUE.map((lingua) => ({
      url: `${base}${percorso(lingua, pagina)}`,
      changeFrequency: pagina === 'menu' ? 'weekly' : 'monthly',
      priority: pagina === 'home' ? 1 : pagina === 'prenota' || pagina === 'menu' ? 0.8 : 0.6,
      alternates: { languages: Object.fromEntries(LINGUE.map((l) => [l, `${base}${percorso(l, pagina)}`])) },
    })),
  );
}
