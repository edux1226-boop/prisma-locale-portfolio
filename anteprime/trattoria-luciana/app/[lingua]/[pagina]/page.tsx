import { notFound } from 'next/navigation';
import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';
import { isLingua, paginaDaSlug, slug, LINGUE, LINGUA_BASE, PAGINE } from '@/lib/rotte';

type Props = { params: Promise<{ lingua: string; pagina: string }> };

export const dynamicParams = false;

/** /en/story/, /de/geschichte/, … con gli indirizzi tradotti. */
export function generateStaticParams() {
  return LINGUE.filter((l) => l !== LINGUA_BASE).flatMap((lingua) =>
    PAGINE.filter((p) => p !== 'home').map((p) => ({ lingua, pagina: slug(lingua, p) })),
  );
}

function risolvi(lingua: string, s: string) {
  if (!isLingua(lingua) || lingua === LINGUA_BASE) return null;
  const pagina = paginaDaSlug(lingua, s);
  return pagina ? { lingua, pagina } : null;
}

export async function generateMetadata({ params }: Props) {
  const p = await params;
  const r = risolvi(p.lingua, p.pagina);
  return r ? metadati(r.lingua, r.pagina) : {};
}

export default async function Pagina({ params }: Props) {
  const p = await params;
  const r = risolvi(p.lingua, p.pagina);
  if (!r) notFound();
  const C = PAGINE_COMPONENTI[r.pagina];
  return <C lingua={r.lingua} />;
}
