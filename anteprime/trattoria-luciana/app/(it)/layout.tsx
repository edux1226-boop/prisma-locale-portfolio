import { Radice } from '@/components/struttura/Radice';

/* Radice italiana: l'italiano vive senza prefisso (/, /storia/, …). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Radice lingua="it">{children}</Radice>;
}

export { viewport } from '@/lib/viewport';
