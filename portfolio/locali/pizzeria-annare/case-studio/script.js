v// script.js
document.addEventListener('DOMContentLoaded', () => {

    // DATABASE DINAMICO DEI CASE STUDY PER IL CAMBIO ANTEPRIMA
    const caseStudiesData = {
        annare: {
            headerTitle: "Pizzeria Annarè — <span>Anteprima Progetto Web</span>",
            title: "Pizzeria Annarè",
            desc: "Sito ad alta conversione progettato per azzerare le commissioni delle app terze e catturare prenotazioni direct via WhatsApp.",
            kpi1: "+100%",
            kpi1Label: "Direct Booking",
            kpi2: "-77%",
            kpi2Label: "Chiamate Perse",
            url: "demo-preview.agenzia.it/pizzeria-annare",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80"
        },
        rusticana: {
            headerTitle: "Trattoria La Rusticana — <span>Anteprima Progetto Web</span>",
            title: "Trattoria La Rusticana",
            desc: "Valorizzazione del territorio e posizionamento SEO locale per saturare i coperti infrasettimanali e attrarre il turismo enogastronomico.",
            kpi1: "+163%",
            kpi1Label: "Coperti Mar-Gio",
            kpi2: "+1.941%",
            kpi2Label: "Traffico Google",
            url: "demo-preview.agenzia.it/trattoria-la-rusticana",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80"
        },
        crust: {
            headerTitle: "Crust & Craft Pub — <span>Anteprima Progetto Web</span>",
            title: "Crust & Craft Pub",
            desc: "Layout dinamico mobile-first con menu QR live, promozione fascia Early Bird e pre-ordine take-away veloci.",
            kpi1: "+246%",
            kpi1Label: "Fascia 19:30-21:00",
            kpi2: "-71%",
            kpi2Label: "Tempi d'Attesa",
            url: "demo-preview.agenzia.it/crust-and-craft",
            image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1400&q=80"
        }
    };

    // 1. SWITCHER CASE STUDY DEMO
    const caseTabs = document.querySelectorAll('.case-tab');
    const headerTitle = document.getElementById('headerTitle');
    const caseTitle = document.getElementById('caseTitle');
    const caseDesc = document.getElementById('caseDesc');
    const kpi1 = document.getElementById('kpi1');
    const kpi1Label = document.getElementById('kpi1Label');
    const kpi2 = document.getElementById('kpi2');
    const kpi2Label = document.getElementById('kpi2Label');
    const mockUrl = document.getElementById('mockUrl');
    const demoImage = document.getElementById('demoImage');

    caseTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            caseTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const selectedKey = tab.getAttribute('data-case');
            const data = caseStudiesData[selectedKey];

            if (data) {
                headerTitle.innerHTML = data.headerTitle;
                caseTitle.textContent = data.title;
                caseDesc.textContent = data.desc;
                kpi1.textContent = data.kpi1;
                kpi1Label.textContent = data.kpi1Label;
                kpi2.textContent = data.kpi2;
                kpi2Label.textContent = data.kpi2Label;
                mockUrl.textContent = data.url;
                demoImage.src = data.image;
            }
        });
    });

    // 2. SWITCHER DISPOSITIVI (DESKTOP / TABLET / MOBILE)
    const deviceBtns = document.querySelectorAll('.device-btn');
    const deviceFrame = document.getElementById('deviceFrame');

    deviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deviceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const deviceType = btn.getAttribute('data-device');
            deviceFrame.className = `device-frame ${deviceType}`;
        });
    });

    // 3. PROTEZIONE ANTI-SCAM & BLOCCO SALVATAGGIO IMMAGINE
    const protectedContainer = document.getElementById('protectedContainer');

    // Disabilita Menu Tasto Destro nel contenitore demo
    protectedContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        alert('🔒 Modalità Anteprima Protetta: Il salvataggio delle immagini e l\'ispezione del codice sono disabilitati.');
    });

    // Disabilita Scorciatoie da Tastiera (F12, Ctrl+Shift+I/J, Ctrl+U)
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
            e.preventDefault();
            alert('🔒 Modalità Anteprima Protetta dall\'Agenzia.');
        }
    });

    // 4. GESTIONE MODALE SPECIFICHE TECNICHE
    const btnSpecs = document.getElementById('btnSpecs');
    const specsModal = document.getElementById('specsModal');
    const closeModal = document.getElementById('closeModal');

    if (btnSpecs && specsModal && closeModal) {
        btnSpecs.addEventListener('click', () => specsModal.classList.add('open'));
        closeModal.addEventListener('click', () => specsModal.classList.remove('open'));
        window.addEventListener('click', (e) => {
            if (e.target === specsModal) specsModal.classList.remove('open');
        });
    }

});