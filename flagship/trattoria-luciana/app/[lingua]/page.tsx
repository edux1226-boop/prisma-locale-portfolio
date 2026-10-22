import { notFound } from 'next/navigation';
import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';
import { isLingua, LINGUA_BASE } from '@/lib/rotte';

type Props = { params: Promise<{ lingua: string }> };

export async function generateMetadata({ params }: Props) {
  const { lingua } = await params;
  return isLingua(lingua) ? metadati(lingua, 'home') : {};
}

export default async function Pagina({ params }: Props) {
  const { lingua } = await params;
  if (!isLingua(lingua) || lingua === LINGUA_BASE) notFound();
  const C = PAGINE_COMPONENTI.home;
  return <C lingua={lingua} />;
}
