// Attendi che il DOM sia completamente caricato prima di eseguire lo script
document.addEventListener('DOMContentLoaded', () => {

    // 1. EFFETTO NAVBAR E MENU MOBILE
    // Gestione della barra di navigazione e del menu a comparsa per dispositivi mobili
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Apertura/Chiusura del menu hamburger al clic sull'icona
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navLinks.classList.toggle('is-active');
        });
    }

    // Chiudi automaticamente il menu quando si clicca su un link di navigazione
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('is-active');
            navLinks.classList.remove('is-active');
        });
    });

    // Cambia l'aspetto della navbar quando l'utente scorre la pagina
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled'); // Aggiunge colore di sfondo
        } else {
            navbar.classList.remove('scrolled'); // Torna trasparente
        }
    });

    // 2. SCORRIMENTO FLUIDO (SMOOTH SCROLL)
    // Gestisce il clic sui link interni (#chi-siamo, #servizi, etc.) per uno scorrimento morbido
    const links = document.querySelectorAll('a[href^="#"]');
    for (const link of links) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset per evitare che la navbar fissa copra l'inizio della sezione
                const headerOffset = 5;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // 3. ANIMAZIONI ALL'APPARIZIONE (INTERSECTION OBSERVER)
    // Fa apparire gli elementi con effetto sfumatura quando entrano nella visuale
    const observerOptions = {
        threshold: 0.1,         // Trigger quando il 10% dell'elemento è visibile
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-el'); // Classe CSS che attiva l'animazione
                observer.unobserve(entry.target);    // Anima l'elemento solo la prima volta
            }
        });
    }, observerOptions);

    // Seleziona tutti gli elementi che devono essere animati
    const hiddenElements = document.querySelectorAll('.hidden-el, .fade-in-up');
    hiddenElements.forEach((el) => observer.observe(el));

    // 4. LOGICA CAROUSEL (GALLERIE FOTOGRAFICHE)
    // Gestisce lo slider di foto in ogni sezione (Camere, Spazi, etc.)
    const initCarousel = (container) => {
        const track = container.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = container.querySelector('.carousel-btn.next');
        const prevButton = container.querySelector('.carousel-btn.prev');
        const indicatorsContainer = container.querySelector('.carousel-indicators');

        let currentIndex = 0;

        // Crea dinamicamente i puntini (indicatori) in base al numero di foto
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => moveToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        const indicators = Array.from(indicatorsContainer.children);

        // Aggiorna lo stato visivo dei puntini indicatori
        const updateIndicators = (index) => {
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === index);
            });
        };

        // Muove lo slider alla foto corrispondente all'indice
        const moveToSlide = (index) => {
            if (index < 0) index = slides.length - 1;   // Torna all'ultima foto
            if (index >= slides.length) index = 0;      // Torna alla prima foto

            currentIndex = index;
            const amountToMove = -currentIndex * 100;
            track.style.transform = `translateX(${amountToMove}%)`;
            updateIndicators(currentIndex);
        };

        // Listener per i pulsanti Avanti e Indietro
        nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));
        prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));
    };

    // Inizializza tutti i carousel presenti nella pagina
    const carousels = document.querySelectorAll('.carousel-outer');
    carousels.forEach(initCarousel);

    // 5. NAVIGAZIONE ATTIVA (SCROLLSPY)
    // Illumina la voce del menu corrispondente alla sezione che l'utente sta leggendo
    const sections = document.querySelectorAll('section, footer');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = "";

        // Caso speciale: se l'utente è arrivato in fondo, evidenzia senz'altro "Contatti"
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            current = "contatti";
        } else {
            // Altrimenti trova la sezione più vicina alla parte alta dello schermo
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });
        }

        // Applica o rimuove la classe 'active' dai link del menu
        navItems.forEach((item) => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // 6. MODULO PRENOTAZIONE (MESSAGGIO DI SUCCESSO)
    // Simula l'invio della richiesta sostituendo il modulo con un messaggio di conferma
    const bookingForm = document.querySelector('.booking-container form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const container = document.querySelector('.booking-container');

            container.style.opacity = '0'; // Sfumatura in uscita
            setTimeout(() => {
                container.innerHTML = `
                    <div class="text-center py-large fade-in-up">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                        <h2 style="color: var(--secondary-color);">Richiesta Inviata!</h2>
                        <p class="text-muted">Ti ricontatteremo al più presto per confermare.</p>
                        <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">Indietro</button>
                    </div>
                `;
                container.style.opacity = '1'; // Sfumatura in entrata
            }, 300);
        });
    }

    // 7. TASTO "TORNA IN ALTO"
    // Gestisce il comportamento del pulsante fluttuante e del logo per risalire a inizio pagina
    const backToTopBtn = document.getElementById('backToTop');
    const logoLink = document.querySelector('.navbar .logo');

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
        });
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
        // Mostra il pulsante solo dopo aver scollato un certo numero di pixel
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
    }

    // 8. LOGICA SLIDER RECENSIONI
    // Gestisce lo scorrimento delle recensioni (Booking/Google)
    const reviewsTrack = document.getElementById('reviewsTrack');
    const revPrev = document.getElementById('revPrev');
    const revNext = document.getElementById('revNext');

    if (reviewsTrack && revPrev && revNext) {
        let revIndex = 0;
        const slides = reviewsTrack.querySelectorAll('.reviews-slide');
        const totalSlides = slides.length;

        const updateReviewsSlider = () => {
            const amountToMove = -revIndex * 100;
            reviewsTrack.style.transform = `translateX(${amountToMove}%)`;
        };

        revNext.addEventListener('click', () => {
            revIndex = (revIndex + 1) % totalSlides;
            updateReviewsSlider();
        });

        revPrev.addEventListener('click', () => {
            revIndex = (revIndex - 1 + totalSlides) % totalSlides;
            updateReviewsSlider();
        });
    }

    // 9. AGGIORNAMENTO AUTOMATICO ANNO COPYRIGHT
    // Calcola l'anno corrente per il piede della pagina in modo dinamico
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        const startYear = 2026; // Anno di lancio del sito
        const currentYear = new Date().getFullYear();
        // Se siamo oltre l'anno di inizio, mostra l'intervallo (es: 2026 - 2027)
        yearSpan.textContent = currentYear > startYear ? `${startYear} - ${currentYear}` : currentYear;
    }
});
