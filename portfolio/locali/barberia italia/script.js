document.addEventListener('DOMContentLoaded', () => {

  // 1. STICKY NAVBAR SU SCROLL
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. MENU HAMBURGER MOBILE
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Chiudi menu su click di una voce
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  // 3. CURSORE PERSONALIZZATO (DESKTOP)
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (window.innerWidth > 991 && cursor && follower) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      follower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });
  }

  // 4. ANIMAZIONI AL SCROLL (SCROLL REVEAL)
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 100;
      if (elementTop < windowHeight - elementVisible) {
        el.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger iniziale

  // 5. CONTAGIRI ANIMATO STATISTICHE
  let statsTriggered = false;
  const statNumbers = document.querySelectorAll('.stat-number');

  const animateStats = () => {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;
    const topPos = aboutSection.getBoundingClientRect().top;
    
    if (topPos < window.innerHeight - 150 && !statsTriggered) {
      statsTriggered = true;
      statNumbers.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        let count = 0;
        const speed = target / 30; // durata
        const updateCount = () => {
          count += speed;
          if (count < target) {
            stat.innerText = Math.ceil(count);
            setTimeout(updateCount, 40);
          } else {
            stat.innerText = target;
          }
        };
        updateCount();
      });
    }
  };

  window.addEventListener('scroll', animateStats);

  // 6. RECENSIONI SLIDER MODERNO
  const reviews = document.querySelectorAll('.review-card');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let currentReview = 0;

  const showReview = (index) => {
    reviews.forEach((r, i) => {
      r.classList.remove('active');
      if (i === index) r.classList.add('active');
    });
  };

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      currentReview = (currentReview + 1) % reviews.length;
      showReview(currentReview);
    });

    prevBtn.addEventListener('click', () => {
      currentReview = (currentReview - 1 + reviews.length) % reviews.length;
      showReview(currentReview);
    });

    // Auto-slide ogni 6 secondi
    setInterval(() => {
      currentReview = (currentReview + 1) % reviews.length;
      showReview(currentReview);
    }, 6000);
  }

  // 7. LIGHTBOX PER GALLERIA
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  galleryItems.forEach(img => {
    img.addEventListener('click', () => {
      lightbox.style.display = 'flex';
      lightboxImg.src = img.src;
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        lightbox.style.display = 'none';
      }
    });
  }

});