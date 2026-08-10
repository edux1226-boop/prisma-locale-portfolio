document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. HEADER STICKY & NAVBAR MOBILE
       ========================================== */
    const mainHeader = document.getElementById('mainHeader');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle Sticky Header Class
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Menu Toggle
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = hamburgerBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Chiudi menu al click sui link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = hamburgerBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    /* ==========================================
       2. FILTRAGGIO MENU DIGITALE
       ========================================== */
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuItemCards = document.querySelectorAll('.menu-item-card');

    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Rimuovi classe active da tutti i tab
            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            menuItemCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    });

    /* ==========================================
       3. IMPOSTAZIONE DATA MINIMA PRENOTAZIONE
       ========================================== */
    const bookingDateInput = document.getElementById('bookingDate');
    if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.setAttribute('min', today);
    }

    /* ==========================================
       4. INVIO FORM PRENOTAZIONE (SIMULAZIONE CON CONFERMA)
       ========================================== */
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const guests = document.getElementById('guests').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;

            // Messaggio di conferma professionale
            const confirmMsg = `Grazie ${fullName}! La tua prenotazione per ${guests} persone in data ${date} alle ore ${time} è stata presa in carico.\n\nTi invieremo un SMS o WhatsApp di conferma al numero: ${phone}.`;
            
            alert(confirmMsg);
            bookingForm.reset();
        });
    }

    /* ==========================================
       5. ANIMAZIONE ELEMENTI SULLO SCROLL
       ========================================== */
    const revealElements = document.querySelectorAll('.reveal-element');

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger iniziale per elementi visibili

    /* ==========================================
       6. ACTIVE STATE LINK SU NAVIGATION
       ========================================== */
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    });

});