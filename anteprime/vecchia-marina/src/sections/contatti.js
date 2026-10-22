/* La mappa di Google si carica solo se la si chiede: fino ad allora c'è la
   carta nautica disegnata, che non scarica niente e non mette cookie. */
const MAPPA = 'https://maps.google.com/maps?q=Vecchia%20Marina%2C%20Lungomare%20Trento%2037%2C%20Roseto%20degli%20Abruzzi&z=16&output=embed';

export function initContatti() {
  const figura = document.querySelector('[data-mappa]');
  // l'onda sul punto (un'animazione SVG, non composta) gira solo quando si vede
  new IntersectionObserver(([voce]) => figura.classList.toggle('is-vista', voce.isIntersecting)).observe(figura);
  const bottone = figura.querySelector('[data-mappa-carica]');
  bottone.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = MAPPA;
    iframe.title = 'Mappa: Vecchia Marina, Lungomare Trento 37, Roseto degli Abruzzi';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    figura.querySelector('.carta-nautica__disegno').append(iframe);
    figura.classList.add('is-caricata');
    iframe.focus();
  }, { once: true });
}
