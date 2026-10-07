import 'server-only';
import { dizionario } from '@/i18n';
import { percorso, type Lingua } from '@/lib/rotte';
import { telefono, attesa, VIA, CITTA } from '@/lib/recapiti';
import { ANTEPRIMA } from '@/lib/sito';

/** Tutto quello che serve alla testata (componente client), già tradotto e serializzabile. */
export function vociTestata(lingua: Lingua) {
  const d = dizionario(lingua);
  const tel = telefono();
  return {
    home: percorso(lingua, 'home'),
    marchio: d.comune.marchio,
    nav: (['storia', 'menu', 'mare', 'contatti'] as const).map((p) => ({ pagina: p, href: percorso(lingua, p), testo: d.nav[p] })),
    prenota: { href: percorso(lingua, 'prenota'), testo: d.comune.prenota, breve: d.comune.prenotaBreve },
    etichette: { menu: d.comune.menu, chiudi: d.comune.chiudi, lingua: d.comune.lingua, chiama: d.comune.chiama, daConfermare: d.comune.daConfermare },
    telefono: tel ? { href: tel.valore.href, testo: tel.valore.testo, daConfermare: tel.daConfermare } : null,
    telefonoInAttesa: attesa.telefono(),
    indirizzo: [VIA, CITTA],
    tagline: d.comune.tagline,
    anteprima: ANTEPRIMA,
  };
}

export type VociTestata = ReturnType<typeof vociTestata>;
