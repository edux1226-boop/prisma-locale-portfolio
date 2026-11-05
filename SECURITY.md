# Sicurezza

## Threat model

**Asset:** contenuti del sito, dominio e DNS, account hosting e registrar, repository e pipeline CI, casella `info@grillburger.it`.

**Attori:** bot e scraper, defacer opportunisti, phishing con dominio simile, spammer, concorrenza sleale.

**Superfici e rischi**

| Superficie | Rischio | Mitigazione |
|---|---|---|
| Sito statico su CDN | Defacement, XSS | Nessun login, nessun database, nessun input utente; CSP `default-src 'none'`, nessuno script/stile inline |
| Header HTTP | Clickjacking, sniffing, leak referrer | `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP |
| Dipendenze npm | Supply chain | Poche dipendenze, versioni fisse, `ignore-scripts=true`, `npm audit` in CI |
| Terze parti | Tracking, script esterni | Zero terze parti al caricamento; mappa Google solo dopo clic (iframe) |
| Form/serverless | Spam, abuso costi | Nessun modulo: solo `tel:`, WhatsApp, e-mail |
| Repository/CI | Leak segreti, takeover | `.env*` ignorato, nessun segreto necessario, azioni CI con permessi minimi |
| DNS/e-mail | Spoofing, takeover | Vedi checklist sotto (da fare con il proprietario) |

**Fuori scope:** `grillburger.it` in produzione, Glovo, Tripadvisor, Google e altri servizi di terzi.

## Checklist per chi gestisce dominio e hosting (non verificabile dal codice)

- 2FA o passkey su GitHub, hosting, registrar, DNS e casella e-mail.
- DNSSEC, record CAA, SPF + DKIM + DMARC (`p=quarantine`, poi `reject`), registrar lock.
- Pubblicare `public/_headers` sull'hosting (Cloudflare Pages o Netlify) e verificare con securityheaders.com.
- HSTS con `preload`: attivarlo solo dopo aver verificato che tutti i sottodomini siano in HTTPS.
- Branch protection su `main`, token CI con minimo privilegio.

## Segnalazioni

Scrivi a `info@grillburger.it` (vedi `/.well-known/security.txt`). Casella da confermare come monitorata.
