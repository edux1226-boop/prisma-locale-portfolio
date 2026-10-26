import './styles/main.css';

/* Composizione: l'HTML è già completo (generato dai dati). Qui si aggiunge solo comportamento.
   Le parti che usano GSAP e Lenis vengono caricate soltanto se il movimento è attivo
   (classe `motion` messa nell'head quando prefers-reduced-motion non è "reduce"). */

const radice = document.documentElement;

if (!radice.classList.contains('is-scaduta')) {
  const avvia = async () => {
    const motion = radice.classList.contains('motion');
    // tutti i moduli partono insieme: nessuna catena di richieste una dopo l'altra
    const [{ initSede }, { initMenu }, { initNavMobile }, { initSmashStatico }, movimento] = await Promise.all([
      import('./core/sede.js'),
      import('./sections/menu.js'),
      import('./sections/navmobile.js'),
      import('./sections/smash.js'),
      motion ? import('./core/movimento.js') : null,
    ]);
    initSede();
    initMenu();
    initNavMobile();
    if (movimento) movimento.avviaMovimento();
    else initSmashStatico();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia, { once: true });
  else avvia();
}
