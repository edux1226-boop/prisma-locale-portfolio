/* Il titolo dell'apertura lievita: lettera per lettera, la Fraunces passa da
   sottile e spigolosa (SOFT 0) a piena e morbida (SOFT 100). L'animazione è
   CSS (@property --soft); qui si divide il testo e si aspetta il carattere. */
export async function initLievita() {
  const titolo = document.querySelector('[data-lievita]');
  if (!titolo) return;
  const testo = titolo.textContent.trim();
  try {
    await Promise.race([
      document.fonts.load('760 1em "Fraunces Anima"'),
      new Promise((resolve) => { setTimeout(resolve, 1200); }),
    ]);
  } catch {
    /* senza carattere si anima lo stesso */
  }
  let i = 0;
  const visibile = document.createElement('span');
  visibile.setAttribute('aria-hidden', 'true');
  testo.split(' ').forEach((parola, n, parole) => {
    const p = document.createElement('span');
    p.className = 'parola';
    for (const ch of parola) {
      const l = document.createElement('span');
      l.className = 'lettera';
      l.style.setProperty('--i', String(i++));
      l.textContent = ch;
      p.append(l);
    }
    visibile.append(p);
    if (n < parole.length - 1) visibile.append(' ');
  });
  const lettore = document.createElement('span');
  lettore.className = 'sr-only';
  lettore.textContent = testo;
  titolo.replaceChildren(lettore, visibile);
  titolo.classList.add('is-diviso');
}
