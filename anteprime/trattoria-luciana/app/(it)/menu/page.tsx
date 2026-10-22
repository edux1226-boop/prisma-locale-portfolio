import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';

export const metadata = metadati('it', 'menu');

export default function Pagina() {
  const C = PAGINE_COMPONENTI.menu;
  return <C lingua="it" />;
}
