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
                const { error } = await supabase
                    .from('enquiries')
                    .insert([formData]);

                if (error) throw error;

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
            showStatus('Something went wrong. Please call Suzy directly on 0435 433 675.', 'error');
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

});
