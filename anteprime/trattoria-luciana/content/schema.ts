/* ==========================================================================
   Modello dei contenuti gestiti dal ristorante.

   Ogni dato che può essere sbagliato porta con sé il proprio stato:
     confirmed            → approvato dal ristorante, può andare online
     needs_confirmation   → da approvare: visibile solo nell'anteprima,
                            con il suo segno "da confermare"

   I file JSON accanto a questo sono la sorgente (li modifica il CMS, vedi
   cms/config.yml). Lo schema li valida durante la build: un contenuto
   malformato ferma la pubblicazione invece di finire online.

   Nessuna dipendenza da Next: lo usa anche scripts/contenuti.ts.
   ========================================================================== */

import { z } from 'zod';

export const Stato = z.enum(['confirmed', 'needs_confirmation']);
export type Stato = z.infer<typeof Stato>;

/** Testo in tre lingue. L'italiano è la lingua di partenza. */
export const Testo = z.object({ it: z.string().min(1), en: z.string().min(1), de: z.string().min(1) });
export type Testo = z.infer<typeof Testo>;

/** Un singolo dato con il suo stato. `nota` è per chi conferma, non va mai in pagina. */
export const campo = <T extends z.ZodType>(valore: T) =>
  z.object({ value: valore.nullable(), status: Stato, nota: z.string().optional() });
export type Campo<T> = { value: T | null; status: Stato; nota?: string };

const Ora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'formato HH:MM');
export const Giorno = z.enum(['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']);
export type Giorno = z.infer<typeof Giorno>;
export const Servizio = z.object({ dalle: Ora, alle: Ora });
export type Servizio = z.infer<typeof Servizio>;

/* ---------------------------------------------------------------- Restaurant */
export const Restaurant = z.object({
  nome: campo(z.string()),
  famiglia: campo(z.string()),
  descrizione: campo(Testo),
  fondazione: campo(z.number().int().min(1900).max(2100)),
  indirizzo: campo(z.object({
    via: z.string(), cap: z.string(), citta: z.string(),
    provincia: z.string(), regione: z.string(), paese: z.string().length(2),
  })),
  /** Formato internazionale, solo cifre e "+": +39085… */
  telefono: campo(z.string().regex(/^\+\d{8,15}$/)),
  email: campo(z.email()),
  /** Numero WhatsApp, stesso formato del telefono. Il canale compare solo se confermato. */
  whatsapp: campo(z.string().regex(/^\+\d{8,15}$/)),
  coordinate: campo(z.object({ lat: z.number(), lng: z.number() })),
  social: z.object({ instagram: campo(z.url()), facebook: campo(z.url()) }),
  /** Il dominio definitivo, con https://. Diventa il canonical in produzione. */
  dominio: campo(z.url()),
  /** Percorso del logo in /public. Senza logo confermato resta il marchio tipografico. */
  logo: campo(z.string()),
  cucina: campo(z.array(z.string())),
  fasciaPrezzo: campo(z.string()),
  prenotazione: z.object({
    /** Motore di prenotazione esterno: se confermato, la richiesta online porta lì. */
    motore: campo(z.object({ nome: z.string(), url: z.url() })),
  }),
  legale: z.object({ ragioneSociale: campo(z.string()), partitaIva: campo(z.string()) }),
});
export type Restaurant = z.infer<typeof Restaurant>;

/* -------------------------------------------------------------- OpeningHours */
export const OpeningHours = z.object({
  pranzo: campo(Servizio),
  cena: campo(Servizio),
  giornoChiusura: campo(z.array(Giorno)),
  stagionalita: campo(Testo),
  eccezioni: z.array(z.object({
    data: z.iso.date(), chiuso: z.boolean(), nota: Testo, status: Stato,
  })),
});
export type OpeningHours = z.infer<typeof OpeningHours>;

/* ---------------------------------------------------------------------- Menu */
/** I 14 allergeni del Reg. UE 1169/2011, Allegato II. */
export const Allergene = z.enum([
  'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 'latte',
  'frutta-a-guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 'molluschi',
]);
export type Allergene = z.infer<typeof Allergene>;

export const Disponibilita = z.enum(['sempre', 'pescato', 'stagione', 'esaurito']);
export type Disponibilita = z.infer<typeof Disponibilita>;

export const Piatto = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nome: Testo,
  descrizione: Testo.optional(),
  prezzo: campo(z.number().nonnegative()),
  unita: z.enum(['porzione', 'etto', 'bottiglia', 'calice']).default('porzione'),
  allergeni: campo(z.array(Allergene)),
  /** id di una voce di media.json */
  fotografia: z.string().nullable().default(null),
  disponibilita: Disponibilita.default('sempre'),
  piattoDelGiorno: z.boolean().default(false),
  /** Compare nell'assaggio del menu in homepage. */
  inEvidenza: z.boolean().default(false),
  status: Stato,
});
export type Piatto = z.infer<typeof Piatto>;

export const Categoria = z.object({
  id: z.enum(['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini']),
  nome: Testo,
  nota: Testo.optional(),
  piatti: z.array(Piatto),
});
export type Categoria = z.infer<typeof Categoria>;

export const Menu = z.object({
  coperto: campo(z.number().nonnegative()),
  note: z.array(z.object({ testo: Testo, status: Stato })),
  categorie: z.array(Categoria),
});
export type Menu = z.infer<typeof Menu>;

