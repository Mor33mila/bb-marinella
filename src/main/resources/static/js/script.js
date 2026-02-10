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
                        currentIndex = 1;
                        setPositionByIndex(false);
                        updateIndicators(currentIndex);
                    }, 500);
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
                        currentIndex = slides.length - 2;
                        setPositionByIndex(false);
                        updateIndicators(currentIndex);
                    }, 500);
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
            const newIndex = Math.round(scrollLeft / width);

            // Se arriviamo sui cloni, teletrasporto immediato alla slide reale
            if (scrollLeft <= 0) {
                isRedirecting = true;
                currentIndex = slides.length - 2;
                track.scrollLeft = currentIndex * width;
                setTimeout(() => isRedirecting = false, 50);
            } else if (scrollLeft >= (slides.length - 1) * width - 5) {
                isRedirecting = true;
                currentIndex = 1;
                track.scrollLeft = currentIndex * width;
                setTimeout(() => isRedirecting = false, 50);
            } else {
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
            const amountToMove = -revIndex * 100;
            reviewsTrack.style.transform = `translateX(${amountToMove}%)`;
        };

        // Autoplay: cambia slide ogni 5 secondi
        setInterval(() => {
            revIndex = (revIndex + 1) % totalSlides;
            updateReviewsSlider();
        }, 5000); //5000ms = 5 secondi
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
            "modal-message": "Messaggio / Richieste",
            "modal-send": "Invia Richiesta",
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
            "modal-message": "Message / Requests",
            "modal-send": "Send Request",
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
        }
    };

    // Esponi traduzioni e lingua corrente al global scope per booking.js
    window.translations = translations;
    window.currentLang = localStorage.getItem('bb-lang') || 'it';
    const langSwitcher = document.getElementById('langSwitcher');
    const langFlag = document.getElementById('langFlag');

    const flags = {
        it: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="170.7" height="512" fill="#008c45"/><rect width="170.7" height="512" x="170.7" fill="#fff"/><rect width="170.7" height="512" x="341.3" fill="#cd212a"/></svg>`,
        en: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512m0-512L0 512" stroke="#fff" stroke-width="64"/><path d="M0 0l512 512m0-512L0 512" stroke="#c8102e" stroke-width="44"/><path d="M256 0v512M0 256h512" stroke="#fff" stroke-width="110"/><path d="M256 0v512M0 256h512" stroke="#c8102e" stroke-width="70"/></svg>`
    };

    const updateLanguage = (lang) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Se la lingua corrente è IT, mostriamo la bandiera UK (prossima lingua)
        // Se la lingua corrente è EN, mostriamo la bandiera IT
        langFlag.innerHTML = lang === 'it' ? flags.en : flags.it;

        currentLang = lang;
        window.currentLang = lang; // Aggiorna anche la variabile globale
        localStorage.setItem('bb-lang', lang);
    };

    if (langSwitcher) {
        langSwitcher.addEventListener('click', () => {
            const nextLang = currentLang === 'it' ? 'en' : 'it';
            updateLanguage(nextLang);
        });
    }

    // Inizializza la lingua al caricamento
    updateLanguage(currentLang);
});
