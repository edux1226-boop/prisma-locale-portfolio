import { riepilogoDaConfermare, NOME } from '@/lib/contenuti';
import { ANTEPRIMA, STUDIO, SCADENZA } from '@/lib/sito';
import { ListaMancanti } from './ListaMancanti';
import s from './NotaAnteprima.module.css';

/* Solo nell'anteprima, solo in italiano: la nota di Prisma Locale al
   ristorante. Il conteggio dei dati in attesa viene dal CMS stesso. */

const VOCI = [
  { id: 'foto', titolo: 'Fotografie', testo: 'Famiglia, sala, pergola, cucina, piatti e una foto d\'archivio. Le tavole di regia nel sito dicono soggetto, luce e formato di ogni scatto.' },
  { id: 'orari', titolo: 'Orari', testo: 'Pranzo e cena, giorno di chiusura, mesi di apertura ed eventuali ferie.' },
  { id: 'menu', titolo: 'Menu, prezzi e allergeni', testo: 'Basta una foto del menu cartaceo: lo trascriviamo noi nel CMS, piatto per piatto.' },
  { id: 'pranzo', titolo: 'Il pranzo di Luciana', testo: 'Giorni, orario, prezzo e cosa comprende.' },
  { id: 'contatti', titolo: 'Telefono, email e WhatsApp', testo: 'WhatsApp compare sul sito solo dopo la vostra conferma del numero.' },
  { id: 'storia', titolo: 'La storia', testo: 'L\'anno di apertura e i passaggi della famiglia: i testi del sito sono d\'esempio, li riscriviamo con voi.' },
  { id: 'recensioni', titolo: 'Recensioni da citare', testo: 'Due o tre recensioni vere, da Google o Tripadvisor, con fonte e data.' },
  { id: 'social', titolo: 'Instagram, Facebook e dominio', testo: 'I profili da collegare e l\'indirizzo del sito (es. trattorialuciana.it).' },
  { id: 'logo', titolo: 'Logo', testo: 'Il file originale, se c\'è. Altrimenti resta il marchio tipografico del sito.' },
  { id: 'legale', titolo: 'Ragione sociale e partita IVA', testo: 'Per il piede del sito e l\'informativa privacy.' },
  { id: 'prenotazioni', titolo: 'Prenotazioni', testo: 'Usate già TheFork o un altro servizio? Se no, le richieste online arrivano via email.' },
];

export function NotaAnteprima() {
  if (!ANTEPRIMA) return null;
  const totale = riepilogoDaConfermare().reduce((n, g) => n + g.voci.length, 0);
  const fine = new Date(SCADENZA).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' });
  return (
    <aside className={`${s.nota} tono-avorio`} id="nota" aria-labelledby="nota-titolo" lang="it" data-tono="avorio">
      <div className={s.foglio}>
        <p className={`${s.sopra} etichetta`}>Nota di Prisma Locale per {NOME}</p>
        <h2 className={`${s.titolo} titolo-l`} id="nota-titolo">Cosa manca per andare online</h2>
        <p className={s.intro}>
          La struttura è pronta e funziona: le pagine, il menu, il modulo, le tre lingue. Le immagini sono tavole
          provvisorie e ogni dato segnato <span className="dc dc--solo">da confermare</span> resta fuori dal sito
          pubblico finché non lo approvate: oggi nel CMS ce ne sono <strong>{totale}</strong>. Spuntate quello che avete già.
        </p>
        <ListaMancanti voci={VOCI} studio={{ whatsapp: STUDIO.whatsapp, email: STUDIO.email }} nome={NOME} />
        <p className={s.firma}>
          Demo realizzata da <a className="link" href={STUDIO.url}>Prisma Locale</a>. Anteprima non commissionata, valida
          fino al {fine}. Il nome {NOME} appartiene ai legittimi proprietari.
        </p>
      </div>
    </aside>
  );
}
