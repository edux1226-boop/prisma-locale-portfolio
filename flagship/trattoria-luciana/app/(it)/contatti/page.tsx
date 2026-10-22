import { PAGINE_COMPONENTI } from '@/components/pagine';
import { metadati } from '@/lib/seo';

export const metadata = metadati('it', 'contatti');

export default function Pagina() {
  const C = PAGINE_COMPONENTI.contatti;
  return <C lingua="it" />;
}
