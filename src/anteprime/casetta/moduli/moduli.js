/* I moduli (gruppi ed eventi, candidature): controlli gentili, messaggi
   d'errore legati al campo (aria-describedby), focus sul primo errore.
   Nell'anteprima non si invia nulla; online il modulo va a Netlify Forms. */
import { traccia } from './analisi.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_CV = 5 * 1024 * 1024;
const oggi = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const REGOLE = {
  nome: (c) => c.value.trim().length > 1,
  email: (c) => EMAIL.test(c.value.trim()),
  telefono: (c) => c.value.replace(/[^\d]/g, '').length >= 8,
  ospiti: (c) => Number(c.value) >= 1 && Number(c.value) <= 300,
  data: (c) => !c.value || c.value >= oggi(),
  privacy: (c) => c.checked,
  cv: (c) => !c.files?.length || (c.files[0].size <= MAX_CV && /\.(pdf|docx?)$/i.test(c.files[0].name)),
};

function verifica(campo) {
  const ok = REGOLE[campo.dataset.regola](campo);
  const errore = document.getElementById(`${campo.id}-errore`);
  if (ok) campo.removeAttribute('aria-invalid');
  else campo.setAttribute('aria-invalid', 'true');
  campo.closest('.campo')?.classList.toggle('is-errore', !ok);
  if (errore) {
    errore.hidden = ok;
    const descritto = new Set((campo.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    if (ok) descritto.delete(errore.id); else descritto.add(errore.id);
    if (descritto.size) campo.setAttribute('aria-describedby', [...descritto].join(' '));
    else campo.removeAttribute('aria-describedby');
  }
  return ok;
}

export function initModuli() {
  for (const modulo of document.querySelectorAll('[data-modulo]')) {
    const campi = [...modulo.querySelectorAll('[data-regola]')];
    const grazie = modulo.querySelector('[data-modulo-grazie]');
    const online = modulo.hasAttribute('data-netlify');
    for (const c of campi) {
      if (c.type === 'date') c.min = oggi();
      const evento = ['checkbox', 'file', 'date'].includes(c.type) ? 'change' : 'blur';
      c.addEventListener(evento, () => { if (c.hasAttribute('aria-invalid') || c.value || c.type === 'checkbox') verifica(c); });
      c.addEventListener('input', () => { if (c.hasAttribute('aria-invalid')) verifica(c); });
    }
    modulo.addEventListener('submit', (e) => {
      const esiti = campi.map(verifica);
      const primo = campi[esiti.indexOf(false)];
      if (primo) {
        e.preventDefault();
        primo.focus();
        return;
      }
      traccia(modulo.querySelector('[name="cv"]') ? 'candidatura_inviata' : 'richiesta_evento_inviata', { event_category: 'conversion' });
      if (online) return; // va a Netlify Forms
      e.preventDefault();
      const nome = modulo.querySelector('[name="nome"]').value.trim().split(/\s+/)[0];
      const titolo = grazie.querySelector('[data-modello]');
      titolo.textContent = titolo.dataset.modello.replace('{nome}', nome);
      modulo.classList.add('is-inviato');
      grazie.hidden = false;
      grazie.focus();
    });
  }
}
