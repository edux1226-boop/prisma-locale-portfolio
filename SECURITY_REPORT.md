# Report di sicurezza (red team sul sito locale)

Data: 4 novembre 2026. Ambito: build locale servita da `scripts/serve-dist.mjs` (replica `public/_headers`). Nessun test su sistemi di terzi.

## Metodo
Ricognizione di route e file, scansione di `dist/` (segreti, source map, EXIF, script/stili inline, risorse di terzi), probe HTTP (metodi, path traversal, file di sistema, riflessione di input), controllo header, `npm audit`, ricerca di script di installazione nel lockfile, controllo cronologia git.

## Esito
Nessun finding Critico o Alto.

| # | Gravità | Finding | PoC minimo | Stato |
|---|---|---|---|---|
| 1 | Info | Il server di test accettava POST/PUT/DELETE/OPTIONS con 200 | `curl -X POST /` → 200 | Corretto: 405 + test di regressione. Su hosting statico (Cloudflare/Netlify) i metodi sono già limitati |
| 2 | Info | LCP home mobile 2,2 s (obiettivo 2,0) | Lighthouse mobile, 4G simulato | Accettato: CSS esterno bloccante, necessario per CSP senza `unsafe-inline`. Alternativa: stile inline con hash, da valutare |
| 3 | Info | `fsevents` ha uno script di installazione | lockfile | Accettato: dipendenza opzionale solo macOS, installazioni con `ignore-scripts=true` |
| 4 | Info | CSP `frame-src https://www.google.com` consente iframe Google su tutto il sito | header | Accettato: nessun iframe parte senza clic; limitabile a `/dove-siamo/` con regola per percorso |
| 5 | Info | Cronologia git vuota | `git log` | Nessun segreto committato |

## Verificato, nessun problema
- `/.git/`, `/.env`, `/_headers`, `/package.json`, `/src/`, `/node_modules/`, `*.map`, traversal (`%2e%2e`, `\`, `//`): tutti 404 senza dettagli tecnici.
- Nessun input riflesso (query string con `<script>`): assente nell'HTML.
- Nessun `X-Powered-By` né `Server`; 404 generico.
- `dist/`: nessun segreto, nessuna source map, nessun EXIF/XMP, nessuno script o stile inline, nessuna risorsa di terzi, nessun commento HTML.
- `npm audit`: 0 vulnerabilità.
- Nessun cookie; `localStorage` solo per la preferenza «Riduci animazioni».
- Console: nessuna violazione CSP (verificato nel browser sulle pagine home, menu e dove-siamo, mappa inclusa).

## Non verificato (serve staging o accesso al proprietario)
TLS e HSTS reali, DNS/SPF/DKIM/DMARC, sottodomini a rischio takeover, account hosting e registrar, scansione OWASP ZAP e `nuclei` su staging. Elenco azioni in `SECURITY.md`.

## Regressioni automatiche
`npm test` (20 test): header obbligatori, CSP rigorosa, cache immutable, file non esposti, metodi HTTP, nessuna riflessione di input, scansione di `dist/`. In CI ad ogni push.