/* ----------------------------------------------------------------- LunchMenu */
export const LunchMenu = z.object({
  status: Stato,
  prezzo: campo(z.number().nonnegative()),
  giorni: campo(z.array(Giorno)),
  orari: campo(Servizio),
  comprende: campo(z.array(Testo)),
  piatti: z.array(z.object({
    portata: z.enum(['primo', 'secondo', 'contorno', 'dolce']),
    nome: Testo,
    status: Stato,
  })),
  nota: campo(Testo),
});
export type LunchMenu = z.infer<typeof LunchMenu>;

/* --------------------------------------------------------------------- Story */
export const Capitolo = z.object({
  id: z.string(),
  /** Anno o periodo, come lo si vuole leggere: "1962", "Anni Sessanta". */
  anno: campo(z.string()),
  titolo: Testo,
  testo: Testo,
  fotografie: z.array(z.string()),
  didascalia: Testo.optional(),
  status: Stato,
});
export type Capitolo = z.infer<typeof Capitolo>;

export const Story = z.object({ capitoli: z.array(Capitolo) });
export type Story = z.infer<typeof Story>;

/* ------------------------------------------------------------------- Reviews */
export const Recensione = z.object({
  id: z.string(),
  /** Le recensioni si citano nella lingua in cui sono state scritte. */
  lingua: z.enum(['it', 'en', 'de']),
  testo: z.string(),
  autore: z.string().nullable(),
  fonte: z.enum(['google', 'tripadvisor', 'thefork', 'altro']),
  data: z.string().nullable(),
  url: z.url().nullable(),
  /** true = frase d'esempio per l'impaginazione: non può mai essere confermata. */
  esempio: z.boolean(),
  status: Stato,
}).refine((r) => !(r.esempio && r.status === 'confirmed'), {
  message: 'una recensione d\'esempio non può essere confermata',
});
export type Recensione = z.infer<typeof Recensione>;

export const Reviews = z.object({
  sintesi: campo(z.object({
    punteggio: z.number(), su: z.number(), numero: z.number().int(), fonte: z.string(),
  })),
  recensioni: z.array(Recensione),
});
export type Reviews = z.infer<typeof Reviews>;

/* --------------------------------------------------------------------- Media */
/** Disegni a filo che tengono il posto delle foto non ancora scattate. */
export const Disegno = z.enum(['pesce', 'vongola', 'pentola', 'piatto', 'calice', 'barca', 'ritratto', 'tavola']);
export type Disegno = z.infer<typeof Disegno>;

export const Variante = z.object({
  /** Nome base in /public/media: <file>-<larghezza>.avif|webp */
  file: z.string(),
  larghezze: z.array(z.number().int().positive()).min(1),
  larghezza: z.number().int().positive(),
  altezza: z.number().int().positive(),
});
export type Variante = z.infer<typeof Variante>;

export const MediaVoce = z.object({
  id: z.string(),
  categoria: z.enum(['restaurant', 'family', 'kitchen', 'dishes', 'sea', 'archive']),
  /** foto: fotografia vera · illustrazione: tavola dipinta · segnaposto: nessun file */
  tipo: z.enum(['foto', 'illustrazione', 'segnaposto']),
  orizzontale: Variante.optional(),
  verticale: Variante.optional(),
  /** Foto caricata dal CMS (percorso in /public): le misure le genera l'Image CDN. */
  originale: z.string().optional(),
  alt: Testo,
  /** Indicazioni di regia per lo scatto: soggetto, luce, formato. */
  regia: Testo,
  disegno: Disegno.optional(),
  status: Stato,
});
export type MediaVoce = z.infer<typeof MediaVoce>;

export const Media = z.object({ voci: z.array(MediaVoce) });
export type Media = z.infer<typeof Media>;

/* ------------------------------------------------------------------- Pescato */
/** Il calendario del mare: quando le specie sono nella loro stagione migliore. */
export const Pescato = z.object({
  fermo: campo(z.object({ mesi: z.array(z.number().int().min(1).max(12)), nota: Testo })),
  specie: z.array(z.object({
    id: z.string(),
    nome: Testo,
    latino: z.string(),
    mesi: z.array(z.number().int().min(1).max(12)),
    status: Stato,
  })),
});
export type Pescato = z.infer<typeof Pescato>;

/* ------------------------------------------------------------------ Registro */
export const SCHEMI = {
  restaurant: Restaurant,
  'opening-hours': OpeningHours,
  menu: Menu,
  'lunch-menu': LunchMenu,
  story: Story,
  reviews: Reviews,
  media: Media,
  pescato: Pescato,
} as const;
export type NomeContenuto = keyof typeof SCHEMI;

/** Tutto ciò che è ancora da confermare, come percorsi leggibili. */
export function daConfermare(nome: string, dato: unknown, percorso: string[] = [nome]): { percorso: string; nota?: string }[] {
  if (Array.isArray(dato)) {
    return dato.flatMap((v, i) => {
      const id = v && typeof v === 'object' && 'id' in v ? String((v as { id: unknown }).id) : String(i);
      return daConfermare(nome, v, [...percorso, id]);
    });
  }
  if (!dato || typeof dato !== 'object') return [];
  const o = dato as Record<string, unknown>;
  const qui = o.status === 'needs_confirmation'
    ? [{ percorso: percorso.join(' › '), nota: typeof o.nota === 'string' ? o.nota : undefined }]
    : [];
  return [
    ...qui,
    ...Object.entries(o)
      .filter(([k]) => k !== 'status' && k !== 'nota')
      .flatMap(([k, v]) => daConfermare(nome, v, [...percorso, k])),
  ];
}
