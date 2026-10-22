import { jsonLd } from '@/lib/seo';
import type { Lingua } from '@/lib/rotte';

export function DatiStrutturati({ lingua }: { lingua: Lingua }) {
  const json = JSON.stringify(jsonLd(lingua)).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
