# Design system

Bianco e nero, tecnico, senza accenti colorati. Le foto dei piatti restano a colori e sono l'unico colore della pagina.

## Token (`src/styles/site.css`, `:root`)

| Token | Valore | Uso |
|---|---|---|
| `--bg` | `#050505` | Sfondo |
| `--s1`, `--s2` | `#0d0d0d`, `#141414` | Superfici |
| `--line`, `--line-2` | bianco all'8% e al 16% | Bordi da 1 px |
| `--ink` | `#fafafa` | Testo e bottoni primari |
| `--g1` | `#a1a1a1` | Testo secondario (contrasto 8:1) |
| `--g3` | `#8c8c8c` | Numerazione e dettagli piccoli (contrasto 5,7:1) |
| `--g2` | `#6b6b6b` | Solo elementi decorativi, mai testo |
| `--paper`, `--on-paper` | `#fafafa`, `#050505` | Sezioni invertite (nero su bianco) |
| `--sp-1…9` | 4, 8, 12, 16, 24, 32, 48, 72, 112 px | Unica scala di spazi |
| `--r` | 4 px | Unico raggio (il logo resta circolare) |
| `--shadow` | nera, solo su dialog e barra carrello | Unica ombra |

## Tipografia
Space Grotesk (variabile, un solo file) per titoli e testo, tracking stretto sui titoli. JetBrains Mono per etichette, numeri, prezzi e bottoni. Self-hosted, WOFF2, latino e latino esteso.

## Dettagli tecnici
Griglia sottile nell'hero, numerazione delle sezioni (01 / 02), filetti da 1 px, grana leggera (SVG inline a opacità 5%), sezione invertita per il menu.

## Movimento (ognuno ha una funzione)
| Movimento | Funzione |
|---|---|
| Titolo hero che sale per riga (una volta) | Dare l'ordine di lettura all'ingresso |
| Zoom della foto dell'hero a scroll | Profondità, lascia spazio al testo che esce |
| Griglia prospettica WebGL, monocromatica | Profondità; reagisce a mouse e scroll; solo su dispositivi capaci, caricata dopo il primo paint |
| Gocce di salsa (2 cicli, poi ferme) | Attirare lo sguardo sul piatto una volta |
| Apertura foto per sezione, titoli che entrano | Guidare l'occhio nelle sezioni |
| Dialog che scorrono dal bordo, volo nel carrello, badge che pulsa una volta | Feedback delle azioni |
| Scroll fluido (Lenis) | Solo con mouse; si ferma con i dialog aperti |
| Cursore e bottoni magnetici | Solo su elementi interattivi, solo desktop |

Tutto si anima con `transform` e `opacity`. Con «Riduci animazioni» o `prefers-reduced-motion` restano foto e testo; su rete lenta, risparmio dati o dispositivi deboli non si carica né WebGL né Lenis.

## Rimosso di proposito
Tema arancione con alone luminoso, braci animate, fascia scorrevole con simboli, gradienti colorati, ombre colorate, puntino pulsante, blocco «Hai fame?», claim ripetuti tre volte, titoli con trattini lunghi.
