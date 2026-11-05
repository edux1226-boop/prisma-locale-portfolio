# Design system

Direzione: sobria e professionale, da ristorante. Nero, avorio, ottone. Fotografia protagonista, poche decorazioni.

## Token (`src/styles/global.css`)

| Token | Valore | Uso |
|---|---|---|
| `--bg` | `#060509` | Fondo pagina (uguale al nero della foto hero) |
| `--bg-2` | `#0e0d11` | Footer, riquadri |
| `--ink` | `#f2ebdf` | Testo |
| `--muted` | `#a8a095` | Testo secondario |
| `--accent` | `#c8a35f` | Ottone: link, prezzi, pulsante primario |
| `--line` | avorio al 14% | Filetti |

Cambio voluto rispetto al dossier (antracite `#414141`, giallo `#FEC501`, rosso `#CC0000`): su richiesta del proprietario, per un tono meno «fast food». Contrasti: testo su fondo ≥ 15:1, ottone su fondo ≈ 8:1, testo secondario ≈ 8:1.

## Tipografia
Titoli Playfair Display 700 (con corsivo in ottone per l'enfasi), testo Inter. Etichette piccole maiuscole con spaziatura larga, usate con parsimonia.

## Componenti
Pulsanti rettangolari con bordo sottile; barra azioni fissa su mobile (Ordina · Chiama · Indicazioni, rispetta le safe area); menu in stile carta con puntini e prezzi allineati; tab categorie sticky con scroll-snap; mappa click-to-load.

## Animazioni
Solo `transform` e `opacity`. Reveal a scroll con `animation-timeline: view()` (fallback `IntersectionObserver`), transizioni di pagina con View Transitions (CSS), hero con gocce e riflesso. Cursore personalizzato e bottoni magnetici solo desktop con puntatore preciso.

**Movimento ridotto:** rispettato `prefers-reduced-motion` e pulsante «Riduci animazioni» (preferenza salvata nel browser). Con movimento ridotto restano foto e testo.

## Cosa è stato tolto di proposito
Marquee, fiammella, pulsanti a pillola, titoli sempre maiuscoli, etichette sopra ogni titolo, badge `TODO` visibili.
