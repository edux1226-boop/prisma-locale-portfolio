import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';

export const metadata = metadati('it', 'storia');

export default function Pagina() {
  const C = PAGINE_COMPONENTI.storia;
  return <C lingua="it" />;
}
