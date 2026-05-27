document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a, .hero-cta a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only prevent default if it's an anchor link within the page
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for sticky navbar
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    });

    // Subtle Navbar transition
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Reveal Elements
    const elementsToReveal = document.querySelectorAll('.about-card, .skills-section, .experience-section, .project-card, .workflow-section, .certs-list, .research-list, .contact-cta');
    elementsToReveal.forEach(el => {
        el.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Page Transitions
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip anchor links, JS, mailto, or external links
            if (!targetId || 
                targetId.startsWith('#') || 
                targetId.startsWith('mailto:') || 
                targetId.startsWith('javascript:') ||
                this.getAttribute('target') === '_blank') {
                return;
            }

            // Internal page navigation
            e.preventDefault();
            document.body.classList.add('fade-out');
            
            setTimeout(() => {
                window.location.href = targetId;
            }, 300); // Wait for the fadeOut animation to almost finish
        });
    });

    // Mobile Menu Toggle Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinksContainer) {
        const mobileMenuIcon = mobileMenuBtn.querySelector('i');
        
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            
            // Toggle icon between list (hamburger) and x (close)
            if (navLinksContainer.classList.contains('active')) {
                mobileMenuIcon.classList.remove('ph-list');
                mobileMenuIcon.classList.add('ph-x');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            } else {
                mobileMenuIcon.classList.remove('ph-x');
                mobileMenuIcon.classList.add('ph-list');
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        const navItems = navLinksContainer.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                mobileMenuIcon.classList.remove('ph-x');
                mobileMenuIcon.classList.add('ph-list');
                document.body.style.overflow = '';
            });
        });
    }
});
