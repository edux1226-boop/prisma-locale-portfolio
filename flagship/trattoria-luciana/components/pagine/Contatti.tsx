import { dizionario } from '@/i18n';
import type { Lingua } from '@/lib/rotte';
import { ristorante, leggi, inAttesa, orariVisibili } from '@/lib/contenuti';
import { VIA, CITTA, LINK_INDICAZIONI, LINK_MAPPA, telefono, email, whatsapp, social, attesa } from '@/lib/recapiti';
import { TestaPagina } from '@/components/ui/TestaPagina';
import { Mappa } from '@/components/ui/Mappa';
import { Orari } from '@/components/ui/Orari';
import { Icona } from '@/components/ui/Icona';
import { Dc } from '@/components/ui/Dc';
import s from './Contatti.module.css';

/* /contatti — indirizzo, recapiti, orari della settimana, come arrivare. */
export function Contatti({ lingua }: { lingua: Lingua }) {
  const d = dizionario(lingua);
  const tel = telefono();
  const mail = email();
  const wa = whatsapp(d.percorsi.whatsappTesto);
  const soc = social();
  const ragione = leggi(ristorante.legale.ragioneSociale);
  const piva = leggi(ristorante.legale.partitaIva);

  const riga = (etichetta: string, contenuto: React.ReactNode) => (
    <div className={s.riga}>
      <dt className="etichetta">{etichetta}</dt>
      <dd>{contenuto}</dd>
    </div>
  );

  return (
    <main id="contenuto" tabIndex={-1} data-pagina="contatti">
      <TestaPagina lingua={lingua} sopra={d.contatti.sopra} titolo={d.contatti.titolo} intro={d.contatti.intro} foto="lungomare" />

      <section className={`${s.contatti} tono-avorio`} aria-label={d.contatti.titolo} data-tono="avorio">
        <dl className={s.recapiti}>
          {riga(d.recapiti.indirizzo, (
            <>
              <address className={s.indirizzo}>{VIA}<br />{CITTA}</address>
              <span className={s.azioni}>
                <a className="btn btn--pieno" href={LINK_INDICAZIONI} target="_blank" rel="noopener">
                  <Icona nome="mappa" /> {d.recapiti.indicazioni}<span className="sr-only"> {d.comune.nuovaScheda}</span>
                </a>
                <a className="btn btn--linea" href={LINK_MAPPA} target="_blank" rel="noopener">
                  {d.recapiti.mappa} <Icona nome="obliqua" /><span className="sr-only"> {d.comune.nuovaScheda}</span>
                </a>
              </span>
            </>
          ))}
          {(tel || attesa.telefono()) && riga(d.recapiti.telefono, tel
            ? <><a className={`${s.grande} link cifra`} href={tel.valore.href}>{tel.valore.testo}</a>{tel.daConfermare && <Dc lingua={lingua} />}</>
            : <Dc lingua={lingua} solo />)}
          {(mail || attesa.email()) && riga(d.recapiti.email, mail
            ? <><a className={`${s.grande} link`} href={mail.valore.href}>{mail.valore.testo}</a>{mail.daConfermare && <Dc lingua={lingua} />}</>
            : <Dc lingua={lingua} solo />)}
          {(wa || attesa.whatsapp()) && riga(d.recapiti.whatsapp, wa
            ? <><a className={`${s.grande} link`} href={wa.valore.href} target="_blank" rel="noopener">{wa.valore.testo}<span className="sr-only"> {d.comune.nuovaScheda}</span></a>{wa.daConfermare && <Dc lingua={lingua} />}</>
            : <Dc lingua={lingua} solo />)}
          {(soc.instagram || soc.facebook || attesa.instagram() || attesa.facebook()) && riga(d.contatti.seguici, (
            <span className={s.social}>
              {soc.instagram ? <a className="link" href={soc.instagram.valore} target="_blank" rel="noopener">Instagram</a> : attesa.instagram() && <span>Instagram <Dc lingua={lingua} testo={d.comune.daCollegare} /></span>}
              {soc.facebook ? <a className="link" href={soc.facebook.valore} target="_blank" rel="noopener">Facebook</a> : attesa.facebook() && <span>Facebook <Dc lingua={lingua} testo={d.comune.daCollegare} /></span>}
            </span>
          ))}
        </dl>
        <div className={s.mappa} data-rivela>
          <Mappa lingua={lingua} id="mappa-contatti" />
        </div>
      </section>

      {orariVisibili() && (
        <section className={`${s.orari} tono-bianco`} aria-labelledby="orari-titolo" data-tono="bianco">
          <h2 className="titolo-xl" id="orari-titolo" data-righe>{d.orari.titolo}</h2>
          <Orari lingua={lingua} variante="settimana" className={s.tabella} />
        </section>
      )}

      <section className={`${s.arrivare} tono-sabbia`} aria-labelledby="arrivare-titolo" data-tono="sabbia">
        <h2 className="titolo-xl" id="arrivare-titolo" data-righe>{d.contatti.comeArrivare}</h2>
        <div className={s.modi}>
          {[d.contatti.auto, d.contatti.treno].map((m) => (
            <div key={m.titolo} data-rivela>
              <h3 className={s.modo}>{m.titolo}</h3>
              <p>{m.testo}</p>
            </div>
          ))}
        </div>
        {(ragione || piva || inAttesa(ristorante.legale.partitaIva)) && (
          <dl className={s.legale}>
            <div><dt>{d.contatti.ragioneSociale}</dt><dd>{ragione?.valore ?? <Dc lingua={lingua} solo />}{ragione?.daConfermare && <Dc lingua={lingua} />}</dd></div>
            <div><dt>{d.contatti.partitaIva}</dt><dd className="cifra">{piva?.valore ?? <Dc lingua={lingua} solo />}{piva?.daConfermare && <Dc lingua={lingua} />}</dd></div>
          </dl>
        )}
      </section>
    </main>
  );
}
