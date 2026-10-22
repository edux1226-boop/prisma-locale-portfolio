import { notFound } from 'next/navigation';
import { Radice } from '@/components/struttura/Radice';
import { isLingua, LINGUE, LINGUA_BASE } from '@/lib/rotte';

/* Radice di inglese e tedesco: /en/…, /de/… */
export const dynamicParams = false;

export function generateStaticParams() {
  return LINGUE.filter((l) => l !== LINGUA_BASE).map((lingua) => ({ lingua }));
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lingua: string }> }) {
  const { lingua } = await params;
  if (!isLingua(lingua) || lingua === LINGUA_BASE) notFound();
  return <Radice lingua={lingua}>{children}</Radice>;
}

export { viewport } from '@/lib/viewport';
