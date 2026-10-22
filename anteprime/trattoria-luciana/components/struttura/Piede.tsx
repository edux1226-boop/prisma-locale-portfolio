import Link from 'next/link';
import { dizionario } from '@/i18n';
import { percorso, LINGUE, NOME_LINGUA, type Lingua } from '@/lib/rotte';
import { ristorante, leggi, inAttesa, orariVisibili, NOME } from '@/lib/contenuti';
import { VIA, CITTA, LINK_INDICAZIONI, telefono, email, social, attesa } from '@/lib/recapiti';
import { ANTEPRIMA } from '@/lib/sito';
import { Orari } from '@/components/ui/Orari';
import { Icona } from '@/components/ui/Icona';
import { Dc } from '@/components/ui/Dc';
import s from './Piede.module.css';

export function Piede({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const tel = telefono();
  const mail = email();
  const soc = social();
  const piva = leggi(ristorante.legale.partitaIva);
  const ragione = leggi(ristorante.legale.ragioneSociale);

  return (
    <footer className={`${s.piede} tono-notte`} data-tono="notte">
      <div className={`${s.alto} contenitore`}>
        <p className={`${s.motto} titolo-xl`} aria-hidden="true">{d.comune.tagline}</p>
        <Link className="btn btn--accento" href={percorso(lingua, 'prenota')}>
          {d.comune.prenota} <Icona nome="freccia" />
        </Link>
      </div>

      <div className={`${s.griglia} contenitore`}>
        <div>
          <h2 className="etichetta">{d.piede.dove}</h2>
          <address className={s.indirizzo}>{VIA}<br />{CITTA}</address>
          <a className="link" href={LINK_INDICAZIONI} target="_blank" rel="noopener">
            {d.recapiti.indicazioni}<span className="sr-only"> {d.comune.nuovaScheda}</span>
          </a>
        </div>

        {orariVisibili() && (
          <div>
            <h2 className="etichetta">{d.piede.orari}</h2>
            <Orari lingua={lingua} />
          </div>
        )}

        <nav aria-labelledby="piede-pagine">
          <h2 className="etichetta" id="piede-pagine">{d.piede.pagine}</h2>
          <ul role="list" className={s.lista}>
            {(['home', 'storia', 'menu', 'mare', 'prenota', 'contatti'] as const).map((p) => (
              <li key={p}><Link className="link" href={percorso(lingua, p)}>{d.nav[p]}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="etichetta">{d.piede.seguici}</h2>
          <ul role="list" className={s.lista}>
            {tel && <li><a className="link cifra" href={tel.valore.href}>{tel.valore.testo}</a>{tel.daConfermare && <Dc lingua={lingua} />}</li>}
            {!tel && attesa.telefono() && <li>{d.recapiti.telefono} <Dc lingua={lingua} /></li>}
            {mail && <li><a className="link" href={mail.valore.href}>{mail.valore.testo}</a>{mail.daConfermare && <Dc lingua={lingua} />}</li>}
            {!mail && attesa.email() && <li>{d.recapiti.email} <Dc lingua={lingua} /></li>}
            {soc.instagram && <li><a className="link" href={soc.instagram.valore} target="_blank" rel="noopener">Instagram<span className="sr-only"> {d.comune.nuovaScheda}</span></a>{soc.instagram.daConfermare && <Dc lingua={lingua} />}</li>}
            {!soc.instagram && attesa.instagram() && <li>Instagram <Dc lingua={lingua} testo={d.comune.daCollegare} /></li>}
            {soc.facebook && <li><a className="link" href={soc.facebook.valore} target="_blank" rel="noopener">Facebook<span className="sr-only"> {d.comune.nuovaScheda}</span></a>{soc.facebook.daConfermare && <Dc lingua={lingua} />}</li>}
            {!soc.facebook && attesa.facebook() && <li>Facebook <Dc lingua={lingua} testo={d.comune.daCollegare} /></li>}
          </ul>
        </div>
      </div>

      <p className={s.firma} aria-hidden="true" data-firma={NOME} />

      <div className={`${s.base} contenitore`}>
        <p>
          © {new Date().getFullYear()} {ragione?.valore ?? NOME}
          {piva ? (
            <> · {d.piede.partitaIva} <span className="cifra">{piva.valore}</span>{piva.daConfermare && <Dc lingua={lingua} />}</>
          ) : inAttesa(ristorante.legale.partitaIva) ? (
            <> · {d.piede.partitaIva} <Dc lingua={lingua} /></>
          ) : null}
        </p>
        {ANTEPRIMA && (
          <p>{d.piede.privacy} · {d.piede.cookie} <Dc lingua={lingua} testo={d.comune.daCollegare} /></p>
        )}
        <ul role="list" className={s.lingue} aria-label={d.comune.lingua}>
          {LINGUE.map((l) => (
            <li key={l}>
              <Link href={percorso(l, 'home')} hrefLang={l} lang={l} aria-current={l === lingua ? 'true' : undefined} prefetch={false}>
                {NOME_LINGUA[l]}
              </Link>
            </li>
          ))}
        </ul>
        <p><a className="link" href="https://prismalocale.it/" rel="noopener">{d.piede.credito}</a></p>
      </div>
    </footer>
  );
}
