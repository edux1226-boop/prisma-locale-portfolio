document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. STICKY HEADER & SCROLL EFFECT
       ========================================== */
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================
       2. MOBILE MENU TOGGLE
       ========================================== */
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');

    hamburger.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // Chiudi il menu quando si clicca un link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
        });
    });

    /* ==========================================
       3. FILTRI MENU INTERATTIVI
       ========================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Rimuovi classe active dai bottoni
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            menuCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ==========================================
       4. GESTIONE MODAL PRENOTAZIONE
       ========================================== */
    const modal = document.getElementById('bookingModal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const bookingForm = document.getElementById('bookingForm');

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Invio Form di Prenotazione (Simulato)
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const guests = document.getElementById('guests').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;

        // Feedback utente
        alert(`Grazie ${name}! La tua richiesta per ${guests} persone il giorno ${date} alle ore ${time} è stata inviata con successo. Ti confermeremo la prenotazione al numero ${phone}.`);
        
        // Reset e chiusura
        bookingForm.reset();
        modal.style.display = 'none';
    });

    /* ==========================================
       5. HIGHLIGHT NAVBAR LINK SU SCROLL
       ========================================== */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});