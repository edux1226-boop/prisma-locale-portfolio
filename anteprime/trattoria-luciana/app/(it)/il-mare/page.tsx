import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';

export const metadata = metadati('it', 'mare');

export default function Pagina() {
  const C = PAGINE_COMPONENTI.mare;
  return <C lingua="it" />;
}
