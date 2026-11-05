# Grill Burger — sito

Sito statico Astro per Grill Burger, Via Nazionale 531, Roseto degli Abruzzi.

```bash
npm ci            # installa (script di installazione disattivati da .npmrc)
npm run dev       # sviluppo
npm run build     # build in dist/
npm run preview   # server locale con gli header di sicurezza (http://127.0.0.1:4321)
npm test          # test di sicurezza (richiede la build)
npm run lighthouse  # Lighthouse mobile e desktop (richiede Chrome e la preview attiva)
npm run security:scan  # npm audit + scansione di dist/
```

`PUBLIC_SHOW_TODO=1 npm run build` mostra i segnaposto `TODO_CONFERMARE` (solo anteprima interna).

Contenuti: `src/data/`. Header di sicurezza: `public/_headers`. Documentazione: `docs/`, `SECURITY.md`, `SECURITY_REPORT.md`.
