/* Modulo contatti su Netlify Forms. Senza JavaScript funziona come un
   normale POST verso /grazie.html; con JavaScript invia in background e
   risponde nella pagina, senza cambiare schermata. */
export function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');

  // La validazione resta quella nativa (messaggi già tradotti dal browser):
  // qui si aggiunge solo aria-invalid per i lettori di schermo.
  form.addEventListener('invalid', (event) => event.target.setAttribute('aria-invalid', 'true'), true);
  form.addEventListener('input', (event) => {
    if (event.target.checkValidity?.()) event.target.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form__status';
    status.textContent = 'Invio in corso…';
    form.classList.add('is-sending');

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.classList.add('is-ok');
      status.textContent = 'Grazie! Il messaggio è arrivato: ti rispondiamo presto, di persona.';
    } catch {
      status.classList.add('is-error');
      status.innerHTML =
        'Non siamo riusciti a inviarlo. Scrivici su <a href="https://wa.me/393758350800">WhatsApp</a> ' +
        'o a <a href="mailto:info@prismalocale.it">info@prismalocale.it</a>, facciamo prima.';
    } finally {
      form.classList.remove('is-sending');
    }
  });
}
