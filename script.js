/* =============================================
   HEM Developments - Interactive Scripts
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // SUPABASE CONFIGURATION
    // Replace these with your Supabase project credentials.
    // The anon key is safe for client-side use - Row Level Security
    // on the database ensures visitors can only INSERT, not read.
    // ============================================================
    const SUPABASE_URL = 'https://emiuttcchwrmaldgtodq.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_Ea3JHaEQKaSpIa1bnRUv3Q_SiZ6yZc3';

    let supabase = null;
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // ---- Lead-source attribution (?ref=harrison / ?ref=suzy etc.) ---- //
    // First touch wins: the first ref a visitor ever arrives with is
    // remembered and attached to every enquiry they submit afterwards.
    // Requires the lead_ref column on the enquiries table (see README).
    try {
        const refParam = new URLSearchParams(window.location.search).get('ref');
        if (refParam && !localStorage.getItem('lead_ref')) {
            localStorage.setItem('lead_ref', refParam.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40));
        }
    } catch (e) { /* private browsing: attribution degrades gracefully */ }

    function getLeadRef() {
        try { return localStorage.getItem('lead_ref') || ''; } catch (e) { return ''; }
    }

    // Insert an enquiry; if the lead_ref column doesn't exist yet in the
    // database, retry without it - a lead must never be lost to tracking.
    async function insertEnquiry(payload) {
        let { error } = await supabase.from('enquiries').insert([payload]);
        if (error && payload.lead_ref) {
            const retry = Object.assign({}, payload);
            delete retry.lead_ref;
            ({ error } = await supabase.from('enquiries').insert([retry]));
        }
        if (error) throw error;
    }

    // ---- UTM Parameter Capture ---- //
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_content: params.get('utm_content') || '',
            utm_term: params.get('utm_term') || '',
            referrer: document.referrer || ''
        };
    }

    // ---- Scroll-aware Navigation ---- //
    const nav = document.getElementById('nav');
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Mobile Menu Toggle ---- //
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('active');
    });

    // Close mobile menu on link click
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('active');
        });
    });

    // ---- Intersection Observer for Reveal Animations ---- //
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Gallery Carousel & Lightbox ---- //
    const allSlides = Array.from(document.querySelectorAll('.carousel-slide'));
    const carouselCurrentEl = document.getElementById('carouselCurrent');
    const carouselTotalEl = document.getElementById('carouselTotal');
    const galleryTabs = document.querySelectorAll('.gallery-tab');

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let activeSlides = [...allSlides];
    let lightboxIndex = 0;

    // Build filtered slide set
    function filterSlides(category) {
        if (category === 'all') {
            activeSlides = [...allSlides];
        } else {
            activeSlides = allSlides.filter(s => s.dataset.category === category);
        }

        // Show/hide slides with fade animation
        allSlides.forEach(s => {
            if (category === 'all' || s.dataset.category === category) {
                s.style.display = '';
                requestAnimationFrame(() => { s.style.opacity = '1'; s.style.transform = 'scale(1)'; });
            } else {
                s.style.opacity = '0';
                s.style.transform = 'scale(0.95)';
                setTimeout(() => { s.style.display = 'none'; }, 300);
            }
        });

        // Update counter
        carouselCurrentEl.textContent = activeSlides.length;
        carouselTotalEl.textContent = allSlides.length;
    }

    // Tab filtering
    galleryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            galleryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterSlides(tab.dataset.category);
        });
    });

    // Click slide to open lightbox
    allSlides.forEach(slide => {
        slide.addEventListener('click', () => {
            lightboxIndex = activeSlides.indexOf(slide);
            if (lightboxIndex === -1) lightboxIndex = 0;
            openLightbox();
        });
    });

    // ---- Lightbox ---- //
    function openLightbox() {
        const slide = activeSlides[lightboxIndex];
        const img = slide.querySelector('img');
        const caption = slide.querySelector('.carousel-caption');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightboxCounter.textContent = `${lightboxIndex + 1} / ${activeSlides.length}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function lightboxGoNext() {
        lightboxIndex = (lightboxIndex + 1) % activeSlides.length;
        openLightbox();
    }

    function lightboxGoPrev() {
        lightboxIndex = (lightboxIndex - 1 + activeSlides.length) % activeSlides.length;
        openLightbox();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', lightboxGoNext);
    lightboxPrev.addEventListener('click', lightboxGoPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-bottom')) closeLightbox();
    });

    // Lightbox swipe support
    let lbTouchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        const diff = lbTouchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) lightboxGoNext();
            else lightboxGoPrev();
        }
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') lightboxGoNext();
            if (e.key === 'ArrowLeft') lightboxGoPrev();
        }
    });

    // Initialize
    filterSlides('all');

    // ---- Unit Enquiry Buttons ---- //
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const unitNum = btn.getAttribute('data-unit');
            const select = document.getElementById('interest');
            if (select) {
                select.value = unitNum;
            }
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ---- Floor Plan Modal ---- //
    const floorplanModal = document.getElementById('floorplanModal');
    const floorplanImg = document.getElementById('floorplanImg');
    const floorplanLabel = document.getElementById('floorplanLabel');
    const floorplanClose = document.getElementById('floorplanClose');
    const floorplanOverlay = floorplanModal.querySelector('.floorplan-modal-overlay');

    function openFloorplan(src, label) {
        floorplanImg.src = src;
        floorplanImg.alt = label + ' Floor Plan';
        floorplanLabel.textContent = label;
        floorplanModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Track floor plan view in GA4
        if (typeof gtag === 'function') {
            gtag('event', 'view_floor_plan', {
                event_category: 'Engagement',
                event_label: label
            });
        }
    }

    function closeFloorplan() {
        floorplanModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.unit-floorplan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const src = btn.getAttribute('data-floorplan');
            const label = btn.getAttribute('data-unit-label');
            openFloorplan(src, label);
        });
    });

    floorplanClose.addEventListener('click', closeFloorplan);
    floorplanOverlay.addEventListener('click', closeFloorplan);

    document.addEventListener('keydown', (e) => {
        if (floorplanModal.classList.contains('active') && e.key === 'Escape') {
            closeFloorplan();
        }
    });

    // ---- Contact Form Handler ---- //
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('formSubmit');
    const formStatus = document.getElementById('formStatus');

    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
        formStatus.style.display = 'block';
    }

    function hideStatus() {
        formStatus.style.display = 'none';
        formStatus.className = 'form-status';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideStatus();

        // Honeypot check - if the hidden field is filled, it's a bot
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value) {
            // Pretend it worked to not alert the bot
            showStatus('✓ Enquiry submitted successfully. We\'ll be in touch shortly.', 'success');
            form.reset();
            return;
        }

        // Gather form data
        const formData = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            interest: document.getElementById('interest').value,
            message: document.getElementById('message').value.trim(),
            ...getUTMParams(),
            ...(getLeadRef() ? { lead_ref: getLeadRef() } : {}),
            page_url: window.location.href,
            submitted_at: new Date().toISOString()
        };

        // Basic validation
        if (!formData.first_name || !formData.last_name || !formData.email) {
            showStatus('Please fill in all required fields.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        // UI loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        try {
            if (supabase) {
                // ---- Live Supabase Submission ---- //
                await insertEnquiry(formData);

                showStatus('✓ Enquiry submitted successfully. We\'ll be in touch shortly.', 'success');
                submitBtn.textContent = '✓ Sent';
                submitBtn.style.background = 'var(--clr-success, #3a7d44)';
                submitBtn.style.opacity = '1';

                // Fire conversion events if analytics are loaded
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_lead', {
                        event_category: 'Contact',
                        event_label: formData.interest || 'General',
                        value: 1
                    });
                }
                if (typeof fbq === 'function') {
                    fbq('track', 'Lead', {
                        content_name: 'Holland Residences Enquiry',
                        content_category: formData.interest || 'General'
                    });
                }

                setTimeout(() => {
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    hideStatus();
                }, 4000);

            } else {
                // ---- Fallback: No Supabase configured ---- //
                // Simulated submission for development / preview
                console.warn('Supabase not configured. Form data:', formData);
                await new Promise(resolve => setTimeout(resolve, 1000));

                showStatus('✓ Enquiry submitted successfully. We\'ll be in touch shortly.', 'success');
                submitBtn.textContent = '✓ Sent';
                submitBtn.style.background = 'var(--clr-success, #3a7d44)';
                submitBtn.style.opacity = '1';

                setTimeout(() => {
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    hideStatus();
                }, 4000);
            }
        } catch (err) {
            console.error('Submission error:', err);
            showStatus('Something went wrong. Please call Harrison directly on 0406 707 366.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;
        }
    });

    // ---- Smooth anchor scroll offset for fixed nav ---- //
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = nav.offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    // ---- Scroll Depth Tracking (for campaign analytics) ---- //
    const sections = ['about', 'residences', 'gallery', 'location', 'contact'];
    const trackedSections = new Set();

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (!trackedSections.has(id)) {
                    trackedSections.add(id);

                    // Fire GA event if loaded
                    if (typeof gtag === 'function') {
                        gtag('event', 'scroll_depth', {
                            event_category: 'Engagement',
                            event_label: id,
                            non_interaction: true
                        });
                    }
                }
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    // ============================================================
    // DIRECT SALES MODE
    // Unit availability is controlled in index.html via data-status
    // on each .unit-card: "available" | "under-offer" | "sold".
    // The chips, availability counter, hero "From $X" price and the
    // enquiry form options below all derive from those attributes.
    // ============================================================

    const STATUS_LABELS = {
        'available': 'Available',
        'under-offer': 'Under Contract',
        'sold': 'Sold'
    };

    const unitCards = document.querySelectorAll('.unit-card[data-unit]');
    let availableCount = 0;
    let cheapestAvailable = Infinity;

    unitCards.forEach(card => {
        const status = STATUS_LABELS[card.dataset.status] ? card.dataset.status : 'available';
        const unitNum = card.dataset.unit;

        // Sold cards get a full-strength corner ribbon; everything else
        // gets a status chip in the card header
        if (status === 'sold') {
            const ribbon = document.createElement('div');
            ribbon.className = 'sold-ribbon';
            ribbon.textContent = 'Sold';
            ribbon.setAttribute('aria-hidden', 'true');
            card.appendChild(ribbon);
        } else {
            const header = card.querySelector('.unit-card-header');
            if (header) {
                const chip = document.createElement('span');
                chip.className = 'unit-status unit-status--' + status;
                chip.textContent = STATUS_LABELS[status];
                header.appendChild(chip);
            }
        }

        // Enquire button + form option reflect the status
        const enquireBtn = card.querySelector('.unit-btn');
        const option = document.querySelector('#interest option[value="' + unitNum + '"]');
        if (status === 'sold') {
            if (enquireBtn) { enquireBtn.textContent = 'Sold'; enquireBtn.disabled = true; }
            if (option) { option.disabled = true; option.textContent += ' · Sold'; }
            // Hide the guide on sold units so past asking prices don't
            // anchor negotiations on the remaining stock
            const soldPriceEl = card.querySelector('.unit-price');
            if (soldPriceEl) soldPriceEl.textContent = 'Sold';
        } else if (status === 'under-offer') {
            if (enquireBtn) enquireBtn.textContent = 'Under Contract - Register as Backup';
            if (option) option.textContent += ' · Under Contract';
        } else {
            availableCount++;
            const priceEl = card.querySelector('.unit-price');
            const price = priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, ''), 10) : NaN;
            if (!isNaN(price) && price < cheapestAvailable) cheapestAvailable = price;
        }
    });

    // Availability line + hero "From $X" follow the card data
    const availabilityLine = document.getElementById('availabilityLine');
    if (availabilityLine && unitCards.length) {
        availabilityLine.textContent = availableCount === unitCards.length
            ? 'All ' + unitCards.length + ' residences available · Buy direct from the developer'
            : availableCount + ' of ' + unitCards.length + ' residences still available · Buy direct from the developer';
    }

    const heroFromPrice = document.getElementById('heroFromPrice');
    if (heroFromPrice && isFinite(cheapestAvailable)) {
        heroFromPrice.textContent = 'From $' + (cheapestAvailable / 1000000).toFixed(2).replace(/0$/, '') + 'M';
    }

    // ---- Call click tracking ---- //
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'call_click', {
                    event_category: 'Contact',
                    event_label: link.textContent.trim()
                });
            }
            if (typeof fbq === 'function') fbq('trackCustom', 'CallClick');
        });
    });

    // ---- Inspection booking calendar (Google Calendar appointment
    //      schedule). Paste the Google booking-page URL below to switch
    //      the on-site calendar on; leave empty and inspection CTAs fall
    //      back to the enquiry form. Visitors only ever see open slots -
    //      the calendar's contents stay private. ---- //
    const BOOKING_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hay2OaHoldhWLtaUsQt8H0FWO7nJq46BJkF1tbaqKSzbKHgk4FEGYqR-5YGliazC6eosX5VL-?gv=true';

    const bookingSection = document.getElementById('book');
    if (BOOKING_URL && bookingSection) {
        bookingSection.hidden = false;

        // Load Google's calendar only when the visitor nears the section
        const frameHost = document.getElementById('bookingFrame');
        const loadBookingFrame = () => {
            if (frameHost.dataset.loaded) return;
            frameHost.dataset.loaded = '1';
            const iframe = document.createElement('iframe');
            iframe.src = BOOKING_URL;
            iframe.title = 'Book a private inspection at Holland Residences';
            iframe.loading = 'lazy';
            frameHost.appendChild(iframe);
        };
        new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) { loadBookingFrame(); obs.disconnect(); }
            });
        }, { rootMargin: '600px' }).observe(bookingSection);

        // Point the inspection CTAs at the calendar instead of the form
        document.querySelectorAll('a[data-cta="inspection"]').forEach(el => {
            el.setAttribute('href', '#book');
        });
    }

    // ---- Book-inspection CTAs ---- //
    document.querySelectorAll('[data-cta="inspection"]').forEach(el => {
        el.addEventListener('click', () => {
            const message = document.getElementById('message');
            if (message && !message.value) {
                message.value = "I'd like to book a private inspection of Holland Residences.";
            }
            if (typeof gtag === 'function') {
                gtag('event', 'book_inspection', { event_category: 'Contact' });
            }
            if (typeof fbq === 'function') fbq('trackCustom', 'BookInspection');
        });
    });

    // ---- Film: click-to-load YouTube embed (no YouTube scripts until
    //      the visitor actually presses play - keeps the page fast) ---- //
    const filmFrame = document.getElementById('filmFrame');
    if (filmFrame) {
        filmFrame.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube-nocookie.com/embed/' + filmFrame.dataset.videoId + '?autoplay=1&rel=0&playsinline=1';
            iframe.title = 'Holland Residences walkthrough video';
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.allowFullscreen = true;
            filmFrame.innerHTML = '';
            filmFrame.appendChild(iframe);
            if (typeof gtag === 'function') {
                gtag('event', 'video_play', { event_category: 'Engagement', event_label: 'Walkthrough Film' });
            }
            if (typeof fbq === 'function') fbq('trackCustom', 'VideoPlay');
        }, { once: true });
    }

    // ---- Buyer Pack (request-only: no self-serve download, Harrison sends
    //      it personally so every pack request becomes a conversation) ---- //
    const packModal = document.getElementById('packModal');
    const packForm = document.getElementById('packForm');
    const packStatus = document.getElementById('packStatus');
    const packSubmit = document.getElementById('packSubmit');

    function openPackModal() {
        packModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('packFirstName').focus(), 300);
    }

    function closePackModal() {
        packModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (packModal) {
        document.querySelectorAll('[data-cta="buyer-pack"]').forEach(btn => {
            btn.addEventListener('click', openPackModal);
        });
        document.getElementById('packModalClose').addEventListener('click', closePackModal);
        document.getElementById('packModalOverlay').addEventListener('click', closePackModal);
        document.addEventListener('keydown', (e) => {
            if (packModal.classList.contains('active') && e.key === 'Escape') closePackModal();
        });

        packForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot check
            const honeypot = document.getElementById('packWebsite');
            if (honeypot && honeypot.value) {
                packStatus.textContent = '✓ Request received. We\'ll be in touch shortly.';
                packStatus.className = 'form-status success';
                packStatus.style.display = 'block';
                return;
            }

            const leadData = {
                first_name: document.getElementById('packFirstName').value.trim(),
                last_name: document.getElementById('packLastName').value.trim(),
                email: document.getElementById('packEmail').value.trim(),
                phone: document.getElementById('packPhone').value.trim(),
                interest: 'Buyer Pack',
                message: 'Requested the buyer pack.',
                ...getUTMParams(),
                ...(getLeadRef() ? { lead_ref: getLeadRef() } : {}),
                page_url: window.location.href,
                submitted_at: new Date().toISOString()
            };

            packSubmit.textContent = 'Sending...';
            packSubmit.disabled = true;

            try {
                if (supabase) {
                    await insertEnquiry(leadData);
                }

                if (typeof gtag === 'function') {
                    gtag('event', 'buyer_pack_request', { event_category: 'Contact', value: 1 });
                    gtag('event', 'generate_lead', { event_category: 'Contact', event_label: 'Buyer Pack', value: 1 });
                }
                if (typeof fbq === 'function') {
                    fbq('track', 'Lead', { content_name: 'Holland Residences Buyer Pack' });
                }

                packStatus.textContent = '✓ Request received. Harrison will send the full buyer pack to you personally, usually within the hour.';
                packStatus.className = 'form-status success';
                packStatus.style.display = 'block';
                packSubmit.textContent = '✓ Requested';
            } catch (err) {
                console.error('Buyer pack lead error:', err);
                packStatus.textContent = 'Something went wrong - call or text Harrison on 0406 707 366 and he\'ll send the pack straight over.';
                packStatus.className = 'form-status error';
                packStatus.style.display = 'block';
                packSubmit.textContent = 'Request the Buyer Pack';
                packSubmit.disabled = false;
                return;
            }

            setTimeout(() => {
                closePackModal();
                packForm.reset();
                packSubmit.textContent = 'Request the Buyer Pack';
                packSubmit.disabled = false;
                packStatus.style.display = 'none';
            }, 4500);
        });
    }

});
