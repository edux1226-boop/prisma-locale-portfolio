document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Sticky & Scroll Background
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Custom Cursor Glow Effect
    const cursorGlow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    // 3. Scroll Reveal Animations via Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Anima una sola volta
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Form Submit Handler Placeholder
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Grazie! Abbiamo ricevuto la tua richiesta. Ti contatteremo nelle prossime 24 ore.');
            contactForm.reset();
        });
    }

    // 5. Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(7, 11, 20, 0.95)';
            navLinks.style.padding = '20px 0';
        });
    }
});