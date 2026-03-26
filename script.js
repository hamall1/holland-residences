/* =============================================
   HEM Developments — Interactive Scripts
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // SUPABASE CONFIGURATION
    // Replace these with your Supabase project credentials.
    // The anon key is safe for client-side use — Row Level Security
    // on the database ensures visitors can only INSERT, not read.
    // ============================================================
    const SUPABASE_URL = 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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

    // ---- Gallery Lightbox ---- //
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-item');

    let currentIndex = 0;
    const galleryImages = [];

    galleryItems.forEach((item, i) => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        galleryImages.push({
            src: img.src,
            alt: img.alt,
            caption: caption ? caption.textContent : ''
        });

        item.addEventListener('click', () => {
            currentIndex = i;
            openLightbox();
        });
    });

    function openLightbox() {
        const data = galleryImages[currentIndex];
        lightboxImg.src = data.src;
        lightboxImg.alt = data.alt;
        lightboxCaption.textContent = data.caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

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

        // Honeypot check — if the hidden field is filled, it's a bot
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
