/* Il modulo: validazione gentile, nessun invio. Nella demo mostra solo
   come risponderebbe il sito definitivo. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initRichiesta() {
  const modulo = document.querySelector('[data-modulo]');
  const grazie = modulo.querySelector('[data-modulo-grazie]');
  const regole = [
    { campo: modulo.querySelector('#f-nome'), errore: '#e-nome', ok: (c) => c.value.trim().length > 1 },
    { campo: modulo.querySelector('#f-email'), errore: '#e-email', ok: (c) => EMAIL.test(c.value.trim()) },
    { campo: modulo.querySelector('[name="privacy"]'), errore: '#e-privacy', ok: (c) => c.checked },
  ];

  const verifica = (regola) => {
    const valido = regola.ok(regola.campo);
    const errore = modulo.querySelector(regola.errore);
    if (valido) regola.campo.removeAttribute('aria-invalid');
    else regola.campo.setAttribute('aria-invalid', 'true');
    regola.campo.closest('.campo')?.classList.toggle('is-errore', !valido);
    errore.classList.toggle('is-visibile', !valido);
    const descritto = new Set((regola.campo.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    if (valido) descritto.delete(errore.id); else descritto.add(errore.id);
    if (descritto.size) regola.campo.setAttribute('aria-describedby', [...descritto].join(' '));
    else regola.campo.removeAttribute('aria-describedby');
    return valido;
  };

  for (const regola of regole) {
    regola.campo.addEventListener(regola.campo.type === 'checkbox' ? 'change' : 'blur', () => {
      if (regola.campo.hasAttribute('aria-invalid') || regola.campo.value) verifica(regola);
    });
  }

  modulo.addEventListener('submit', (e) => {
    e.preventDefault();
    const esiti = regole.map(verifica);
    const primo = regole[esiti.indexOf(false)];
    if (primo) { primo.campo.focus(); return; }
    modulo.querySelector('[data-modulo-nome]').textContent = regole[0].campo.value.trim().split(/\s+/)[0];
    modulo.classList.add('is-inviato');
    grazie.focus();
  });
}
