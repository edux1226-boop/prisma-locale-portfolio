/* Modulo di richiesta appuntamento.
   Mai una conferma finta: il messaggio "richiesta ricevuta" compare solo se
   l'Apps Script risponde { ok: true }. Con data-endpoint vuoto si usa
   WhatsApp (data-whatsapp) oppure si dice che l'invio online non è attivo. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIMEOUT_MS = 15000;

const oggi = () => {
  const d = new Date();
  const mese = String(d.getMonth() + 1).padStart(2, '0');
  const giorno = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mese}-${giorno}`;
};

const recapitoValido = (v) => {
  const t = v.trim();
  return EMAIL.test(t) || (/^[\d\s+().-]+$/.test(t) && t.replace(/\D/g, '').length >= 6);
};

/* I recapiti già inseriti dalla titolare (link veri, non segnaposto). */
function recapitiReali() {
  const voci = [...document.querySelectorAll('#contatti [data-recapito]')]
    .filter((n) => n.tagName === 'A' && !n.classList.contains('segnaposto') && !n.classList.contains('is-segnaposto'))
    .map((n) => n.textContent.trim());
  return voci.length ? voci.join(' · ') : null;
}

const paragrafoRecapiti = () => {
  const reali = recapitiReali();
  return reali ? `Contatta il centro: ${reali}.` : 'Contatta il centro usando i recapiti nella sezione <a href="#contatti">Informazioni pratiche</a>.';
};

const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function initPrenota() {
  const form = document.querySelector('[data-prenota]');
  if (!form) return;
  const stato = form.querySelector('[data-stato]');
  const bottone = form.querySelector('button[type="submit"]');
  const campoData = form.querySelector('[name="data"]');
  campoData.min = oggi();

  const regole = [
    { nome: 'nome', ok: (c) => c.value.trim().length >= 2 },
    { nome: 'recapito', ok: (c) => recapitoValido(c.value) },
    { nome: 'trattamento', ok: (c) => c.value !== '' },
    { nome: 'data', ok: (c) => c.value !== '' && c.value >= oggi() },
    { nome: 'fascia', ok: (c) => c.value !== '' },
    { nome: 'privacy', ok: (c) => c.checked },
  ].map((r) => ({ ...r, campo: form.elements[r.nome], errore: form.querySelector(`#e-${r.nome}`) }));

  const verifica = (r) => {
    const valido = r.ok(r.campo);
    r.errore.hidden = valido;
    if (valido) r.campo.removeAttribute('aria-invalid');
    else r.campo.setAttribute('aria-invalid', 'true');
    const descritto = new Set((r.campo.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    if (valido) descritto.delete(r.errore.id); else descritto.add(r.errore.id);
    if (descritto.size) r.campo.setAttribute('aria-describedby', [...descritto].join(' '));
    else r.campo.removeAttribute('aria-describedby');
    return valido;
  };

  for (const r of regole) {
    const evento = r.campo.type === 'checkbox' || r.campo.tagName === 'SELECT' ? 'change' : 'blur';
    r.campo.addEventListener(evento, () => verifica(r));
    r.campo.addEventListener('input', () => { if (r.campo.hasAttribute('aria-invalid')) verifica(r); });
  }

  // "Richiedi questo trattamento": preseleziona la voce, poi il link scorre al modulo.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-trattamento]');
    if (!link) return;
    const voce = form.querySelector(`[name="trattamento"] option[value="${CSS.escape(link.dataset.trattamento)}"]`);
    if (voce) form.elements.trattamento.value = voce.value;
  });

  const mostra = (tipo, html) => {
    stato.className = `stato${tipo ? ` is-${tipo}` : ''}`;
    stato.innerHTML = html;
  };

  const messaggioWhatsapp = (d) =>
    `Ciao, vorrei richiedere un appuntamento da Chris Beauty.\nNome: ${d.nome}\nRecapito: ${d.recapito}\n` +
    `Trattamento: ${form.elements.trattamento.selectedOptions[0].textContent}\nData preferita: ${d.data}\nFascia oraria: ${form.elements.fascia.selectedOptions[0].textContent}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const esiti = regole.map(verifica);
    if (esiti.includes(false)) {
      regole[esiti.indexOf(false)].campo.focus();
      mostra('errore', 'Controlla i campi evidenziati: manca qualche informazione.');
      return;
    }
    mostra('', '');

    const dati = Object.fromEntries(new FormData(form));
    // Campo trappola compilato: solo un bot. Si finge un invio, senza inviare nulla.
    if (dati['sito-web']) { form.reset(); return; }

    const endpoint = form.dataset.endpoint.trim();
    const numero = form.dataset.whatsapp.replace(/\D/g, '');

    if (endpoint) {
      bottone.disabled = true;
      form.setAttribute('aria-busy', 'true');
      mostra('', 'Invio della richiesta…');
      const controllo = new AbortController();
      const timer = setTimeout(() => controllo.abort(), TIMEOUT_MS);
      try {
        // Richiesta "semplice" (form-urlencoded): niente preflight CORS, e la risposta
        // resta leggibile, così sappiamo davvero se il foglio ha registrato la riga.
        const risposta = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(new FormData(form)), signal: controllo.signal });
        if (!risposta.ok) throw new Error(`HTTP ${risposta.status}`);
        const esito = await risposta.json();
        if (esito.ok !== true) throw new Error('risposta negativa');
        const nome = esc(dati.nome.trim().split(/\s+/)[0]);
        form.reset();
        mostra('ok',
          `<strong>Richiesta ricevuta, grazie ${nome}.</strong> Non è ancora un appuntamento confermato: ` +
          `Chris Beauty ti ricontatta per confermare giorno e orario. Per modificare o annullare la richiesta: ${paragrafoRecapiti()}`);
      } catch (errore) {
        console.error('Invio richiesta non riuscito:', errore);
        mostra('errore', `<strong>La richiesta non è stata inviata.</strong> Riprova tra poco. ${paragrafoRecapiti()}`);
      } finally {
        clearTimeout(timer);
        bottone.disabled = false;
        form.removeAttribute('aria-busy');
      }
    } else if (numero) {
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(messaggioWhatsapp(dati))}`;
      window.open(url, '_blank', 'noopener');
      mostra('', `Si apre WhatsApp con la richiesta già scritta: <strong>inviala da lì</strong>. Finché non la invii, il centro non la riceve. ` +
        `Se non si è aperto, <a href="${url}" target="_blank" rel="noopener">apri WhatsApp da qui</a>.`);
    } else {
      mostra('errore', `<strong>Le richieste online non sono ancora attive.</strong> Per prenotare ${paragrafoRecapiti().replace(/^Contatta/, 'contatta')} I dati che hai inserito restano nel modulo.`);
    }
    stato.focus();
  });
}
