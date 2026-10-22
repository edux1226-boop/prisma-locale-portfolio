import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';

export const metadata = metadati('it', 'home');

export default function Pagina() {
  const C = PAGINE_COMPONENTI.home;
  return <C lingua="it" />;
}
