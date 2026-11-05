# Prestazioni

## Budget e misure (4 novembre 2026)

| Voce | Budget | Misurato |
|---|---|---|
| JS iniziale | ≤ 90 KB gz | 1,7 KB gz (+0,4 KB solo desktop) |
| CSS | ≤ 14 KB (critico) | 14,1 KB raw, 4,0 KB gz, file esterno |
| HTML home | ≤ 30 KB | 9,2 KB |
| LCP mobile | ≤ 2,0 s | home 2,2 s; menu 1,6 s; dove siamo 1,7 s |
| CLS | ≤ 0,02 | 0,001–0,007 |
| TBT | ≤ 150 ms | 0 ms |
| INP | ≤ 150 ms | non misurato (assenza di interazioni pesanti) |

## Lighthouse (locale, Chrome headless, mobile con throttling 4G simulato)

| Pagina | Perf. | Access. | Best pr. | SEO |
|---|---|---|---|---|
| Home mobile | 99 | 100 | 100 | 100 |
| Home desktop | 100 | 100 | 100 | 100 |
| Menu mobile / desktop | 100 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| Dove siamo mobile / desktop | 100 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |

**Punto perso sulla home mobile (99):** LCP 2,2 s. Il CSS è un file esterno bloccante: la CSP rigorosa vieta gli stili inline. Si può recuperare inserendo il CSS inline con un hash nella CSP, a costo di un passaggio di build in più.

## Come si ottiene
- Sito statico Astro, zero framework lato client, nessun terza parte.
- Font self-hosted in WOFF2 (Playfair Display 700, Inter 400/500), solo latino e latino esteso, `font-display: swap`, 2 preload.
- Immagini in WebP con `srcset`; metadati rimossi in build.
- Hero: la foto è il LCP (`fetchpriority="high"`); gocce e riflesso sono animazioni CSS su `transform` e `opacity`, disattivate con movimento ridotto.
- Cache: asset con hash `immutable`, HTML con rivalidazione.

## Come rimisurare
`npm run build && npm run preview`, poi `npm run lighthouse`. Report in `lighthouse-reports/` (ignorata da git).
