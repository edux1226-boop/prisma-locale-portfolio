// RETROSCENA – comportamenti della pagina (JavaScript semplice, nessuna libreria).

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Menu mobile ---------- */
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav-principale');

function setNav(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
}

toggle.addEventListener('click', () => {
  setNav(toggle.getAttribute('aria-expanded') !== 'true');
});

// Il menu si chiude dopo un clic su una voce o con il tasto Esc.
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setNav(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setNav(false);
});

/* ---------- Comparsa graduale dei riquadri ---------- */
const reveals = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => io.observe(el));
}

/* ---------- Voce di menu attiva in base alla sezione ---------- */
const links = [...nav.querySelectorAll('a')];
const sections = links
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => {
        const current = a.getAttribute('href') === `#${entry.target.id}`;
        if (current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
}

/* ---------- Note interne: si aprono con ?note=1 ---------- */
if (new URLSearchParams(location.search).get('note') === '1') {
  document.getElementById('note-interne').hidden = false;
}
