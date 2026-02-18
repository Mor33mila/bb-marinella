// Attendi che il DOM sia completamente caricato prima di eseguire lo script
document.addEventListener('DOMContentLoaded', function () {
    // 1. RIFERIMENTI AGLI ELEMENTI DEL DOM
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-modal');
    const modalRoomTitle = document.getElementById('modalRoomTitle');
    const selectedRoomIdInput = document.getElementById('selectedRoomId');
    const modalNome = document.getElementById('modalNome');
    const modalPersone = document.getElementById('modalPersone');
    const modalDateRange = document.getElementById('modalDateRange');
    const availabilityLoader = document.getElementById('availabilityLoader');
    const modalPrenotaBtn = document.getElementById('modalPrenotaBtn');

    let fp = null; // Istanza di Flatpickr (il calendario)

    // 2. LOGICA DI APERTURA DEL MODAL
    // Seleziona tutti i pulsanti che aprono il modal di prenotazione
    document.querySelectorAll('.open-booking-modal').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Evita interferenze con altri script (es: smooth scroll)
            const roomId = this.getAttribute('data-room');
            const roomName = this.getAttribute('data-room-name');

            openModal(roomId, roomName);
        });
    });

    // 3. LOGICA DI CHIUSURA DEL MODAL
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Chiudi il modal se si clicca fuori dalla finestra bianca
    window.addEventListener('click', function (e) {
        if (e.target == modal) {
            closeModal();
        }
    });

    // Funzione principale per aprire il modal e preparare i campi
    function openModal(roomId, roomName) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Blocca lo scroll dello sfondo

        const lang = window.currentLang || 'it';
        const t = window.translations[lang];
        const prefix = t["modal-booking-prefix"] || (lang === 'it' ? 'Prenota ' : 'Book ');
        modalRoomTitle.textContent = `${prefix}${roomName}`;
        selectedRoomIdInput.value = roomId;

        // Resetta i campi del modulo ogni volta che si apre
        modalNome.value = '';
        modalPersone.value = '';
        modalDateRange.value = '';

        // Aggiorna i placeholder con la lingua corrente
        modalNome.placeholder = t["modal-name-placeholder"] || 'Il tuo nome';
        modalDateRange.placeholder = t["modal-dates-placeholder"] || 'Arrivo - Partenza';

        // Imposta la capacità massima dinamicamente in base alla camera scelta
        // stanza1 = Suite Vesuvio (2 persone), stanza2 = Suite Partenope (3 persone)
        if (roomId === 'stanza1') {
            modalPersone.max = 2;
            modalPersone.placeholder = t["modal-guests-placeholder-v"] || 'Max 2 persone';
        } else {
            modalPersone.max = 3;
            modalPersone.placeholder = t["modal-guests-placeholder-p"] || 'Max 3 persone';
        }

        // Inizializza o aggiorna Flatpickr per caricare le date occupate corrette
        initFlatpickr(roomId);
    }

    // Funzione per chiudere il modal e pulire il calendario
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Ripristina lo scroll dello sfondo
        if (fp) {
            fp.clear();
        }
    }

    // 4. INIZIALIZZAZIONE CALENDARIO (FLATPICKR)
    async function initFlatpickr(roomId) {
        if (fp) {
            fp.destroy(); // Distruggi l'istanza precedente se esiste
        }

        // Mostra il caricamento e disabilita l'input delle date
        availabilityLoader.style.display = 'block';
        modalDateRange.disabled = true;

        let blockedDates = [];
        try {
            // Recupera le date occupate dall'API del server (sincronizzata con iCal)
            const response = await fetch(`/api/availability?room=${roomId}`);
            blockedDates = await response.json();
            console.log(`Date occupate per ${roomId}:`, blockedDates);
        } catch (error) {
            console.error('Errore nel recupero della disponibilità:', error);
        } finally {
            // Nascondi il caricamento e abilita l'input
            availabilityLoader.style.display = 'none';
            modalDateRange.disabled = false;
        }

        // Configurazione di Flatpickr
        fp = flatpickr(modalDateRange, {
            mode: "range",           // Selezione intervallo (Arrivo - Partenza)
            dateFormat: "Y-m-d",     // Formato data interno
            altInput: true,          // Mostra un input più leggibile all'utente
            altFormat: "d F Y",      // Formato leggibile (es: 15 Giugno 2026)
            minDate: "today",        // Non si può prenotare nel passato
            locale: window.currentLang || "it",            // Traduzione dinamica
            disable: blockedDates,   // Disabilita le date già occupate
            onReady: function (selectedDates, dateStr, instance) {
                // Assicura che il calendario sia sopra il modal
                instance.calendarContainer.style.zIndex = "3001";
            }
        });
    }

    // 5. GESTIONE DELLA PRENOTAZIONE (INVIO WHATSAPP)
    modalPrenotaBtn.addEventListener('click', function () {
        // Validazione date
        if (!fp || fp.selectedDates.length < 2) {
            alert("Per favore seleziona una data di arrivo e una di partenza.");
            return;
        }

        // Validazione nome
        const nome = modalNome.value;
        if (!nome) {
            alert("Inserisci il tuo nome.");
            return;
        }

        // Validazione numero persone
        const persone = modalPersone.value;
        const maxPersone = modalPersone.max;
        if (!persone || persone < 1) {
            alert("Inserisci il numero di persone.");
            return;
        }
        if (parseInt(persone) > parseInt(maxPersone)) {
            alert(`Questa camera può ospitare al massimo ${maxPersone} persone.`);
            return;
        }

        // Composizione del messaggio finale
        const lang = window.currentLang || 'it';
        const t = window.translations[lang];

        const roomName = modalRoomTitle.textContent.replace(t["modal-booking-prefix"], '');
        const dateLocale = lang === 'it' ? 'it-IT' : 'en-GB';
        const checkIn = fp.selectedDates[0].toLocaleDateString(dateLocale);
        const checkOut = fp.selectedDates[1].toLocaleDateString(dateLocale);

        const message = `${t["wa-greet"]}*${nome}*${t["wa-want-to-book"]}*${roomName}*${t["wa-for"]}*${persone}${t["wa-people"]}*${t["wa-dates-from"]}${checkIn}${t["wa-to"]}${checkOut}`;

        const whatsappNumber = "393397993428";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Tracciamo l'evento di conversione su Umami prima di aprire WhatsApp
        if (window.umami) {
            umami.track('send-booking-request', {
                room: document.getElementById('selectedRoomId').value,
                guests: persone,
                lang: window.currentLang
            });
        }

        // Apri WhatsApp in una nuova scheda
        window.open(url, '_blank');
        closeModal();
    });
});
