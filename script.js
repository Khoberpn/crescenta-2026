// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Keep the page fully usable if an animation CDN is unavailable.
    if (typeof window.gsap === 'undefined') {
        window.gsap = {
            registerPlugin() {},
            from() {},
            set() {},
            to(target, options = {}) {
                if (target && target.style && options.opacity !== undefined) {
                    target.style.opacity = options.opacity;
                }
                if (typeof options.onComplete === 'function') options.onComplete();
            },
            utils: { toArray: selector => Array.from(document.querySelectorAll(selector)) }
        };
    }

    // Initialize Lenis for smooth scroll
    const lenis = typeof window.Lenis === 'function' ? new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    }) : {
        raf() {},
        scrollTo(target, options = {}) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // ---------------------------------------------------------
    // Smooth scroll untuk semua link navigasi menggunakan Lenis
    // ---------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Abaikan jika link bukan menuju ke ID sebuah halaman (hanya berisi '#')
            if (targetId === '#') return; 
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault(); // Mencegah browser melakukan lompatan instan
                
                // Perintahkan Lenis untuk melakukan scroll meluncur
                lenis.scrollTo(targetElement, {
                    offset: -80,    // Memberikan jarak atas agar judul section tidak tertutup Navbar
                    duration: 1.5,  // Durasi animasi scroll (dalam detik)
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Gaya perlambatan animasi
                });
            }
        });
    });
    
    // Request animation frame for smooth scroll
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initialize GSAP
    if (typeof window.ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(window.ScrollTrigger);
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    const closeMenu = () => {
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    };

    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        const isOpen = navLinks.classList.contains('active');
        document.body.classList.toggle('menu-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        // Animate menu icon
        const spans = menuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });

    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        const faqItem = question.parentElement;
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.setAttribute('aria-expanded', 'false');
        const toggleFaq = () => {
            const faqItem = question.parentElement;
            faqItem.classList.toggle('active');
            question.setAttribute('aria-expanded', String(faqItem.classList.contains('active')));
        };
        question.addEventListener('click', toggleFaq);
        question.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleFaq();
            }
        });
    });

    // Cursor effects
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');

    document.addEventListener('mousemove', (e) => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    });

    // Hover effects for cursor
    const hoverElements = document.querySelectorAll('a, button, .competition-card, .faq-question, .sponsor, .social-links a');

    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-active');
            cursor.style.width = '12px';
            cursor.style.height = '12px';
            cursorFollower.style.width = '36px';
            cursorFollower.style.height = '36px';
        });

        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-active');
            cursor.style.width = '8px';
            cursor.style.height = '8px';
            cursorFollower.style.width = '24px';
            cursorFollower.style.height = '24px';
        });
    });

    // Play sound on hover
    const hoverSound = document.getElementById('hover-sound');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(e => console.log("Audio play failed:", e));
        });
    });

    // Animate floating neon/coin elements in background
    function createFloatingElements() {
        const layer7 = document.querySelector('.layer-7');
        if (!layer7) return;

        const elements = [
        { width: '15px', height: '15px', color: 'var(--retro-orange)', delay: '1s' },
        { width: '10px', height: '10px', color: 'var(--soft-pink)', delay: '2s' },
        { width: '18px', height: '18px', color: 'var(--golden-yellow)', delay: '1.5s' },
        { width: '8px', height: '8px', color: 'var(--white)', delay: '0.5s' }
        ];

        elements.forEach((el, index) => {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.style.width = el.width;
            element.style.height = el.height;
            element.style.background = el.color;
            element.style.borderRadius = '50%';
            element.style.boxShadow = `0 0 10px ${el.color}`;
            element.style.top = `${10 + index * 15}%`;
            element.style.left = `${10 + index * 20}%`;
            element.style.animationDelay = el.delay;
            layer7.appendChild(element);
        });
    }
    createFloatingElements();

    // GSAP Animations
    // Hero section animations
    gsap.from('#hero h1', {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5
    });

    gsap.from('.subtitle', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power4.out',
        delay: 1.0
    });

    gsap.from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power4.out',
        delay: 1.5
    });

    gsap.from('.scroll-indicator', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power4.out',
        delay: 2.0
    });

    gsap.from('.hero-characters .wizard', {
        opacity: 0,
        x: -100,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5
    });

    gsap.from('.hero-characters .pacman', {
        opacity: 0,
        x: 100,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.7
    });

    gsap.from('.hero-characters .ghost', {
        opacity: 0,
        y: 100,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.9
    });

    // Section reveal animations
    gsap.utils.toArray('.section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Competition card hover animation
    document.querySelectorAll('.competition-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.5)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        });
    });

    // Animate floating elements in footer on scroll
    gsap.from('.footer-characters .wizard-waving', {
        opacity: 0,
        y: 100,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom-=100',
            end: 'bottom top',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.footer-characters .moon', {
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom-=150',
            end: 'bottom top',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.footer-characters .stars', {
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom-=200',
            end: 'bottom top',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.footer-characters .retro-arcade-machine', {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom-=250',
            end: 'bottom top',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.footer-characters .pixel-heart', {
        opacity: 0,
        scale: 0,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom-=300',
            end: 'bottom top',
            toggleActions: 'play none none reverse'
        }
    });

    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send the form data to a server
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Add some interactive sparkles on click
    document.addEventListener('click', function(e) {
        // Create sparkle effect
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.position = 'fixed';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        sparkle.style.width = '8px';
        sparkle.style.height = '8px';
        sparkle.style.background = 'radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(sparkle);

        // Animate sparkle
        gsap.to(sparkle, {
            width: '20px',
            height: '20px',
            opacity: 0,
            duration: 0.6,
            ease: 'power.out',
            onComplete: () => {
                sparkle.remove();
            }
        });

        // Move sparkle upward
        gsap.to(sparkle, {
            y: '-20px',
            duration: 0.6,
            ease: 'power.out'
        });
    });
});

// Helper for GSAP y transformation
if (typeof window.gsap !== 'undefined') {
    window.gsap.set(['.sparkle'], { y: 0 });
}

/* ===========================
NEW CHARACTER UNLOCKED
=========================== */

const mascotSection=document.querySelector("#mascot");
const mascotCard=document.querySelector(".hidden-card");
const unlockTitle=document.querySelector(".unlock-title");
if (mascotSection && mascotCard && unlockTitle) {
const mascotObserver=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
unlockTitle.classList.add("show");
setTimeout(()=>{
mascotCard.classList.add("show");
},600);
}
});
},{threshold:.4});
mascotObserver.observe(mascotSection);
}
