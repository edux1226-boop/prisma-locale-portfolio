import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';

export const metadata = metadati('it', 'prenota');

export default function Pagina() {
  const C = PAGINE_COMPONENTI.prenota;
  return <C lingua="it" />;
}
