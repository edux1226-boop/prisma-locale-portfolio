import '@/styles/tokens.css';
import '@/styles/base.css';

import { serif, sans } from '@/lib/font';
import { ANTEPRIMA, SCADENZA } from '@/lib/sito';
import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { Testata } from './Testata';
import { Piede } from './Piede';
import { BarraPrenota } from './BarraPrenota';
import { Anteprima } from './Anteprima';
import { DatiStrutturati } from './DatiStrutturati';
import { Regia } from '@/components/regia/Regia';
import { vociTestata } from './voci';

/* Prima del primo disegno: classi che accendono il movimento (solo se
   l'utente non chiede movimento ridotto) e scadenza dell'anteprima. Se la
   regia non parte entro 4 secondi, il movimento si spegne e tutto resta
   visibile: l'HTML viene prima di tutto. */
const avvio = `(function(d,w){var r=d.documentElement;${
  ANTEPRIMA ? `if(Date.now()>Date.parse('${SCADENZA}')){r.classList.add('is-scaduta');return;}` : ''
}r.classList.add('js');if(!w.matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('motion');w.setTimeout(function(){if(!w.__regia)r.classList.remove('motion');},4000);}})(document,window);`;

export function Radice({ lingua, children }: { lingua: Lingua; children: React.ReactNode }) {
  const d = dizionario(lingua);
  return (
    <html lang={lingua} className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: avvio }} />
        <DatiStrutturati lingua={lingua} />
      </head>
      <body className="tono-avorio">
        <a className="salta" href="#contenuto">{d.comune.salta}</a>
        {ANTEPRIMA && <Anteprima lingua={lingua} />}
        <Testata lingua={lingua} voci={vociTestata(lingua)} />
        {children}
        <Piede lingua={lingua} />
        <BarraPrenota lingua={lingua} />
        <div className="grana" aria-hidden="true" />
        <Regia />
      </body>
    </html>
  );
}
