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
        if (window.scrollY > 10) { // Molto più reattivo (era 50)
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            // Se siamo in cima alla pagina, pulisci ogni evidenziazione dello ScrollSpy
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        }
    });

    // 2. SCORRIMENTO FLUIDO (SMOOTH SCROLL) - Gestito via CSS (scroll-behavior: smooth)
    // Rimosso JS manuale per velocità nativa e offset automatico

    // 3. ANIMAZIONI ALL'APPARIZIONE (INTERSECTION OBSERVER)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-el');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden-el, .fade-in-up');
    hiddenElements.forEach((el) => observer.observe(el));

    // 4. SCROLLSPY: Evidenzia il link della navbar corrispondente alla sezione visibile
    const scrollSpyOptions = {
        threshold: [0.1, 0.5, 0.8], // Aumentata sensibilità per sezioni di diversa altezza
        rootMargin: "-15% 0px -25% 0px" // Finestra di rilevamento più naturale
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (!id) return;
                
                document.querySelectorAll('.nav-links a').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.classList.add('active');
                    } else if (href && href.startsWith('#')) {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    // Sezioni da monitorare per lo ScrollSpy
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    sections.forEach(section => scrollSpyObserver.observe(section));

    // 5. LOGICA CAROUSEL (GALLERIE FOTOGRAFICHE)
    // Gestisce lo slider di foto in ogni sezione (Camere, Spazi, etc.)
    const initCarousel = (container) => {
        const track = container.querySelector('.carousel-track');
        let slides = Array.from(track.children);
        const indicatorsContainer = container.querySelector('.carousel-indicators');
        const nextButton = container.querySelector('.carousel-btn.next');
        const prevButton = container.querySelector('.carousel-btn.prev');

        // CLONAZIONE PER LOOP INFINITO
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slides.length - 1].cloneNode(true);

        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);

        // Aggiorna l'elenco delle slide dopo il clonaggio
        slides = Array.from(track.children);

        let currentIndex = 1; // Partiamo dalla prima foto "vera" (indice 1 perché c'è il clone in testa)
        let isDragging = false;
        let startX = 0;
        let diffX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;

        // Crea dinamicamente i puntini (indicatori) basati solo sulle slide ORIGINALI
        const originalCount = slides.length - 2;
        for (let i = 0; i < originalCount; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => moveToSlide(i + 1));
            indicatorsContainer.appendChild(indicator);
        }

        const indicators = Array.from(indicatorsContainer.children);

        const updateIndicators = (index) => {
            // Mapping dell'indice (1 to originalCount) verso (0 to originalCount-1)
            let indicatorIndex = index - 1;
            if (index === 0) indicatorIndex = originalCount - 1;
            if (index === slides.length - 1) indicatorIndex = 0;

            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === indicatorIndex);
            });
        };

        const isMobile = () => window.innerWidth <= 1024;

        const setPositionByIndex = (smooth = true) => {
            if (isMobile()) {
                track.scrollTo({
                    left: currentIndex * track.offsetWidth,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            } else {
                currentTranslate = -currentIndex * container.offsetWidth;
                prevTranslate = currentTranslate;
                track.style.transition = smooth ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
                track.style.transform = `translateX(${currentTranslate}px)`;
            }
        };

        const moveToSlide = (index) => {
            currentIndex = index;
            setPositionByIndex();
            updateIndicators(currentIndex);
        };

        // Click sui pulsanti (Desktop)
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex++;
                setPositionByIndex();
                updateIndicators(currentIndex);

                // Se siamo sul clone finale, dopo l'animazione saltiamo all'inizio
                if (currentIndex === slides.length - 1) {
                    setTimeout(() => {
                        track.style.scrollBehavior = 'auto';
                        currentIndex = 1;
                        setPositionByIndex(false);
                    }, 550); // Leggermente più della transizione CSS (500ms)
                }
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex--;
                setPositionByIndex();
                updateIndicators(currentIndex);

                // Se siamo sul clone iniziale, dopo l'animazione saltiamo alla fine
                if (currentIndex === 0) {
                    setTimeout(() => {
                        track.style.scrollBehavior = 'auto';
                        currentIndex = slides.length - 2;
                        setPositionByIndex(false);
                    }, 550);
                }
            });
        }

        // Inizializzazione posizione (partiamo dalla slide 1)
        setTimeout(() => setPositionByIndex(false), 100);

        // GESTIONE INFINITA SU MOBILE (Scroll Listener)
        let isRedirecting = false;
        track.addEventListener('scroll', () => {
            if (!isMobile() || isRedirecting) return;

            const scrollLeft = track.scrollLeft;
            const width = track.offsetWidth;

            // Se arriviamo sui cloni (estremi del nastro), saltiamo istantaneamente
            if (scrollLeft <= 0) {
                isRedirecting = true;
                currentIndex = slides.length - 2;
                track.scrollTo({ left: currentIndex * width, behavior: 'auto' });
                setTimeout(() => isRedirecting = false, 100);
            } else if (scrollLeft >= (slides.length - 1) * width - 1) {
                isRedirecting = true;
                currentIndex = 1;
                track.scrollTo({ left: currentIndex * width, behavior: 'auto' });
                setTimeout(() => isRedirecting = false, 100);
            } else {
                const newIndex = Math.round(scrollLeft / width);
                if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slides.length) {
                    currentIndex = newIndex;
                    updateIndicators(currentIndex);
                }
            }
        });

        // SWIPE MANUAL (Solo Desktop / Mouse)
        track.addEventListener('pointerdown', (e) => {
            if (isMobile() || e.pointerType !== 'mouse') return;
            isDragging = true;
            startX = e.clientX;
            track.style.transition = 'none';
            track.classList.add('grabbing');
        });

        track.addEventListener('pointermove', (e) => {
            if (!isDragging || isMobile() || e.pointerType !== 'mouse') return;
            diffX = e.clientX - startX;
            track.style.transform = `translateX(${prevTranslate + diffX}px)`;
        });

        const handleMouseUp = (e) => {
            if (!isDragging || isMobile() || e.pointerType !== 'mouse') return;
            isDragging = false;
            track.classList.remove('grabbing');
            const threshold = container.offsetWidth * 0.15;

            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) currentIndex--;
                else currentIndex++;
            }

            moveToSlide(currentIndex);

            // Loop infinito per mouse
            if (currentIndex === 0) {
                setTimeout(() => moveToSlide(slides.length - 2), 500);
            } else if (currentIndex === slides.length - 1) {
                setTimeout(() => moveToSlide(1), 500);
            }
            diffX = 0;
        };

        track.addEventListener('pointerup', handleMouseUp);
        track.addEventListener('pointerleave', handleMouseUp);

        window.addEventListener('resize', () => {
            if (isMobile()) {
                // Su mobile lo scroll snap gestisce il resize meglio
            } else {
                track.style.transition = 'none';
                setPositionByIndex(false);
            }
        });
    };

    // Inizializza tutti i carousel presenti nella pagina
    const carousels = document.querySelectorAll('.carousel-outer');
    carousels.forEach(initCarousel);

    // Lo ScrollSpy è ora gestito dal sistema IntersectionObserver configurato nella Sezione 4

    // 6. MODULO PRENOTAZIONE (MESSAGGIO DI SUCCESSO)
    // Simula l'invio della richiesta sostituendo il modulo con un messaggio di conferma
    const bookingForm = document.querySelector('.booking-container form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const container = document.querySelector('.booking-container');

            container.style.opacity = '0'; // Sfumatura in uscita
            setTimeout(() => {
                const title = translations[currentLang]["modal-success-title"];
                const desc = translations[currentLang]["modal-success-desc"];
                const btn = translations[currentLang]["modal-back"];

                container.innerHTML = `
                    <div class="text-center py-large fade-in-up">
                        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                        <h2 style="color: var(--secondary-color);">${title}</h2>
                        <p class="text-muted">${desc}</p>
                        <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">${btn}</button>
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
        const langSwitcher = document.getElementById('langSwitcher');
        backToTopBtn.addEventListener('click', scrollToTop);
        // Mostra il pulsante solo dopo aver scollato un certo numero di pixel
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
                if (langSwitcher) langSwitcher.classList.add('shifted');
            } else {
                backToTopBtn.classList.remove('visible');
                if (langSwitcher) langSwitcher.classList.remove('shifted');
            }
        });
    }

    // 8. LOGICA SLIDER RECENSIONI CON AUTOPLAY
    // Gestisce lo scorrimento automatico delle recensioni (Booking/Google)
    const reviewsTrack = document.getElementById('reviewsTrack');

    if (reviewsTrack) {
        let revIndex = 0;
        const slides = reviewsTrack.querySelectorAll('.reviews-slide');
        const totalSlides = slides.length;

        const updateReviewsSlider = () => {
            const isMob = window.innerWidth <= 1024;
            // Su mobile scorriamo di 100% (una slide), su desktop di 50% (una slide alla volta ma ne vediamo due)
            const step = isMob ? 100 : 50;
            const amountToMove = -revIndex * step;
            reviewsTrack.style.transform = `translateX(${amountToMove}%)`;
        };

        // Autoplay: cambia slide ogni 5 secondi
        setInterval(() => {
            const isMob = window.innerWidth <= 1024;
            // Su desktop ne vediamo 2 alla volta, quindi il limite di indici è totalSlides - 1
            // ma l'ultimo indice "sicuro" che mostra ancora 2 slide è totalSlides - 2
            const maxIndex = isMob ? totalSlides : totalSlides - 1;

            revIndex++;
            if (revIndex >= maxIndex) {
                revIndex = 0;
            }
            updateReviewsSlider();
        }, 5000);

        window.addEventListener('resize', updateReviewsSlider);
    }

    // 9. AGGIORNAMENTO AUTOMATICO ANNO COPYRIGHT
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        const startYear = 2026;
        const currentYear = new Date().getFullYear();
        yearSpan.textContent = currentYear > startYear ? `${startYear} - ${currentYear}` : currentYear;
    }

    // 10. MOTORE DI TRADUZIONE (MULTILINGUA)
    const translations = {
        it: {
            "nav-home": "Home",
            "nav-about": "Chi Siamo",
            "nav-rooms": "Camere",
            "nav-spaces": "Spazi",
            "nav-services": "Servizi",
            "nav-rules": "Regole",
            "nav-location": "Dove Siamo",
            "nav-reviews": "Recensioni",
            "nav-contacts": "Contatti",
            "nav-book": "Prenota Ora",
            "nav-language-select": "Seleziona Lingua",
            "hero-title": "Benvenuti a Napoli",
            "hero-subtitle": "Scopri il fascino della città partenopea soggiornando in un ambiente raffinato ed accogliente.",
            "hero-btn": "Verifica Disponibilità",
            "about-history": "La Nostra Storia",
            "about-tradition": "Tradizione & Ospitalità",
            "about-p1": "Il <strong>B&B Marinella</strong> nasce nel 2025, appena ristrutturato e dotato di ogni comfort, con un obiettivo preciso: far conoscere ai nostri ospiti la vera ospitalità napoletana attraverso una gestione autenticamente familiare.",
            "about-p2": "La nostra struttura si trova all’interno del suggestivo <strong>Fondaco di Via San Gregorio Armeno</strong>, nel cuore del centro storico di Napoli. Il fondaco è uno degli ultimi sopravviviuti al “Risanamento” dell’Ottocento: uno spazio unico, simile a una piccola piazza interna sulla quale si affacciano edifici che ricordano dei veri e propri palazzi.",
            "about-sanmartino": "Si racconta che proprio in questo fondaco nacque <strong>Giuseppe Sanmartino</strong>, lo scultore del celebre <em>Cristo Velato</em> custodito nella Cappella Sansevero, a pochi passi dalla nostra struttura. Un dettaglio che rende questo luogo ancora più carico di storia, arte e fascino.",
            "about-interiors": "Gli interni moderni ed eleganti si fondono con il calore della tradizione, creando un ambiente accogliente e raffinato. Ogni dettaglio è stato pensato per farvi sentire a casa, offrendovi un rifugio di pace e comfort dopo una giornata trascorsa tra i vicoli, i musei, le meraviglie artistiche e il mare della nostra città.",
            "rooms-title": "Le Nostre Stanze",
            "rooms-subtitle": "Soggiorna nel Lusso di Napoli",
            "room-badge-comfort": "Comfort",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Suite Vesuvio",
            "room-partenope": "Suite Partenope",
            "room-price-from": "A partire da",
            "room-night": "/ notte",
            "room-guests-v": "1 - 2 Ospiti",
            "room-guests-p": "2 - 3 Ospiti*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Bambini inclusi</small>",
            "room-kids": "*Bambini inclusi",
            "room-bed-french": "Letto alla Francese",
            "room-bed-king": "Letto Matrimoniale King",
            "room-bed-partenope": "King Size + Letto Extra",
            "room-bath": "Bagno Privato",
            "room-vesuvio-desc": "Un rifugio accogliente ed essenziale. Dispone di un confortevole <strong>letto matrimoniale alla francese</strong> (piazza e mezza), ideale per chi cerca praticità e comfort nel cuore di Napoli a un prezzo vantaggioso.",
            "room-partenope-desc": "La nostra proposta più esclusiva e spaziosa. Dotata di un <strong>ampio letto matrimoniale</strong>, con la possibilità di aggiungere un <strong>letto singolo extra</strong>. Perfetta per chi desidera il massimo del lusso e dello spazio.",
            "room-btn-vesuvio": "Prenota Vesuvio",
            "room-btn-partenope": "Prenota Partenope",
            "spaces-section-title": "Aree Comuni e Dintorni",
            "spaces-title": "Galleria degli Spazi",
            "spaces-lobby-title": "Ingresso e Aree Comuni",
            "spaces-exterior-title": "Esterni e La Nostra Strada",
            "services-title": "I Nostri Servizi & Esperienze",
            "service-cat1": "Bagno & Benessere",
            "service-bath-pvt": "Bagno privato",
            "service-bath-prod": "Prodotti da bagno in omaggio",
            "service-bath-robe": "Accappatoio e Pantofole",
            "service-bath-towels": "Asciugamani e Carta igienica",
            "service-bath-hair": "Asciugacapelli",
            "service-bath-extra": "Servizi igienici aggiuntivi",
            "service-cat2": "Comfort in Camera",
            "service-bed-premium": "Biancheria da letto premium",
            "service-room-closet": "Armadio / Guardaroba",
            "service-room-power": "Presa elettrica vicino al letto",
            "service-ac-heat": "Aria condizionata e Riscaldamento",
            "service-room-allergy": "Camera anallergica",
            "service-room-smoke": "Camere non fumatori",
            "service-cat3": "Connettività & Media",
            "service-wifi-text": "<strong>WiFi Fibra Super Veloce</strong><br>Gratuito e adatto per streaming 4K, smart working e videochiamate.",
            "service-cat4": "Gusto & Praticità",
            "service-coffee": "Bollitore tè / Macchina caffè",
            "service-fridge": "Frigorifero",
            "service-kettle": "Bollitore elettrico",
            "service-cat5": "Sicurezza & Supporto",
            "service-key": "Accesso con chiavi magnetiche",
            "service-security": "Sicurezza 24 ore su 24",
            "service-checkin-out": "Check-in/out privati",
            "service-cameras": "Telecamere zone comuni",
            "service-cleaning": "Pulizie",
            "service-luggage": "Deposito bagagli",
            "service-breakfast": "Colazione Inclusa Sempre",
            "service-breakfast-desc": "Sperimenta la vera cultura napoletana con la colazione servita in un bar tipico nelle vicinanze.",
            "offer-badge-guest": "Speciale Ospiti",
            "offer-badge-taste": "Gusto Locale",
            "offer-neapolis-title": "La Neapolis Sotterrata",
            "offer-neapolis-desc": "Approfitta degli <strong>sconti esclusivi</strong> sul biglietto intero per la visita guidata al Complesso Monumentale di San Lorenzo Maggiore in Piazza San Gaetano.",
            "offer-neapolis-note": "*Ticket sconto fornito direttamente in struttura",
            "offer-rest-title": "Ristoranti Partner",
            "offer-rest-desc": "Abbiamo selezionato per te i migliori ristoranti locali dove potrai cenare con <strong>tariffe agevolate</strong> riservate ai nostri ospiti.",
            "offer-rest-note": "*Sconti validi in cassa presso i locali convenzionati",
            "rules-title": "Informazioni Utili",
            "rules-subtitle": "Regole della Casa",
            "rule-arrival": "Arrivo",
            "rule-arrival-desc": "Dalle 08:00 alle 20:00",
            "rule-departure": "Partenza",
            "rule-departure-desc": "Dalle 08:00 alle 10:00",
            "rule-smoke": "Fumo",
            "rule-smoke-desc": "Fumare non è consentito",
            "rule-pets": "Animali",
            "rule-pets-desc": "Animali non ammessi",
            "rule-quiet": "Rumore",
            "rule-quiet-desc": "Dalle 00:00 alle 08:00 si prega di osservare il massimo silenzio",
            "rule-events": "Feste",
            "rule-events-desc": "Non è permesso organizzare feste o eventi",
            "poi-title": "La Nostra Posizione",
            "poi-subtitle": "Dove Siamo",
            "poi-desc": "Ci troviamo in una posizione strategica, a pochi passi dalle principali attrazioni turistiche e ben collegati con i mezzi pubblici.",
            "poi-heart": "Nel cuore di Spaccanapoli",
            "poi-maps": "Apri in Google Maps",
            "poi-walking": "Nelle Vicinanze",
            "poi-icons": "Icone di Napoli",
            "poi-transport": "Trasporti",
            "reviews-title": "Dicono di noi",
            "reviews-subtitle": "Recensioni degli Ospiti",
            "reviews-desc": "La vostra soddisfazione è il nostro miglior biglietto da visita. Ecco cosa pensa chi ha già soggiornato da noi.",
            "footer-luxury": "Lusso e Tradizione",
            "footer-rights": "Tutti i diritti riservati.",
            "review-btn": "Lascia una Recensione su Google",
            "review-note": "La tua opinione è preziosa per noi!",
            "modal-title": "Richiesta Prenotazione",
            "modal-room-label": "Stanza Selezionata",
            "modal-checkin": "Arrivo (Check-in)",
            "modal-checkout": "Partenza (Check-out)",
            "modal-name": "Nome e Cognome",
            "modal-name-placeholder": "Il tuo nome",
            "modal-guests": "Ospiti",
            "modal-guests-placeholder-v": "Max 2 persone",
            "modal-guests-placeholder-p": "Max 3 persone",
            "modal-dates-placeholder": "Arrivo - Partenza",
            "modal-message": "Messaggio / Richieste",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "Email",
            "email-subject": "Richiesta Prenotazione - ",
            "modal-loading": "Controllo disponibilità...",
            "modal-success-title": "Richiesta Inviata!",
            "modal-success-desc": "Ti ricontatteremo al più presto per confermare.",
            "modal-back": "Indietro",
            "wa-greet": "Ciao io sono ",
            "wa-want-to-book": " e vorrei prenotare la camera ",
            "wa-for": " per ",
            "wa-people": " persone ",
            "wa-dates-from": " per queste date: dal ",
            "wa-to": " al ",
            "modal-booking-prefix": "Prenota "
        },
        en: {
            "nav-home": "Home",
            "nav-about": "About Us",
            "nav-rooms": "Rooms",
            "nav-spaces": "Spaces",
            "nav-services": "Services",
            "nav-rules": "Rules",
            "nav-location": "Location",
            "nav-reviews": "Reviews",
            "nav-contacts": "Contacts",
            "nav-book": "Book Now",
            "nav-language-select": "Select Language",
            "hero-title": "Welcome to Naples",
            "hero-subtitle": "Discover the charm of the Neapolitan city staying in a refined and welcoming environment.",
            "hero-btn": "Check Availability",
            "about-history": "Our History",
            "about-tradition": "Tradition & Hospitality",
            "about-p1": "<strong>B&B Marinella</strong> was born in 2025, newly renovated and equipped with every comfort, with a clear goal: to introduce our guests to true Neapolitan hospitality through authentic family management.",
            "about-p2": "Our structure is located within the suggestive <strong>Fondaco of Via San Gregorio Armeno</strong>, in the heart of the historic center of Naples. The fondaco is one of the last survivors of the 19th-century 'Risanamento': a unique space, similar to a small internal square overlooked by buildings reminiscent of real palaces.",
            "about-sanmartino": "It is said that in this very fondaco was born <strong>Giuseppe Sanmartino</strong>, the sculptor of the famous <em>Veiled Christ</em> kept in the Sansevero Chapel, just a few steps from our structure. A detail that makes this place even more full of history, art and charm.",
            "about-interiors": "The modern and elegant interiors blend with the warmth of tradition, creating a welcoming and refined environment. Every detail has been thought to make you feel at home, offering you a refuge of peace and comfort after a day spent among the alleys, museums, artistic wonders and the sea of our city.",
            "rooms-title": "Our Rooms",
            "rooms-subtitle": "Stay in the Luxury of Naples",
            "room-badge-comfort": "Comfort",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Vesuvio Suite",
            "room-partenope": "Partenope Suite",
            "room-price-from": "Starting from",
            "room-night": "/ night",
            "room-guests-v": "1 - 2 Guests",
            "room-guests-p": "2 - 3 Guests*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Children included</small>",
            "room-kids": "*Children included",
            "room-bed-french": "French Double Bed",
            "room-bed-king": "King Size Double Bed",
            "room-bed-partenope": "King Size + Extra Bed",
            "room-bath": "Private Bathroom",
            "room-vesuvio-desc": "A cozy and essential refuge. It features a comfortable <strong>French double bed</strong>, ideal for those seeking practicality and comfort in the heart of Naples at an advantageous price.",
            "room-partenope-desc": "Our most exclusive and spacious proposal. Equipped with a <strong>large double bed</strong>, with the possibility of adding an <strong>extra single bed</strong>. Perfect for those who want the maximum luxury and space.",
            "room-btn-vesuvio": "Book Vesuvio",
            "room-btn-partenope": "Book Partenope",
            "spaces-section-title": "Common Areas and Surroundings",
            "spaces-title": "Gallery of Spaces",
            "spaces-lobby-title": "Entrance and Common Areas",
            "spaces-exterior-title": "Exterior and Our Street",
            "services-title": "Our Services & Experiences",
            "service-cat1": "Bathroom & Wellness",
            "service-bath-pvt": "Private bathroom",
            "service-bath-prod": "Complimentary toiletries",
            "service-bath-robe": "Bathrobe and Slippers",
            "service-bath-towels": "Towels and Toilet paper",
            "service-bath-hair": "Hairdryer",
            "service-bath-extra": "Additional toilets",
            "service-cat2": "Room Comfort",
            "service-bed-premium": "Premium bedding",
            "service-room-closet": "Closet / Wardrobe",
            "service-room-power": "Power socket near the bed",
            "service-ac-heat": "Air conditioning and Heating",
            "service-room-allergy": "Hypoallergenic room",
            "service-room-smoke": "Non-smoking rooms",
            "service-cat3": "Connectivity & Media",
            "service-wifi-text": "<strong>Super Fast Fiber WiFi</strong><br>Free and suitable for 4K streaming, smart working and video calls.",
            "service-cat4": "Taste & Convenience",
            "service-coffee": "Tea Kettle / Coffee Machine",
            "service-fridge": "Refrigerator",
            "service-kettle": "Electric Kettle",
            "service-cat5": "Security & Support",
            "service-key": "Access with magnetic keys",
            "service-security": "24h Security",
            "service-checkin-out": "Private Check-in/out",
            "service-cameras": "Common area cameras",
            "service-cleaning": "Cleaning",
            "service-luggage": "Luggage storage",
            "service-breakfast": "Breakfast Always Included",
            "service-breakfast-desc": "Experience true Neapolitan culture with breakfast served in a typical bar nearby.",
            "offer-badge-guest": "Guest Special",
            "offer-badge-taste": "Local Taste",
            "offer-neapolis-title": "Underground Neapolis",
            "offer-neapolis-desc": "Take advantage of <strong>exclusive discounts</strong> on full tickets for the guided tour of the San Lorenzo Maggiore Monumental Complex in Piazza San Gaetano.",
            "offer-neapolis-note": "*Discount ticket provided directly at the property",
            "offer-rest-title": "Partner Restaurants",
            "offer-rest-desc": "We have selected for you the best local restaurants where you can dine with <strong>discounted rates</strong> reserved for our guests.",
            "offer-rest-note": "*Discounts valid at the counter of partner venues",
            "rules-title": "Useful Information",
            "rules-subtitle": "House Rules",
            "rule-arrival": "Arrival",
            "rule-arrival-desc": "From 08:00 to 20:00",
            "rule-departure": "Departure",
            "rule-departure-desc": "From 08:00 to 10:00",
            "rule-smoke": "Smoking",
            "rule-smoke-desc": "Smoking is not allowed",
            "rule-pets": "Pets",
            "rule-pets-desc": "Pets not allowed",
            "rule-quiet": "Quiet",
            "rule-quiet-desc": "From 00:00 to 08:00 please observe maximum silence",
            "rule-events": "Events",
            "rule-events-desc": "No parties or events allowed",
            "poi-title": "Our Position",
            "poi-subtitle": "Location",
            "poi-desc": "We are located in a strategic position, a few steps from the main tourist attractions and well connected by public transport.",
            "poi-heart": "In the heart of Spaccanapoli",
            "poi-maps": "Open in Google Maps",
            "poi-walking": "Nearby",
            "poi-icons": "Naples Icons",
            "poi-transport": "Transportation",
            "reviews-title": "About us",
            "reviews-subtitle": "Guest Reviews",
            "reviews-desc": "Your satisfaction is our best business card. Here is what those who have already stayed with us think.",
            "footer-luxury": "Luxury and Tradition",
            "footer-rights": "All rights reserved.",
            "review-btn": "Leave a Review on Google",
            "review-note": "Your opinion is valuable to us!",
            "modal-title": "Booking Request",
            "modal-room-label": "Selected Room",
            "modal-checkin": "Arrival (Check-in)",
            "modal-checkout": "Departure (Check-out)",
            "modal-name": "Full Name",
            "modal-name-placeholder": "Your name",
            "modal-guests": "Guests",
            "modal-guests-placeholder-v": "Max 2 guests",
            "modal-guests-placeholder-p": "Max 3 guests",
            "modal-dates-placeholder": "Check-in - Check-out",
            "modal-message": "Message / Requests",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "Email",
            "email-subject": "Booking Request - ",
            "modal-loading": "Checking availability...",
            "modal-success-title": "Request Sent!",
            "modal-success-desc": "We will contact you as soon as possible to confirm.",
            "modal-back": "Back",
            "wa-greet": "Hi, I am ",
            "wa-want-to-book": " and I would like to book the ",
            "wa-for": " for ",
            "wa-people": " people ",
            "wa-dates-from": " for these dates: from ",
            "wa-to": " to ",
            "modal-booking-prefix": "Book "
        },
        fr: {
            "nav-home": "Accueil",
            "nav-about": "À Propos",
            "nav-rooms": "Chambres",
            "nav-spaces": "Espaces",
            "nav-services": "Services",
            "nav-rules": "Règles",
            "nav-location": "Emplacement",
            "nav-reviews": "Avis",
            "nav-contacts": "Contacts",
            "nav-book": "Réserver",
            "nav-language-select": "Choisir la Langue",
            "hero-title": "Bienvenue à Naples",
            "hero-subtitle": "Découvrez le charme de la ville napolitaine en séjournant dans un cadre raffiné et accueillant.",
            "hero-btn": "Vérifier la Disponibilité",
            "about-history": "Notre Histoire",
            "about-tradition": "Tradition & Hospitalité",
            "about-p1": "Le <strong>B&B Marinella</strong> est né en 2025, fraîchement rénové et équipé de tout le confort, avec un objectif précis : faire découvrir à nos clients la véritable hospitalité napolitaine à travers une gestion familiale authentique.",
            "about-p2": "Notre structure est située dans le suggestif <strong>Fondaco de Via San Gregorio Armeno</strong>, au cœur du centre historique de Naples. Le fondaco est l'un des derniers survivants du « Risanamento » du XIXe siècle : un espace unique, semblable à une petite place intérieure sur laquelle donnent des bâtiments rappelant de véritables palais.",
            "about-sanmartino": "On raconte que c'est dans ce fondaco qu'est né <strong>Giuseppe Sanmartino</strong>, le sculpteur du célèbre <em>Christ Voilé</em> conservé dans la Chapelle Sansevero, à quelques pas de notre structure. Un detail qui rend ce lieu encore plus chargé d'histoire, d'art et de charme.",
            "about-interiors": "Les intérieurs modernes et élégants se mêlent à la chaleur de la tradition, créant un environnement accueillant et raffiné. Chaque détail a été pensé pour vous faire sentir chez vous, vous offrant un refuge de paix et de confort après une journée passée parmi les ruelles, les musées, les merveilles artistiques et la mer de notre ville.",
            "rooms-title": "Nos Chambres",
            "rooms-subtitle": "Séjournez dans le Luxe de Naples",
            "room-badge-comfort": "Confort",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Suite Vesuvio",
            "room-partenope": "Suite Partenope",
            "room-price-from": "À partir de",
            "room-night": "/ nuit",
            "room-guests-v": "1 - 2 Personnes",
            "room-guests-p": "2 - 3 Personnes*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Enfants inclus</small>",
            "room-kids": "*Enfants inclus",
            "room-bed-french": "Lit Double Français",
            "room-bed-king": "Grand Lit Double King",
            "room-bed-partenope": "King Size + Lit Supplémentaire",
            "room-bath": "Salle de Bain Privée",
            "room-vesuvio-desc": "Un refuge accueillant et essentiel. Dispose d'un confortable <strong>lit double français</strong> (place et demie), idéal pour ceux qui recherchent praticité et confort au cœur de Naples à un prix avantageux.",
            "room-partenope-desc": "Notre proposition la plus exclusive et spacieuse. Dotée d'un <strong>large lit double</strong>, avec la possibilité d'ajouter un <strong>lit simple supplémentaire</strong>. Parfaite pour ceux qui désirent le maximum de luxe et d'espace.",
            "room-btn-vesuvio": "Réserver Vesuvio",
            "room-btn-partenope": "Réserver Partenope",
            "spaces-section-title": "Espaces Communs et Environs",
            "spaces-title": "Galerie des Espaces",
            "spaces-lobby-title": "Entrée et Espaces Communs",
            "spaces-exterior-title": "Extérieur et Notre Rue",
            "services-title": "Nos Services & Expériences",
            "service-cat1": "Bain & Bien-être",
            "service-bath-pvt": "Salle de bain privée",
            "service-bath-prod": "Produits de toilette offerts",
            "service-bath-robe": "Peignoir et Pantoufles",
            "service-bath-towels": "Serviettes et Papier toilette",
            "service-bath-hair": "Sèche-cheveux",
            "service-bath-extra": "Toilettes supplémentaires",
            "service-cat2": "Confort en Chambre",
            "service-bed-premium": "Linge de bed premium",
            "service-room-closet": "Armoire / Penderie",
            "service-room-power": "Prise électrique près du lit",
            "service-ac-heat": "Climatisation et Chauffage",
            "service-room-allergy": "Chambre hypoallergénique",
            "service-room-smoke": "Chambres non-fumeurs",
            "service-cat3": "Connectivité & Médias",
            "service-wifi-text": "<strong>WiFi Fibre Ultra Rapide</strong><br>Gratuit et adapté au streaming 4K, au télétravail et aux appels vidéo.",
            "service-cat4": "Goût & Praticité",
            "service-coffee": "Bouilloire thé / Machine à café",
            "service-fridge": "Réfrigérateur",
            "service-kettle": "Bouilloire électrique",
            "service-cat5": "Sécurité & Support",
            "service-key": "Accès avec clés magnétiques",
            "service-security": "Sécurité 24h/24",
            "service-checkin-out": "Check-in/out privés",
            "service-cameras": "Caméras zones communes",
            "service-cleaning": "Nettoyage",
            "service-luggage": "Bagagerie",
            "service-breakfast": "Petit-déjeuner toujours inclus",
            "service-breakfast-desc": "Vivez la véritable culture napolitaine avec le petit-déjeuner servi dans un bar typique à proximité.",
            "offer-badge-guest": "Spécial Clients",
            "offer-badge-taste": "Goût Local",
            "offer-neapolis-title": "La Neapolis Souterraine",
            "offer-neapolis-desc": "Profitez de <strong>réductions exclusives</strong> sur le billet complet pour la visite guidée du Complexe Monumental de San Lorenzo Maggiore sur la Piazza San Gaetano.",
            "offer-neapolis-note": "*Ticket de réduction fourni directement dans la structure",
            "offer-rest-title": "Restaurants Partenaires",
            "offer-rest-desc": "Nous avons sélectionné pour vous les meilleurs restaurants locaux où vous pourrez dîner avec des <strong>tarifs préférentiels</strong> réservés à nos clients.",
            "offer-rest-note": "*Réductions valables à la caisse des établissements partenaires",
            "rules-title": "Informations Utiles",
            "rules-subtitle": "Règles de la Maison",
            "rule-arrival": "Arrivée",
            "rule-arrival-desc": "De 08:00 à 20:00",
            "rule-departure": "Départ",
            "rule-departure-desc": "De 08:00 à 10:00",
            "rule-smoke": "Tabac",
            "rule-smoke-desc": "Il est interdit de fumer",
            "rule-pets": "Animaux",
            "rule-pets-desc": "Animaux non admis",
            "rule-quiet": "Bruit",
            "rule-quiet-desc": "De 00:00 à 08:00, merci de respecter le silence maximum",
            "rule-events": "Fêtes",
            "rule-events-desc": "Il n'est pas permis d'organiser des fêtes ou des événements",
            "poi-title": "Notre Position",
            "poi-subtitle": "Emplacement",
            "poi-desc": "Nous sommes situés dans une position stratégique, à quelques pas des principales attractions touristiques et bien desservis par les transports en commun.",
            "poi-heart": "Au cœur de Spaccanapoli",
            "poi-maps": "Ouvrir dans Google Maps",
            "poi-walking": "À Proximité",
            "poi-icons": "Icônes de Naples",
            "poi-transport": "Transports",
            "reviews-title": "Ils parlent de nous",
            "reviews-subtitle": "Avis des Clients",
            "reviews-desc": "Votre satisfaction est notre meilleure carte de visite. Voici ce qu'en pensent ceux qui ont déjà séjourné chez nous.",
            "footer-luxury": "Luxe et Tradition",
            "footer-rights": "Tous droits réservés.",
            "review-btn": "Laisser un avis sur Google",
            "review-note": "Votre avis est précieux pour nous !",
            "modal-title": "Demande de Réservation",
            "modal-room-label": "Chambre Sélectionnée",
            "modal-checkin": "Arrivée (Check-in)",
            "modal-checkout": "Départ (Check-out)",
            "modal-name": "Nom et Prénom",
            "modal-name-placeholder": "Votre nom",
            "modal-guests": "Personnes",
            "modal-guests-placeholder-v": "Max 2 personnes",
            "modal-guests-placeholder-p": "Max 3 personnes",
            "modal-dates-placeholder": "Arrivée - Départ",
            "modal-message": "Message / Demandes",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "Email",
            "email-subject": "Demande de Réservation - ",
            "modal-loading": "Vérification de la disponibilité...",
            "modal-success-title": "Demande Envoyée !",
            "modal-success-desc": "Nous vous recontacterons dès que possible pour confirmer.",
            "modal-back": "Retour",
            "wa-greet": "Bonjour, je suis ",
            "wa-want-to-book": " et je voudrais réserver la chambre ",
            "wa-for": " pour ",
            "wa-people": " personnes ",
            "wa-dates-from": " pour ces dates: du ",
            "wa-to": " au ",
            "modal-booking-prefix": "Réserver "
        },
        es: {
            "nav-home": "Inicio",
            "nav-about": "Sobre Nosotros",
            "nav-rooms": "Habitaciones",
            "nav-spaces": "Espacios",
            "nav-services": "Servicios",
            "nav-rules": "Reglas",
            "nav-location": "Ubicación",
            "nav-reviews": "Reseñas",
            "nav-contacts": "Contactos",
            "nav-book": "Reservar",
            "nav-language-select": "Seleccionar Idioma",
            "hero-title": "Bienvenidos a Nápoles",
            "hero-subtitle": "Descubre el encanto de la ciudad napolitana alojándote en un ambiente refinado y acogedor.",
            "hero-btn": "Consultar Disponibilidad",
            "about-history": "Nuestra Historia",
            "about-tradition": "Tradición y Hospitalidad",
            "about-p1": "<strong>B&B Marinella</strong> nació en 2025, recién reformado y equipado con todas las comodidades, con un objetivo claro: dar a conocer a nuestros huéspedes la verdadera hospitalidad napolitana a través de una gestión auténticamente familiar.",
            "about-p2": "Nuestra estructura se encuentra dentro del sugestivo <strong>Fondaco de Via San Gregorio Armeno</strong>, en el corazón del centro histórico de Nápoles. El fondaco es uno de los últimos supervivientes del «Risanamento» del siglo XIX: un espacio único, similar a una pequeña plaza interior a la que asoman edificios que recuerdan a verdaderos palacios.",
            "about-sanmartino": "Se dice que en este mismo fondaco nació <strong>Giuseppe Sanmartino</strong>, el escultor del célebre <em>Cristo Velato</em> que se custodia en la Capilla Sansevero, a pocos pasos de nuestra estructura. Un detalle que hace que este lugar esté aún más cargado de historia, arte y encanto.",
            "about-interiors": "Los interiores modernos y elegantes se mezclan con la calidez de la tradición, creando un ambiente acogedor y refinado. Cada detalle ha sido pensado para que te sientas como en casa, ofreciéndote un refugio de paz y confort después de un día entre callejuelas, museos, maravillas artísticas y el mar de nuestra ciudad.",
            "rooms-title": "Nuestras Habitaciones",
            "rooms-subtitle": "Alójate en el Lujo de Nápoles",
            "room-badge-comfort": "Confort",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Suite Vesuvio",
            "room-partenope": "Suite Partenope",
            "room-price-from": "A partir de",
            "room-night": "/ noche",
            "room-guests-v": "1 - 2 Personas",
            "room-guests-p": "2 - 3 Personas*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Niños incluidos</small>",
            "room-kids": "*Niños incluidos",
            "room-bed-french": "Cama de Matrimonio Francesa",
            "room-bed-king": "Cama de Matrimonio King Size",
            "room-bed-partenope": "King Size + Cama Extra",
            "room-bath": "Baño Privado",
            "room-vesuvio-desc": "Un refugio acogedor y esencial. Dispone de una cómoda <strong>cama de matrimonio francesa</strong> (plaza y media), ideal para quienes buscan practicidad y confort en el corazón de Nápoles a un precio ventajoso.",
            "room-partenope-desc": "Nuestra propuesta más exclusiva y espaciosa. Dotada de una <strong>amplia cama de matrimonio</strong>, con la posibilidad de añadir una <strong>cama individual extra</strong>. Perfecta para quienes desean el máximo lujo y espacio.",
            "room-btn-vesuvio": "Reservar Vesuvio",
            "room-btn-partenope": "Reservar Partenope",
            "spaces-section-title": "Áreas Comunes y Alrededores",
            "spaces-title": "Galería de Espacios",
            "spaces-lobby-title": "Entrada y Áreas Comunes",
            "spaces-exterior-title": "Exteriores y Nuestra Calle",
            "services-title": "Nuestros Servicios y Experiencias",
            "service-cat1": "Baño y Bienestar",
            "service-bath-pvt": "Baño privado",
            "service-bath-prod": "Productos de baño de cortesía",
            "service-bath-robe": "Albornoz y Zapatillas",
            "service-bath-towels": "Toallas y Papel higiénico",
            "service-bath-hair": "Secador de pelo",
            "service-bath-extra": "Aseos adicionales",
            "service-cat2": "Confort en la Habitación",
            "service-bed-premium": "Ropa de cama premium",
            "service-room-closet": "Armario / Guardarropa",
            "service-room-power": "Enchufe cerca de la cama",
            "service-ac-heat": "Aire acondicionado y Calefacción",
            "service-room-allergy": "Habitación hipoalergénica",
            "service-room-smoke": "Habitaciones para no fumadores",
            "service-cat3": "Conectividad y Medios",
            "service-wifi-text": "<strong>WiFi de Fibra Superrápida</strong><br>Gratis e ideal para streaming 4K, teletrabajo y videollamadas.",
            "service-cat4": "Sabor y Practicidad",
            "service-coffee": "Hervidor de té / Cafetera",
            "service-fridge": "Frigorífico",
            "service-kettle": "Hervidor eléctrico",
            "service-cat5": "Seguridad y Soporte",
            "service-key": "Acceso con llaves magnéticas",
            "service-security": "Seguridad 24 horas",
            "service-checkin-out": "Check-in/out privados",
            "service-cameras": "Cámaras en zonas comunes",
            "service-cleaning": "Limpieza",
            "service-luggage": "Consigna de equipaje",
            "service-breakfast": "Desayuno siempre incluido",
            "service-breakfast-desc": "Experimenta la verdadera cultura napolitana con el desayuno servido en un bar típico cercano.",
            "offer-badge-guest": "Especial Huéspedes",
            "offer-badge-taste": "Sabor Local",
            "offer-neapolis-title": "La Neapolis Sotterrada",
            "offer-neapolis-desc": "Aprovecha los <strong>descuentos exclusivos</strong> en la entrada completa para la visita guiada al Complejo Monumental de San Lorenzo Maggiore en Piazza San Gaetano.",
            "offer-neapolis-note": "*Ticket de descuento proporcionado directamente en la estructura",
            "offer-rest-title": "Restaurantes Asociados",
            "offer-rest-desc": "Hemos seleccionado para ti los mejores restaurantes locales donde podrás cenar con <strong>tarifas especiales</strong> reservadas a nuestros huéspedes.",
            "offer-rest-note": "*Descuentos válidos en caja en los locales concertados",
            "rules-title": "Información Útil",
            "rules-subtitle": "Reglas de la Casa",
            "rule-arrival": "Llegada",
            "rule-arrival-desc": "De 08:00 a 20:00",
            "rule-departure": "Salida",
            "rule-departure-desc": "De 08:00 a 10:00",
            "rule-smoke": "Fumar",
            "rule-smoke-desc": "No está permitido fumar",
            "rule-pets": "Animales",
            "rule-pets-desc": "No se admiten mascotas",
            "rule-quiet": "Ruido",
            "rule-quiet-desc": "De 00:00 a 08:00 se ruega observar el máximo silencio",
            "rule-events": "Fiestas",
            "rule-events-desc": "No se permite organizar fiestas o eventos",
            "poi-title": "Nuestra Posición",
            "poi-subtitle": "Ubicación",
            "poi-desc": "Nos encontramos en una posición estratégica, a pocos pasos de las principales atracciones turísticas y bien comunicados con el transporte público.",
            "poi-heart": "En el corazón de Spaccanapoli",
            "poi-maps": "Abrir en Google Maps",
            "poi-walking": "Cerca de aquí",
            "poi-icons": "Iconos de Nápoles",
            "poi-transport": "Transporte",
            "reviews-title": "Dicen de nosotros",
            "reviews-subtitle": "Opiniones de los Huéspedes",
            "reviews-desc": "Tu satisfacción es nuestra mejor carta de presentación. Esto es lo que opina quien ya se ha alojado con nosotros.",
            "footer-luxury": "Lujo y Tradición",
            "footer-rights": "Todos los derechos reservados.",
            "review-btn": "Dejar una reseña en Google",
            "review-note": "¡Tu opinión es muy valiosa para nosotros!",
            "modal-title": "Solicitud de Reserva",
            "modal-room-label": "Habitación Seleccionada",
            "modal-checkin": "Llegada (Check-in)",
            "modal-checkout": "Salida (Check-out)",
            "modal-name": "Nombre y Apellidos",
            "modal-name-placeholder": "Tu nombre",
            "modal-guests": "Huéspedes",
            "modal-guests-placeholder-v": "Máx 2 personas",
            "modal-guests-placeholder-p": "Máx 3 personas",
            "modal-dates-placeholder": "Llegada - Salida",
            "modal-message": "Mensaje / Solicitudes",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "Email",
            "email-subject": "Solicitud de Reserva - ",
            "modal-loading": "Comprobando disponibilidad...",
            "modal-success-title": "¡Solicitud Enviada!",
            "modal-success-desc": "Te contactaremos lo antes posible para confirmar.",
            "modal-back": "Atrás",
            "wa-greet": "Hola, soy ",
            "wa-want-to-book": " y me gustaría reservar la habitación ",
            "wa-for": " para ",
            "wa-people": " personas ",
            "wa-dates-from": " para estas fechas: del ",
            "wa-to": " al ",
            "modal-booking-prefix": "Reservar "
        },
        pt: {
            "nav-home": "Início",
            "nav-about": "Sobre Nós",
            "nav-rooms": "Quartos",
            "nav-spaces": "Espaços",
            "nav-services": "Serviços",
            "nav-rules": "Regras",
            "nav-location": "Localização",
            "nav-reviews": "Avaliações",
            "nav-contacts": "Contactos",
            "nav-book": "Reservar",
            "nav-language-select": "Selecionar Idioma",
            "hero-title": "Bem-vindo a Nápoles",
            "hero-subtitle": "Descubra o charme da cidade napolitana hospedando-se num ambiente refinado e acolhedor.",
            "hero-btn": "Verificar Disponibilidade",
            "about-history": "Nossa História",
            "about-tradition": "Tradição & Hospitalidade",
            "about-p1": "O <strong>B&B Marinella</strong> nasceu em 2025, recém-renovado e equipado com todo o conforto, com um objetivo preciso: dar a conhecer aos nossos hóspedes a verdadeira hospitalidade napolitana através de uma gestão autenticamente familiar.",
            "about-p2": "Nossa estrutura encontra-se no sugestivo <strong>Fondaco de Via San Gregorio Armeno</strong>, no coração do centro histórico de Nápoles. O fondaco é um dos últimos sobreviventes do «Risanamento» do século XIX: um espaço único, semelhante a uma pequena praça interna onde se abrem edifícios que lembram verdadeiros palácios.",
            "about-sanmartino": "Diz-se que neste mesmo fondaco nasceu <strong>Giuseppe Sanmartino</strong>, o escultor do célebre <em>Cristo Velato</em> guardado na Capela Sansevero, a poucos passos da nossa estrutura. Um detalhe que torna este lugar ainda mais carregado de história, arte e charme.",
            "about-interiors": "Os interiores modernos e elegantes fundem-se com o calor della tradição, criando um ambiente acolhedor e refinado. Cada detalhe foi pensado para que se sinta em casa, oferecendo-lhe um refúgio de paz e conforto após um dia passado entre as ruelas, os museus, as maravilhas artísticas e o mar da nossa cidade.",
            "rooms-title": "Nossos Quartos",
            "rooms-subtitle": "Hospede-se no Luxo de Nápoles",
            "room-badge-comfort": "Conforto",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Suite Vesuvio",
            "room-partenope": "Suite Partenope",
            "room-price-from": "A partir de",
            "room-night": "/ noite",
            "room-guests-v": "1 - 2 Hóspedes",
            "room-guests-p": "2 - 3 Hóspedes*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Crianças incluídas</small>",
            "room-kids": "*Crianças incluídas",
            "room-bed-french": "Cama de Casal Francesa",
            "room-bed-king": "Cama de Casal King Size",
            "room-bed-partenope": "King Size + Cama Extra",
            "room-bath": "Casa de Banho Privada",
            "room-vesuvio-desc": "Um refúgio acolhedor e essencial. Dispõe de uma confortável <strong>cama de casal francesa</strong>, ideal para quem procura praticidade e conforto no coração de Nápoles a um preço vantajoso.",
            "room-partenope-desc": "Nossa proposta mais exclusiva e espaciosa. Dotada de uma <strong>ampla cama de casal</strong>, com a possibilidade de adicionar uma <strong>cama individual extra</strong>. Perfeita para quem deseja o máximo de luxo e espaço.",
            "room-btn-vesuvio": "Reservar Vesuvio",
            "room-btn-partenope": "Reservar Partenope",
            "spaces-section-title": "Áreas Comuns e Arredores",
            "spaces-title": "Galeria de Espaços",
            "spaces-lobby-title": "Entrada e Áreas Comuns",
            "spaces-exterior-title": "Exteriores e Nossa Rua",
            "services-title": "Nossos Serviços & Experiências",
            "service-cat1": "Banho & Bem-estar",
            "service-bath-pvt": "Casa de banho privada",
            "service-bath-prod": "Produtos de banho de cortesia",
            "service-bath-robe": "Roupão e Chinelos",
            "service-bath-towels": "Toallas e Papel higiénico",
            "service-bath-hair": "Secador de cabelo",
            "service-bath-extra": "Instalações sanitárias adicionais",
            "service-cat2": "Conforto no Quarto",
            "service-bed-premium": "Roupa de cama premium",
            "service-room-closet": "Armário / Roupeiro",
            "service-room-power": "Tomada elétrica perto da cama",
            "service-ac-heat": "Ar condicionado e Aquecimento",
            "service-room-allergy": "Quarto antialérgico",
            "service-room-smoke": "Quartos para não fumadores",
            "service-cat3": "Conetividade & Multimédia",
            "service-wifi-text": "<strong>WiFi de Fibra Super Rápida</strong><br>Gratuito e adequado para streaming 4K, teletrabalho e videochamadas.",
            "service-cat4": "Sabor & Praticidade",
            "service-coffee": "Chaleira de chá / Máquina de café",
            "service-fridge": "Frigorífico",
            "service-kettle": "Chaleira elétrica",
            "service-cat5": "Segurança & Suporte",
            "service-key": "Acesso com chaves magnéticas",
            "service-security": "Segurança 24 horas",
            "service-checkin-out": "Check-in/out privados",
            "service-cameras": "Câmaras nas zonas comuns",
            "service-cleaning": "Limpeza",
            "service-luggage": "Depósito de bagagem",
            "service-breakfast": "Pequeno-almoço sempre incluído",
            "service-breakfast-desc": "Experimente a verdadeira cultura napolitana com o pequeno-almoço servido num bar típico nas proximidades.",
            "offer-badge-guest": "Especial Hóspedes",
            "offer-badge-taste": "Sabor Local",
            "offer-neapolis-title": "La Neapolis Sotterrata",
            "offer-neapolis-desc": "Aproveite os <strong>descontos exclusivos</strong> no bilhete inteiro para a visita guiada ao Complexo Monumental de San Lorenzo Maggiore na Piazza San Gaetano.",
            "offer-neapolis-note": "*Bilhete de desconto fornecido diretamente na estrutura",
            "offer-rest-title": "Restaurantes Parceiros",
            "offer-rest-desc": "Selecionámos para si os melhores restaurantes locais onde poderá jantar com <strong>tarifas especiais</strong> reservadas aos nossos hóspedes.",
            "offer-rest-note": "*Descontos válidos na caixa dos locais convencionados",
            "rules-title": "Informações Úteis",
            "rules-subtitle": "Reglas da Casa",
            "rule-arrival": "Chegada",
            "rule-arrival-desc": "Das 08:00 às 20:00",
            "rule-departure": "Partida",
            "rule-departure-desc": "Das 08:00 às 10:00",
            "rule-smoke": "Fumar",
            "rule-smoke-desc": "Não é permitido fumar",
            "rule-pets": "Animais",
            "rule-pets-desc": "Animais não admitidos",
            "rule-quiet": "Ruído",
            "rule-quiet-desc": "Das 00:00 às 08:00, por favor observe o máximo silêncio",
            "rule-events": "Festas",
            "rule-events-desc": "Não é permitido organizar festas ou eventos",
            "poi-title": "Nossa Localização",
            "poi-subtitle": "Onde Estamos",
            "poi-desc": "Estamos estrategicamente localizados, a poucos passos das principais atrações turísticas e bem ligados aos transportes públicos.",
            "poi-heart": "No coração de Spaccanapoli",
            "poi-maps": "Abrir no Google Maps",
            "poi-walking": "Nas Proximidades",
            "poi-icons": "Ícones de Nápoles",
            "poi-transport": "Transporte",
            "reviews-title": "Dizem de nós",
            "reviews-subtitle": "Avaliações dos Hóspedes",
            "reviews-desc": "Sua satisfação é o nosso melhor cartão de visita. Veja o que dizem aqueles que já se hospedaram connosco.",
            "footer-luxury": "Luxo e Tradição",
            "footer-rights": "Todos os direitos reservados.",
            "review-btn": "Deixar uma avaliação no Google",
            "review-note": "Sua opinião é valiosa para nós!",
            "modal-title": "Pedido de Reserva",
            "modal-room-label": "Quarto Selecionado",
            "modal-checkin": "Chegada (Check-in)",
            "modal-checkout": "Partida (Check-out)",
            "modal-name": "Nome e Apelido",
            "modal-name-placeholder": "Seu nome",
            "modal-guests": "Hóspedes",
            "modal-guests-placeholder-v": "Máx 2 pessoas",
            "modal-guests-placeholder-p": "Máx 3 pessoas",
            "modal-dates-placeholder": "Chegada - Partida",
            "modal-message": "Mensagem / Pedidos",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "E-mail",
            "email-subject": "Pedido de Reserva - ",
            "modal-loading": "A verificar disponibilidade...",
            "modal-success-title": "Pedido Enviado!",
            "modal-success-desc": "Entraremos em contacto o mais breve possível para confirmar.",
            "modal-back": "Voltar",
            "wa-greet": "Olá, eu sou ",
            "wa-want-to-book": " e gostaria de reservar o quarto ",
            "wa-for": " para ",
            "wa-people": " pessoas ",
            "wa-dates-from": " para estas datas: de ",
            "wa-to": " a ",
            "modal-booking-prefix": "Reservar "
        },
        de: {
            "nav-home": "Startseite",
            "nav-about": "Über Uns",
            "nav-rooms": "Zimmer",
            "nav-spaces": "Bereiche",
            "nav-services": "Service",
            "nav-rules": "Regeln",
            "nav-location": "Lage",
            "nav-reviews": "Bewertungen",
            "nav-contacts": "Kontakt",
            "nav-book": "Buchen",
            "nav-language-select": "Sprache Wählen",
            "hero-title": "Willkommen in Neapel",
            "hero-subtitle": "Entdecken Sie den Charme der neapolitanischen Stadt in einem raffinierten und einladenden Ambiente.",
            "hero-btn": "Verfügbarkeit Prüfen",
            "about-history": "Unsere Geschichte",
            "about-tradition": "Tradition & Gastfreundschaft",
            "about-p1": "Das <strong>B&B Marinella</strong> wurde 2025 eröffnet, frisch renoviert und mit jedem Komfort ausgestattet, mit einem klaren Ziel: unseren Gästen die wahre neapolitanische Gastfreundschaft durch eine authentische familiäre Führung näherzubringen.",
            "about-p2": "Unsere Unterkunft befindet sich im malerischen <strong>Fondaco de Via San Gregorio Armeno</strong>, im Herzen der Altstadt von Neapel. Der Fondaco ist einer der letzten Überlebenden des „Risanamento“ aus dem 19. Jahrhundert: ein einzigartiger Raum, ähnlich einem kleinen Innenhof, auf den Gebäude blicken, die an echte Paläste erinnern.",
            "about-sanmartino": "Man erzählt sich, dass genau in diesem Fondaco <strong>Giuseppe Sanmartino</strong> geboren wurde, der Bildhauer des berühmten <em>Cristo Velato</em>, der in der Cappella Sansevero aufbewahrt wird, nur wenige Schritte von uns entfernt. Ein Detail, das diesen Ort noch geschichtsträchtiger und faszinierender macht.",
            "about-interiors": "Die moderne und elegante Einrichtung verschmilzt mit der Wärme der Tradition und schafft eine einladende und raffinierte Atmosphäre. Jedes Detail wurde durchdacht, damit Sie sich wie zu Hause fühlen und nach einem Tag zwischen den Gassen, Museen, Kunstwundern und dem Meer unserer Stadt einen Rückzugsort der Ruhe finden.",
            "rooms-title": "Unsere Zimmer",
            "rooms-subtitle": "Logieren Sie im Luxus von Neapel",
            "room-badge-comfort": "Komfort",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Suite Vesuvio",
            "room-partenope": "Suite Partenope",
            "room-price-from": "Ab",
            "room-night": "/ Nacht",
            "room-guests-v": "1 - 2 Gäste",
            "room-guests-p": "2 - 3 Gäste*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Kinder inklusive</small>",
            "room-kids": "*Kinder inklusive",
            "room-bed-french": "Französisches Doppelbett",
            "room-bed-king": "King-Size-Doppelbett",
            "room-bed-partenope": "King Size + Zustellbett",
            "room-bath": "Privates Badezimmer",
            "room-vesuvio-desc": "Ein gemütlicher und wesentlicher Rückzugsort. Ausgestattet mit einem komfortablen <strong>französischen Doppelbett</strong> (platz und halbe), ideal für alle, die Zweckmäßigkeit und Komfort im Herzen von Neapel zu einem vorteilhaften Preis suchen.",
            "room-partenope-desc": "Unser exklusivstes und geräumigstes Angebot. Ausgestattet mit einem <strong>großen Doppelbett</strong> und der Möglichkeit, ein <strong>zusätzliches Einzelbett</strong> hinzuzufügen. Perfekt für Gäste, die maximalen Luxus und Platz wünschen.",
            "room-btn-vesuvio": "Vesuvio Buchen",
            "room-btn-partenope": "Partenope Buchen",
            "spaces-section-title": "Gemeinschaftsbereiche und Umgebung",
            "spaces-title": "Galerie der Bereiche",
            "spaces-lobby-title": "Eingang und Gemeinschaftsbereiche",
            "spaces-exterior-title": "Außenansicht und Unsere Straße",
            "services-title": "Unsere Dienstleistungen & Erlebnisse",
            "service-cat1": "Bad & Wellness",
            "service-bath-pvt": "Privates Badezimmer",
            "service-bath-prod": "Kostenlose Pflegeprodukte",
            "service-bath-robe": "Bademantel und Hausschuhe",
            "service-bath-towels": "Handtücher und Toilettenpapier",
            "service-bath-hair": "Haartrockner",
            "service-bath-extra": "Zusätzliche WCs",
            "service-cat2": "Zimmerkomfort",
            "service-bed-premium": "Premium-Bettwäsche",
            "service-room-closet": "Kleiderschrank / Garderobe",
            "service-room-power": "Steckdose in Bettnähe",
            "service-ac-heat": "Klimaanlage und Heizung",
            "service-room-allergy": "Allergikerfreundliches Zimmer",
            "service-room-smoke": "Nichtraucherzimmer",
            "service-cat3": "Konnektivität & Medien",
            "service-wifi-text": "<strong>Superschnelles Glasfaser-WLAN</strong><br>Kostenlos und geeignet für 4K-Streaming, Homeoffice und Videoanrufe.",
            "service-cat4": "Genuss & Praktisches",
            "service-coffee": "Teekocher / Kaffeemaschine",
            "service-fridge": "Kühlschrank",
            "service-kettle": "Wasserkocher",
            "service-cat5": "Sicherheit & Support",
            "service-key": "Zugang mit Magnetkarten",
            "service-security": "Sicherheitsdienst 24 Stunden",
            "service-checkin-out": "Privater Check-in/out",
            "service-cameras": "Überwachungskameras in Gemeinschaftsbereichen",
            "service-cleaning": "Reinigung",
            "service-luggage": "Gepäckaufbewahrung",
            "service-breakfast": "Frühstück immer inklusive",
            "service-breakfast-desc": "Erleben Sie echte neapolitanische Kultur beim Frühstück in einer typischen Bar in der Nähe.",
            "offer-badge-guest": "Gäste-Special",
            "offer-badge-taste": "Lokaler Genuss",
            "offer-neapolis-title": "La Neapolis Sotterrata",
            "offer-neapolis-desc": "Nutzen Sie <strong>exklusive Rabatte</strong> auf den vollen Ticketpreis für die Führung durch den Monumental-Komplex von San Lorenzo Maggiore an der Piazza San Gaetano.",
            "offer-neapolis-note": "*Rabatt-Ticket direkt in der Unterkunft erhältlich",
            "offer-rest-title": "Partner-Restaurants",
            "offer-rest-desc": "Wir haben für Sie die besten lokalen Restaurants ausgewählt, in denen Sie zu <strong>Sonderpreisen</strong> für unsere Gäste speisen können.",
            "offer-rest-note": "*Rabatte gültig an der Kasse der teilnehmenden Betriebe",
            "rules-title": "Nützliche Informationen",
            "rules-subtitle": "Hausregeln",
            "rule-arrival": "Anreise",
            "rule-arrival-desc": "Von 08:00 bis 20:00 Uhr",
            "rule-departure": "Abreise",
            "rule-departure-desc": "Von 08:00 bis 10:00 Uhr",
            "rule-smoke": "Rauchen",
            "rule-smoke-desc": "Rauchen ist nicht gestattet",
            "rule-pets": "Haustiere",
            "rule-pets-desc": "Haustiere nicht erlaubt",
            "rule-quiet": "Ruhezeiten",
            "rule-quiet-desc": "Von 00:00 bis 08:00 Uhr wird um absolute Ruhe gebeten",
            "rule-events": "Feiern",
            "rule-events-desc": "Partys oder Veranstaltungen sind nicht erlaubt",
            "poi-title": "Unsere Lage",
            "poi-subtitle": "Wo Wir Sind",
            "poi-desc": "Wir befinden uns in einer strategischen Lage, nur wenige Schritte von den wichtigsten Touristenattraktionen entfernt und mit guter Anbindung an die öffentlichen Verkehrsmittel.",
            "poi-heart": "Im Herzen von Spaccanapoli",
            "poi-maps": "In Google Maps öffnen",
            "poi-walking": "In der Nähe",
            "poi-icons": "Ikonen von Neapel",
            "poi-transport": "Transport",
            "reviews-title": "Über uns",
            "reviews-subtitle": "Gästebewertungen",
            "reviews-desc": "Ihre Zufriedenheit ist unser bestes Aushängeschild. Hier ist die Meinung derer, die bereits bei uns übernachtet haben.",
            "footer-luxury": "Luxus und Tradition",
            "footer-rights": "Alle Rechte vorbehalten.",
            "review-btn": "Bewertung auf Google hinterlassen",
            "review-note": "Ihre Meinung ist uns wichtig!",
            "modal-title": "Buchungsanfrage",
            "modal-room-label": "Ausgewähltes Zimmer",
            "modal-checkin": "Anreise (Check-in)",
            "modal-checkout": "Abreise (Check-out)",
            "modal-name": "Vor- und Nachname",
            "modal-name-placeholder": "Ihr Name",
            "modal-guests": "Gäste",
            "modal-guests-placeholder-v": "Max. 2 Personen",
            "modal-guests-placeholder-p": "Max. 3 Personen",
            "modal-dates-placeholder": "Anreise - Abreise",
            "modal-message": "Nachricht / Anfragen",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "E-Mail",
            "email-subject": "Buchungsanfrage - ",
            "modal-loading": "Verfügbarkeit wird geprüft...",
            "modal-success-title": "Anfrage gesendet!",
            "modal-success-desc": "Wir werden uns so schnell wie möglich mit Ihnen in Verbindung setzen.",
            "modal-back": "Zurück",
            "wa-greet": "Hallo, ich bin ",
            "wa-want-to-book": " und möchte das Zimmer buchen: ",
            "wa-for": " für ",
            "wa-people": " Personen ",
            "wa-dates-from": " für diese Daten: vom ",
            "wa-to": " bis zum ",
            "modal-booking-prefix": "Buchen "
        },
        pl: {
            "nav-home": "Strona Główna",
            "nav-about": "O Nas",
            "nav-rooms": "Pokoje",
            "nav-spaces": "Przestrzenie",
            "nav-services": "Usługi",
            "nav-rules": "Zasady",
            "nav-location": "Lokalizacja",
            "nav-reviews": "Opinie",
            "nav-contacts": "Kontakt",
            "nav-book": "Zarezerwuj",
            "nav-language-select": "Wybierz Język",
            "hero-title": "Witamy w Neapolu",
            "hero-subtitle": "Odkryj urok neapolitańskiego miasta, mieszkając w wyrafinowanym i gościnnym otoczeniu.",
            "hero-btn": "Sprawdź Dostępność",
            "about-history": "Nasza Historia",
            "about-tradition": "Tradycja i Gościnność",
            "about-p1": "<strong>B&B Marinella</strong> powstał w 2025 roku, świeżo odnowiony i wyposażony we wszelkie udogodnienia, z jasnym celem: przybliżyć naszym gościom prawdziwą neapolitańską gościnność poprzez autentyczne, rodzinne zarządzanie.",
            "about-p2": "Nasza struktura znajduje się w urokliwym <strong>Fondaco de Via San Gregorio Armeno</strong>, w samym sercu historycznego centrum Neapolu. Fondaco to jeden z ostatnich ocalałych z XIX-wiecznej przebudowy «Risanamento» : wyjątkowa przestrzeń przypominająca mały wewnętrzny plac, na który wychodzą budynki przypominające prawdziwe pałace.",
            "about-sanmartino": "Mówi się, że właśnie w tym fondaco urodził się <strong>Giuseppe Sanmartino</strong>, rzeźbiarz słynnego <em>Cristo Velato</em> (Chrystusa z Całunu) przechowywanego w Kaplicy Sansevero, zaledwie kilka kroków od nas. Szczegół, który czyni to miejsce jeszcze bardziej przepełnionym historią, sztuką i urokiem.",
            "about-interiors": "Nowoczesne i eleganckie wnętrza łączą się z ciepłem tradycji, tworząc przytulną i wyrafinowaną atmosferę. Każdy detal został przemyślany tak, abyś poczuł się jak w domu, oferując oazę spokoju i komfortu po dniu spędzonym wśród uliczek, muzeów, cudów sztuki i morza naszego miasta.",
            "rooms-title": "Nasze Pokoje",
            "rooms-subtitle": "Zatrzymaj się w luksusie Neapolu",
            "room-badge-comfort": "Komfort",
            "room-badge-premium": "Premium",
            "room-vesuvio": "Suite Vesuvio",
            "room-partenope": "Suite Partenope",
            "room-price-from": "Od",
            "room-night": "/ noc",
            "room-guests-v": "1 - 2 Gości",
            "room-guests-p": "2 - 3 Gości*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*Dzieci wliczone</small>",
            "room-kids": "*Dzieci wliczone",
            "room-bed-french": "Łóżko Małżeńskie Francuskie",
            "room-bed-king": "Łóżko Małżeńskie King Size",
            "room-bed-partenope": "King Size + Dodatkowe Łóżko",
            "room-bath": "Prywatna Łazienka",
            "room-vesuvio-desc": "Przytulny i funkcjonalny azyl. Posiada komfortowe <strong>łóżko małżeńskie francuskie</strong>, idealne dla osób szukających praktyczności i wygody w sercu Neapolu w korzystnej cenie.",
            "room-partenope-desc": "Nasza najbardziej ekskluzywna i przestronna propozycja. Wyposażona w <strong>duże łóżko małżeńskie</strong>, z możliwością dostawienia <strong>dodatkowego łóżka pojedynczego</strong>. Idealna dla osób pragnących maksimum luksusu i przestrzeni.",
            "room-btn-vesuvio": "Zarezerwuj Vesuvio",
            "room-btn-partenope": "Zarezerwuj Partenope",
            "spaces-section-title": "Części Wspólne i Okolica",
            "spaces-title": "Galeria Przestrzeni",
            "spaces-lobby-title": "Wejście i Części Wspólne",
            "spaces-exterior-title": "Zewnątrz i Nasza Ulica",
            "services-title": "Nasze Usługi i Doświadczenia",
            "service-cat1": "Łazienka i Wellness",
            "service-bath-pvt": "Prywatna łazienka",
            "service-bath-prod": "Bezpłatne produkty toaletowe",
            "service-bath-robe": "Szlafrok i Kapcie",
            "service-bath-towels": "Ręczniki i Papier toaletowy",
            "service-bath-hair": "Suszarka do włosów",
            "service-bath-extra": "Dodatkowe toalety",
            "service-cat2": "Komfort w Pokoju",
            "service-bed-premium": "Pościel premium",
            "service-room-closet": "Szafa / Garderoba",
            "service-room-power": "Gniazdko elektryczne blisko łóżka",
            "service-ac-heat": "Klimatyzacja i Ogrzewanie",
            "service-room-allergy": "Pokój antyalergiczny",
            "service-room-smoke": "Pokoje dla niepalących",
            "service-cat3": "Łączność i Media",
            "service-wifi-text": "<strong>Superszybkie WiFi Światłowodowe</strong><br>Bezpłatne i odpowiednie do streamingu 4K, pracy zdalnej i wideorozmów.",
            "service-cat4": "Smak i Praktyczność",
            "service-coffee": "Czajnik do herbaty / Ekspres do kawy",
            "service-fridge": "Lodówka",
            "service-kettle": "Czajnik elektryczny",
            "service-cat5": "Bezpieczeństwo i Wsparcie",
            "service-key": "Dostęp za pomocą kart magnetycznych",
            "service-security": "Ochrona 24 godziny na dobę",
            "service-checkin-out": "Prywatne zameldowanie/wymeldowanie",
            "service-cameras": "Monitoring w częściach wspólnych",
            "service-cleaning": "Sprzątanie",
            "service-luggage": "Przechowalnia bagażu",
            "service-breakfast": "Śniadanie zawsze w cenie",
            "service-breakfast-desc": "Poznaj prawdziwą kulturę neapolitańską dzięki śniadaniu serwowanemu w pobliskim typowym barze.",
            "offer-badge-guest": "Specjalnie dla Gości",
            "offer-badge-taste": "Lokalny Smak",
            "offer-neapolis-title": "La Neapolis Sotterrata",
            "offer-neapolis-desc": "Skorzystaj z <strong>ekskluzywnych zniżek</strong> na bilet normalny na zwiedzanie z przewodnikiem Kompleksu Monumentalnego San Lorenzo Maggiore na Piazza San Gaetano.",
            "offer-neapolis-note": "*Kupon rabatowy dostępny bezpośrednio w obiekcie",
            "offer-rest-title": "Restauracje Partnerskie",
            "offer-rest-desc": "Wybraliśmy dla Ciebie najlepsze lokalne restauracje, w których możesz zjeść posiłek w <strong>preferencyjnych cenach</strong> zarezerwowanych dla naszych gości.",
            "offer-rest-note": "*Zniżki ważne przy kasie w lokalach partnerskich",
            "rules-title": "Przydatne Informacje",
            "rules-subtitle": "Zasady Domu",
            "rule-arrival": "Przyjazd",
            "rule-arrival-desc": "Od 08:00 do 20:00",
            "rule-departure": "Wyjazd",
            "rule-departure-desc": "Od 08:00 do 10:00",
            "rule-smoke": "Palenie",
            "rule-smoke-desc": "Palenie jest zabronione",
            "rule-pets": "Zwierzęta",
            "rule-pets-desc": "Zwierzęta nie są akceptowane",
            "rule-quiet": "Cisza",
            "rule-quiet-desc": "Od 00:00 do 08:00 prosimy o zachowanie maksymalnej ciszy",
            "rule-events": "Imprezy",
            "rule-events-desc": "Organizowanie imprez lub wydarzeń jest zabronione",
            "poi-title": "Nasza Lokalizacja",
            "poi-subtitle": "Gdzie Jesteśmy",
            "poi-desc": "Znajdujemy się w strategicznej lokalizacji, kilka kroków od głównych atrakcji turystycznych i z doskonałym połączeniem komunikacyjnym.",
            "poi-heart": "W samym sercu Spaccanapoli",
            "poi-maps": "Otwórz w Google Maps",
            "poi-walking": "W pobliżu",
            "poi-icons": "Ikony Neapolu",
            "poi-transport": "Transport",
            "reviews-title": "Mówią o nas",
            "reviews-subtitle": "Opinie Gości",
            "reviews-desc": "Twoja satysfakcja jest naszą najlepszą wizytówką. Oto opinie osób, które już nas odwiedziły.",
            "footer-luxury": "Luksus i Tradycja",
            "footer-rights": "Wszelkie prawa zastrzeżone.",
            "review-btn": "Zostaw opinię w Google",
            "review-note": "Twoja opinia jest dla nas bardzo ważna!",
            "modal-title": "Zapytanie o Rezerwację",
            "modal-room-label": "Wybrany Pokój",
            "modal-checkin": "Przyjazd (Check-in)",
            "modal-checkout": "Wyjazd (Check-out)",
            "modal-name": "Imię i Nazwisko",
            "modal-name-placeholder": "Twoje imię",
            "modal-guests": "Goście",
            "modal-guests-placeholder-v": "Maks. 2 osoby",
            "modal-guests-placeholder-p": "Maks. 3 osoby",
            "modal-dates-placeholder": "Przyjazd - Wyjazd",
            "modal-message": "Wiadomość / Prośby",
            "modal-send-wa": "WhatsApp",
            "modal-send-email": "E-mail",
            "email-subject": "Zapytanie o Rezerwację - ",
            "modal-loading": "Sprawdzanie dostępności...",
            "modal-success-title": "Zapytanie Wysłane!",
            "modal-success-desc": "Skontaktujemy się z Tobą jak najszybciej w celu potwierdzenia.",
            "modal-back": "Wstecz",
            "wa-greet": "Cześć, jestem ",
            "wa-want-to-book": " i chciałbym zarezerwować pokój ",
            "wa-for": " dla ",
            "wa-people": " osób ",
            "wa-dates-from": " na te dni: od ",
            "wa-to": " do ",
            "modal-booking-prefix": "Zarezerwuj "
        },
        zh: {
            "nav-home": "首页",
            "nav-about": "关于我们",
            "nav-rooms": "客房展示",
            "nav-spaces": "公共空间",
            "nav-services": "服务设施",
            "nav-rules": "住宿规则",
            "nav-location": "地理位置",
            "nav-reviews": "住客评价",
            "nav-contacts": "联系我们",
            "nav-book": "立即预订",
            "nav-language-select": "选择语言",
            "hero-title": "欢迎来到那不勒斯",
            "hero-subtitle": "入住精致温馨的环境，探索那不勒斯的魅力。",
            "hero-btn": "查看空房",
            "about-history": "我们的故事",
            "about-tradition": "传统与待客之道",
            "about-p1": "<strong>B&B Marinella</strong> 成立于2025年，经过全新装修，设施齐全。我们的目标是通过纯正的家庭式管理，让宾客感受真实的那不勒斯待客之道。",
            "about-p2": "我们的建筑坐落在著名的 <strong>Fondaco de Via San Gregorio Armeno</strong>，位于那不勒斯历史中心的心脏地带。Fondaco 是19世纪“城市重整”运动中幸存下来的最后遗迹之一：这是一个独特的空间，类似于一个小广场，周围环绕着宛如宫殿般的建筑。",
            "about-sanmartino": "据传，著名的 <strong>Giuseppe Sanmartino</strong> 就出生在这个 fondaco，他是杰作《戴面纱的基督》（<em>Cristo Velato</em>）的雕塑家。该杰作就收藏在离我们几步之遥的圣塞维诺小堂中。这一细节让这个地方充满了历史、艺术和魅力。",
            "about-interiors": "现代优雅的内饰与传统的温馨相融合，营造出舒适且精致的环境。每一个细节都旨在让您有宾至如归的感觉，在游览了城市的小巷、博物馆、艺术奇迹和大海后，为您提供一个宁静舒适的避风港。",
            "rooms-title": "我们的客房",
            "rooms-subtitle": "在那不勒斯的奢华中停留",
            "room-badge-comfort": "舒适型",
            "room-badge-premium": "高级型",
            "room-vesuvio": "维苏威套房 (Suite Vesuvio)",
            "room-partenope": "帕特诺佩套房 (Suite Partenope)",
            "room-price-from": "起价",
            "room-night": "/ 晚",
            "room-guests-v": "1 - 2 位宾客",
            "room-guests-p": "2 - 3 位宾客*<br><small style='font-size: 0.7rem; display: block; margin-top: -5px;'>*包含儿童</small>",
            "room-kids": "*包含儿童",
            "room-bed-french": "法式双人床",
            "room-bed-king": "特大号双人床 (King Size)",
            "room-bed-partenope": "特大号床 + 加床",
            "room-bath": "独立卫浴",
            "room-vesuvio-desc": "一个温馨且简约的避风港。配备一张舒适的<strong>法式双人床</strong>，非常适合在寻找位于那不勒斯市中心且价格优惠、实用舒适的住客。",
            "room-partenope-desc": "我们最顶级且最宽敞的房型。配备一张<strong>大号双人床</strong>，并可根据需要提供一张<strong>额外的单人床</strong>。非常适合追求极致奢华和宽敞空间的住客。",
            "room-btn-vesuvio": "预订 Vesuvio",
            "room-btn-partenope": "预订 Partenope",
            "spaces-section-title": "公共区域与周边",
            "spaces-title": "环境图集",
            "spaces-lobby-title": "入口与休息区",
            "spaces-exterior-title": "建筑外观与街道",
            "services-title": "服务设施与体验",
            "service-cat1": "卫浴与健康",
            "service-bath-pvt": "私人浴室",
            "service-bath-prod": "免费洗浴用品",
            "service-bath-robe": "浴袍和拖鞋",
            "service-bath-towels": "浴巾和卫生纸",
            "service-bath-hair": "吹风机",
            "service-bath-extra": "额外卫生设施",
            "service-cat2": "客房舒适度",
            "service-bed-premium": "高级床品",
            "service-room-closet": "衣柜 / 衣帽间",
            "service-room-power": "床头插座",
            "service-ac-heat": "空调和供暖",
            "service-room-allergy": "防过敏客房",
            "service-room-smoke": "无烟客房",
            "service-cat3": "连接与多媒体",
            "service-wifi-text": "<strong>超高速光纤 WiFi</strong><br>免费提供，适合 4K 串流、远程办公和视频通话。",
            "service-cat4": "口味与便利",
            "service-coffee": "茶具 / 咖啡机",
            "service-fridge": "冰箱",
            "service-kettle": "电热水壶",
            "service-cat5": "安全与支持",
            "service-key": "磁卡门禁",
            "service-security": "24小时安保",
            "service-checkin-out": "私人办理入住/退房",
            "service-cameras": "公共区域监控",
            "service-cleaning": "日常清洁",
            "service-luggage": "行李寄存",
            "service-breakfast": "始终包含早餐",
            "service-breakfast-desc": "在附近典型的酒吧享用早餐，体验纯正的那不勒斯文化。",
            "offer-badge-guest": "住客特惠",
            "offer-badge-taste": "当地风味",
            "offer-neapolis-title": "地下那不勒斯 (Neapolis Sotterrata)",
            "offer-neapolis-desc": "凭我们的住客身份，在圣加塔诺广场参观圣洛伦索马焦雷古迹群时可享受<strong>独家门票折扣</strong>。",
            "offer-neapolis-note": "*折扣券由民宿直接提供",
            "offer-rest-title": "合作餐厅",
            "offer-rest-desc": "我们为您挑选了当地最好的餐厅，住客可享受<strong>优惠价格</strong>。",
            "offer-rest-note": "*结账时出示凭证即可享受折扣",
            "rules-title": "实用信息",
            "rules-subtitle": "住宿规则",
            "rule-arrival": "办理入住",
            "rule-arrival-desc": "08:00 至 20:00",
            "rule-departure": "办理退房",
            "rule-departure-desc": "08:00 至 10:00",
            "rule-smoke": "吸烟限定",
            "rule-smoke-desc": "请勿吸烟",
            "rule-pets": "宠物",
            "rule-pets-desc": "不允许携带宠物",
            "rule-quiet": "安静时间",
            "rule-quiet-desc": "00:00 至 08:00 期间请保持安静",
            "rule-events": "派对",
            "rule-events-desc": "禁止举办派对或活动",
            "poi-title": "地理位置",
            "poi-subtitle": "我们在哪里",
            "poi-desc": "我们地理位置优越，距离主要景点仅几步之遥，公共交通便利。",
            "poi-heart": "位于那不勒斯心脏地带",
            "poi-maps": "在谷歌地图中打开",
            "poi-walking": "周边景点",
            "poi-icons": "那不勒斯地标",
            "poi-transport": "交通枢纽",
            "reviews-title": "住客评价",
            "reviews-subtitle": "宾客心声",
            "reviews-desc": "您的满意是我们最好的名片。看看已经入住过的宾客怎么说。",
            "footer-luxury": "奢华与传统",
            "footer-rights": "版权所有。",
            "review-btn": "在谷歌上留下评价",
            "review-note": "您的意见对我们非常重要！",
            "modal-title": "预订请求",
            "modal-room-label": "已选客房",
            "modal-checkin": "入住日期",
            "modal-checkout": "退房日期",
            "modal-name": "姓名",
            "modal-name-placeholder": "您的姓名",
            "modal-guests": "人数",
            "modal-guests-placeholder-v": "最多 2 位",
            "modal-guests-placeholder-p": "最多 3 位",
            "modal-dates-placeholder": "入住日期 - 退房日期",
            "modal-message": "留言 / 特殊需求",
            "modal-send-wa": "通过 WhatsApp 发送",
            "modal-send-email": "通过 邮件 发送",
            "email-subject": "预订请求 - ",
            "modal-loading": "正在检查空房...",
            "modal-success-title": "请求已发送！",
            "modal-success-desc": "我们会尽快联系您进行确认。",
            "modal-back": "返回",
            "wa-greet": "您好，我是 ",
            "wa-want-to-book": "，我想预订客房：",
            "wa-for": " 的 ",
            "wa-people": " 位宾客 ",
            "wa-dates-from": "。预订日期从 ",
            "wa-to": " 至 ",
            "modal-booking-prefix": "预订 "
        }

    };

    // Esponi traduzioni e lingua corrente al global scope per booking.js
    window.translations = translations;

    // Rilevamento lingua: 
    // 1. Controlla se l'utente ha già scelto una lingua (localStorage)
    // 2. Altrimenti controlla la lingua del browser (navigator.language)
    // 3. Default a 'en'
    const getInitialLang = () => {
        const saved = localStorage.getItem('bb-lang');
        if (saved && translations[saved]) return saved;

        const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
        return translations[browserLang] ? browserLang : 'en';
    };

    window.currentLang = getInitialLang();
    const langSwitcher = document.getElementById('langSwitcher');
    const langModal = document.getElementById('langModal');
    const closeLangModal = document.getElementById('closeLangModal');
    const langFlag = document.getElementById('langFlag');

    const flags = {
        it: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="170.7" height="512" fill="#008c45"/><rect width="170.7" height="512" x="170.7" fill="#fff"/><rect width="170.7" height="512" x="341.3" fill="#cd212a"/></svg>`,
        en: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512m0-512L0 512" stroke="#fff" stroke-width="64"/><path d="M0 0l512 512m0-512L0 512" stroke="#c8102e" stroke-width="44"/><path d="M256 0v512M0 256h512" stroke="#fff" stroke-width="110"/><path d="M256 0v512M0 256h512" stroke="#c8102e" stroke-width="70"/></svg>`,
        fr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="170.7" height="512" fill="#002395"/><rect width="170.7" height="512" x="170.7" fill="#fff"/><rect width="170.7" height="512" x="341.3" fill="#ed2939"/></svg>`,
        es: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill="#c60b1e" d="M0 0h512v128H0zm0 384h512v128H0z"/><path fill="#ffc400" d="M0 128h512v256H0z"/></svg>`,
        pt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill="#ff0" d="M0 0h512v512H0z"/><path fill="#048332" d="M0 0h204.8v512H0z"/><path fill="#f00" d="M204.8 0H512v512H204.8z"/><circle cx="204.8" cy="256" r="102.4" fill="#ff0"/></svg>`,
        de: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path d="M0 0h512v170.7H0z"/><path fill="#f00" d="M0 170.7h512v170.6H0z"/><path fill="#ffce00" d="M0 341.3h512V512H0z"/></svg>`,
        pl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill="#fff" d="M0 0h512v256H0z"/><path fill="#dc143c" d="M0 256h512v256H0z"/></svg>`,
        zh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><path fill="#ee1c25" d="M0 0h512v512H0z"/><path fill="#ffff00" d="M124.6 177.3l-28.1-14.8-28.1 14.8 5.4-31.2-22.7-22.1 31.4-4.6 14-28.4 14 28.4 31.4 4.6-22.7 22.1z"/></svg>`
    };

    const updateLanguage = (lang) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Mostriamo la bandiera della lingua corrente nel pulsante flottante
        if (langFlag && flags[lang]) {
            langFlag.innerHTML = flags[lang];
        }

        currentLang = lang;
        window.currentLang = lang;
        localStorage.setItem('bb-lang', lang);

        // Chiudi modal dopo selezione
        if (langModal) langModal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    // Gestione Modal Lingue
    if (langSwitcher && langModal) {
        langSwitcher.addEventListener('click', () => {
            langModal.style.display = "block";
            document.body.style.overflow = "hidden"; // Blocca scroll sotto
        });
    }

    if (closeLangModal) {
        closeLangModal.addEventListener('click', () => {
            langModal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    // Chiudi modal cliccando fuori
    window.addEventListener('click', (event) => {
        if (event.target === langModal) {
            langModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // Event listener per le opzioni lingua nel grid
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.getAttribute('data-lang');
            updateLanguage(selectedLang);
        });
    });

    // Inizializza la lingua al caricamento
    updateLanguage(currentLang);
});

