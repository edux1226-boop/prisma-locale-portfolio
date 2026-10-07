'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Dizionario } from '@/i18n/it';
import type { Giorno, Servizio } from '@/content/schema';
import s from './ModuloPrenotazione.module.css';

/* La richiesta di prenotazione. Non simula mai una conferma: raccoglie i
   dati, li controlla, li invia (Netlify Forms in produzione) e dice
   chiaramente che il tavolo sarà confermato dal ristorante.
   In anteprima controlla tutto ma non invia nulla. */

type Testi = Dizionario['prenota']['modulo'];
type Campo = 'nome' | 'telefono' | 'email' | 'data' | 'ora' | 'persone' | 'allergie' | 'note';
type Errori = Partial<Record<Campo, string>>;

const GIORNI_JS: Giorno[] = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
export const NOME_MODULO = 'prenotazione';

function minuti(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function hhmm(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}
/** Fasce ogni mezz'ora, fino a un'ora prima della chiusura del servizio. */
function fasce(serv: Servizio) {
  const out: string[] = [];
  let fine = minuti(serv.alle);
  const inizio = minuti(serv.dalle);
  if (fine <= inizio) fine += 24 * 60;
  for (let t = inizio; t <= fine - 60; t += 30) out.push(hhmm(t % (24 * 60)));
  return out;
}
function oggiISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Props = {
  testi: Testi;
  servizi: { pranzo?: { nome: string; orari: Servizio }; cena?: { nome: string; orari: Servizio } };
  giorniChiusi: Giorno[];
  anteprima: boolean;
  azione: string;
  persone: number;
  locale: string;
  daCollegare: string;
};

export function ModuloPrenotazione({ testi, servizi, giorniChiusi, anteprima, azione, persone, locale, daCollegare }: Props) {
  const id = useId();
  const modulo = useRef<HTMLFormElement>(null);
  const riepilogo = useRef<HTMLDivElement>(null);
  const titoloOk = useRef<HTMLHeadingElement>(null);
  const [errori, setErrori] = useState<Errori>({});
  const [stato, setStato] = useState<'pronto' | 'invio' | 'inviato' | 'errore'>('pronto');
  const [inviati, setInviati] = useState<Record<string, string> | null>(null);
  const [min, setMin] = useState<string | undefined>(undefined);

  // la data minima è "oggi" di chi compila, non del giorno della build
  useEffect(() => setMin(oggiISO()), []);

  // mentre si scrive, la barra di prenotazione in basso si fa da parte
  useEffect(() => {
    const f = modulo.current;
    if (!f) return;
    const r = document.documentElement;
    const dentro = () => r.setAttribute('data-barra-via', '');
    const fuori = () => r.removeAttribute('data-barra-via');
    f.addEventListener('focusin', dentro);
    f.addEventListener('focusout', fuori);
    return () => { f.removeEventListener('focusin', dentro); f.removeEventListener('focusout', fuori); fuori(); };
  }, [stato]);

  useEffect(() => {
    if (stato === 'inviato') titoloOk.current?.focus();
  }, [stato]);

  const campoId = (c: Campo) => `${id}-${c}`;
  const errId = (c: Campo) => `${id}-${c}-errore`;
  const aiutoId = (c: Campo) => `${id}-${c}-aiuto`;

  function valida(dati: FormData): Errori {
    const e: Errori = {};
    const v = (k: Campo) => String(dati.get(k) ?? '').trim();
    if (v('nome').length < 2) e.nome = testi.errori.nome;
    if (v('telefono').replace(/[^\d]/g, '').length < 6 || !/^[+\d][\d\s().\-/]{5,}$/.test(v('telefono'))) e.telefono = testi.errori.telefono;
    if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) e.email = testi.errori.email;
    const data = v('data');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < oggiISO()) e.data = testi.errori.data;
    else if (giorniChiusi.length) {
      const g = GIORNI_JS[new Date(`${data}T12:00:00`).getDay()];
      if (giorniChiusi.includes(g)) e.data = testi.errori.dataChiusura;
    }
    if (!/^\d{2}:\d{2}$/.test(v('ora'))) e.ora = testi.errori.ora;
    const n = Number(v('persone'));
    if (!Number.isInteger(n) || n < 1 || n > persone) e.persone = testi.errori.persone;
    return e;
  }

  async function invia(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = ev.currentTarget;
    const dati = new FormData(f);
    if (dati.get('bot-field')) return;
    const e = valida(dati);
    setErrori(e);
    const chiavi = Object.keys(e) as Campo[];
    if (chiavi.length) {
      requestAnimationFrame(() => {
        riepilogo.current?.focus();
      });
      return;
    }
    const valori = Object.fromEntries([...dati.entries()].map(([k, x]) => [k, String(x)]));
    if (anteprima) {
      setInviati(valori);
      setStato('inviato');
      return;
    }
    setStato('invio');
    try {
      const corpo = new URLSearchParams({ 'form-name': NOME_MODULO, ...valori });
      const r = await fetch(azione, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: corpo.toString() });
      if (!r.ok) throw new Error(String(r.status));
      setInviati(valori);
      setStato('inviato');
    } catch {
      setStato('errore');
    }
  }

  function ricomincia() {
    setInviati(null);
    setErrori({});
    setStato('pronto');
  }

  if (stato === 'inviato' && inviati) {
    const data = new Date(`${inviati.data}T12:00:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    return (
      <div className={s.successo} role="status">
        <h3 className={s.titoloOk} ref={titoloOk} tabIndex={-1}>{testi.successo.titolo}</h3>
        <p className={s.testoOk}>{testi.successo.testo.replace('{nome}', inviati.nome.split(' ')[0]).replace('{telefono}', inviati.telefono)}</p>
        <dl className={s.riassunto}>
          <div><dt>{testi.campi.data}</dt><dd>{data}</dd></div>
          <div><dt>{testi.campi.ora}</dt><dd>{inviati.ora}</dd></div>
          <div><dt>{testi.campi.persone}</dt><dd>{inviati.persone}</dd></div>
          {inviati.allergie && <div><dt>{testi.campi.allergie}</dt><dd>{inviati.allergie}</dd></div>}
        </dl>
        {anteprima && <p className={s.anteprima}>{testi.anteprima}</p>}
        <button type="button" className="btn btn--linea" onClick={ricomincia}>{testi.successo.nuova}</button>
      </div>
    );
  }

  const elencoErrori = (Object.entries(errori) as [Campo, string][]).filter(([, m]) => m);
  const attr = (c: Campo, aiuto = false) => ({
    id: campoId(c),
    name: c,
    'aria-invalid': errori[c] ? true : undefined,
    'aria-describedby': [errori[c] ? errId(c) : '', aiuto ? aiutoId(c) : ''].filter(Boolean).join(' ') || undefined,
  });
  const errore = (c: Campo) => (errori[c] ? <p className={s.errore} id={errId(c)}>{errori[c]}</p> : null);
  const fascePranzo = servizi.pranzo ? fasce(servizi.pranzo.orari) : [];
  const fasceCena = servizi.cena ? fasce(servizi.cena.orari) : [];
  const conFasce = fascePranzo.length + fasceCena.length > 0;

  return (
    <form
      ref={modulo}
      className={s.modulo}
      name={NOME_MODULO}
      method="post"
      action={azione}
      noValidate
      onSubmit={invia}
      {...(!anteprima ? { 'data-netlify': 'true', 'netlify-honeypot': 'bot-field' } : {})}
    >
      <input type="hidden" name="form-name" value={NOME_MODULO} />
      <p className={s.nascosto} aria-hidden="true">
        <label>Non compilare<input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
      </p>

      <div ref={riepilogo} tabIndex={-1} className={s.riepilogo} role={elencoErrori.length ? 'alert' : undefined}>
        {elencoErrori.length > 0 && (
          <>
            <p>{testi.errori.riepilogo}</p>
            <ul>
              {elencoErrori.map(([c, m]) => (
                <li key={c}><a href={`#${campoId(c)}`}>{testi.campi[c]}: {m}</a></li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={`${s.campo} ${s.largo}`}>
        <label htmlFor={campoId('nome')}>{testi.campi.nome}</label>
        <input {...attr('nome')} type="text" autoComplete="name" required />
        {errore('nome')}
      </div>
      <div className={s.campo}>
        <label htmlFor={campoId('telefono')}>{testi.campi.telefono}</label>
        <input {...attr('telefono', true)} type="tel" autoComplete="tel" inputMode="tel" required />
        <p className={s.aiuto} id={aiutoId('telefono')}>{testi.aiuti.telefono}</p>
        {errore('telefono')}
      </div>
      <div className={s.campo}>
        <label htmlFor={campoId('email')}>{testi.campi.email} <span className={s.facoltativo}>({testi.facoltativo})</span></label>
        <input {...attr('email')} type="email" autoComplete="email" inputMode="email" />
        {errore('email')}
      </div>
      <div className={s.campo}>
        <label htmlFor={campoId('data')}>{testi.campi.data}</label>
        <input {...attr('data')} type="date" min={min} required />
        {errore('data')}
      </div>
      <div className={s.campo}>
        <label htmlFor={campoId('ora')}>{testi.campi.ora}</label>
        {conFasce ? (
          <select {...attr('ora')} required defaultValue="">
            <option value="" disabled>{testi.scegliOra}</option>
            {fascePranzo.length > 0 && <optgroup label={servizi.pranzo!.nome}>{fascePranzo.map((o) => <option key={o}>{o}</option>)}</optgroup>}
            {fasceCena.length > 0 && <optgroup label={servizi.cena!.nome}>{fasceCena.map((o) => <option key={o}>{o}</option>)}</optgroup>}
          </select>
        ) : (
          <input {...attr('ora')} type="time" step={900} required />
        )}
        {errore('ora')}
      </div>
      <div className={s.campo}>
        <label htmlFor={campoId('persone')}>{testi.campi.persone}</label>
        <select {...attr('persone', true)} required defaultValue="2">
          {Array.from({ length: persone }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
        </select>
        <p className={s.aiuto} id={aiutoId('persone')}>{testi.aiuti.persone}</p>
        {errore('persone')}
      </div>
      <div className={`${s.campo} ${s.largo}`}>
        <label htmlFor={campoId('allergie')}>{testi.campi.allergie} <span className={s.facoltativo}>({testi.facoltativo})</span></label>
        <input {...attr('allergie', true)} type="text" />
        <p className={s.aiuto} id={aiutoId('allergie')}>{testi.aiuti.allergie}</p>
      </div>
      <div className={`${s.campo} ${s.largo}`}>
        <label htmlFor={campoId('note')}>{testi.campi.note} <span className={s.facoltativo}>({testi.facoltativo})</span></label>
        <textarea {...attr('note', true)} rows={3} />
        <p className={s.aiuto} id={aiutoId('note')}>{testi.aiuti.note}</p>
      </div>

      <div className={`${s.invio} ${s.largo}`}>
        <p className={s.avviso}>{testi.avviso}</p>
        <p className={s.privacy}>
          {testi.privacy} {testi.informativa}
          {anteprima && <span className="dc">{daCollegare}</span>}
        </p>
        <button className="btn btn--accento" type="submit" disabled={stato === 'invio'}>
          {stato === 'invio' ? testi.invio : testi.invia}
        </button>
        {stato === 'errore' && <p className={s.errore} role="alert">{testi.errori.invio}</p>}
        {anteprima && <p className={s.anteprima}>{testi.anteprima}</p>}
      </div>
    </form>
  );
}
