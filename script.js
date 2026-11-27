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
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Reveal Elements
    const elementsToReveal = document.querySelectorAll('.about-grid, .skills-section, .experience-section, .projects-stack-wrapper, .beyond-section, .workflow-section, .certs-list, .contact-cta');
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

    // Stacked Folder Deck Animation for Projects
    const projectsStack = document.getElementById('projects-track');
    if (projectsStack) {
        const cards = Array.from(projectsStack.querySelectorAll('.project-card'));
        const prevBtn = document.getElementById('projects-prev');
        const nextBtn = document.getElementById('projects-next');
        const counterEl = document.getElementById('projects-counter');
        const tabsContainer = document.getElementById('projects-dots');

        let activeIndex = 0;
        let isAnimating = false;
        let autoTimer = null;
        let userInteracted = false;

        // Build bottom folder selector pills
        if (tabsContainer && cards.length > 0) {
            tabsContainer.innerHTML = '';
            cards.forEach((card, idx) => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = `folder-pill-btn${idx === 0 ? ' active' : ''}`;
                const name = card.getAttribute('data-folder-name') || `Project ${idx + 1}`;
                pill.innerHTML = `<span class="pill-idx">0${idx + 1}</span><span>${name}</span>`;
                pill.addEventListener('click', () => {
                    userInteracted = true;
                    stopAutoCycle();
                    if (idx !== activeIndex) {
                        jumpToFolder(idx);
                    }
                });
                tabsContainer.appendChild(pill);
            });
        }

        function syncPositions(frontIdx) {
            const total = cards.length;
            cards.forEach((card, i) => {
                const pos = (i - frontIdx + total) % total;
                card.setAttribute('data-stack-pos', String(pos));
                const icon = card.querySelector('.folder-tab-label i');
                if (icon) {
                    icon.className = pos === 0 ? 'ph ph-folder-open' : 'ph ph-folder';
                }
            });

            if (counterEl) {
                counterEl.textContent = `0${frontIdx + 1} / 0${total}`;
            }

            if (tabsContainer) {
                const pills = tabsContainer.querySelectorAll('.folder-pill-btn');
                pills.forEach((pill, i) => {
                    pill.classList.toggle('active', i === frontIdx);
                });
            }
        }

        // Bring next card up while current front card drops down
        function stepNext(targetIndex = null) {
            if (isAnimating || cards.length < 2) return;
            isAnimating = true;

            const outgoingCard = cards[activeIndex];
            const nextIdx = targetIndex !== null ? targetIndex : (activeIndex + 1) % cards.length;
            const total = cards.length;

            // Current front card drops down
            outgoingCard.classList.add('is-dropping-down');

            // Remaining cards step upward into place immediately
            cards.forEach((card, i) => {
                if (i === activeIndex) return;
                const pos = (i - nextIdx + total) % total;
                card.setAttribute('data-stack-pos', String(pos));
                const icon = card.querySelector('.folder-tab-label i');
                if (icon) {
                    icon.className = pos === 0 ? 'ph ph-folder-open' : 'ph ph-folder';
                }
            });

            activeIndex = nextIdx;
            if (counterEl) counterEl.textContent = `0${activeIndex + 1} / 0${total}`;
            if (tabsContainer) {
                tabsContainer.querySelectorAll('.folder-pill-btn').forEach((pill, i) => {
                    pill.classList.toggle('active', i === activeIndex);
                });
            }

            window.setTimeout(() => {
                outgoingCard.classList.add('no-transition');
                outgoingCard.classList.remove('is-dropping-down');
                const newBackPos = (cards.indexOf(outgoingCard) - activeIndex + total) % total;
                outgoingCard.setAttribute('data-stack-pos', String(newBackPos));
                const icon = outgoingCard.querySelector('.folder-tab-label i');
                if (icon) icon.className = 'ph ph-folder';
                void outgoingCard.offsetWidth; // Force reflow before restoring transitions
                outgoingCard.classList.remove('no-transition');
                isAnimating = false;
            }, 340);
        }

        // Bring previous (back) card up from below while current front card steps back up the stack
        function stepPrev() {
            if (isAnimating || cards.length < 2) return;
            isAnimating = true;

            const total = cards.length;
            const prevIdx = (activeIndex - 1 + total) % total;
            const incomingCard = cards[prevIdx];

            // Position incoming card at the bottom entry point without transition
            incomingCard.classList.add('no-transition', 'is-coming-up-start');
            incomingCard.setAttribute('data-stack-pos', '0');
            void incomingCard.offsetWidth;
            incomingCard.classList.remove('no-transition');

            window.requestAnimationFrame(() => {
                incomingCard.classList.remove('is-coming-up-start');
                activeIndex = prevIdx;
                syncPositions(activeIndex);
            });

            window.setTimeout(() => {
                isAnimating = false;
            }, 520);
        }

        function jumpToFolder(targetIdx) {
            if (targetIdx === activeIndex || isAnimating) return;
            const total = cards.length;
            const prevIdx = (activeIndex - 1 + total) % total;
            if (targetIdx === prevIdx && total > 2) {
                stepPrev();
            } else {
                stepNext(targetIdx);
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                userInteracted = true;
                stopAutoCycle();
                stepPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                userInteracted = true;
                stopAutoCycle();
                stepNext();
            });
        }

        // Click any peeking stacked folder behind the active one to pull it up
        cards.forEach((card, idx) => {
            card.addEventListener('click', () => {
                const pos = parseInt(card.getAttribute('data-stack-pos') || '0', 10);
                if (pos > 0) {
                    userInteracted = true;
                    stopAutoCycle();
                    jumpToFolder(idx);
                }
            });
        });

        // Touch swipe up/down support
        let touchStartY = 0;
        projectsStack.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].clientY;
            userInteracted = true;
            stopAutoCycle();
        }, { passive: true });

        projectsStack.addEventListener('touchend', (e) => {
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaY) > 40) {
                if (deltaY < 0) {
                    stepNext();
                } else {
                    stepPrev();
                }
            }
        }, { passive: true });

        // Gentle auto-cycle when visible (pauses on hover or interaction)
        function startAutoCycle() {
            if (userInteracted || autoTimer) return;
            autoTimer = window.setInterval(() => {
                if (!userInteracted) stepNext();
            }, 5000);
        }

        function stopAutoCycle() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.addEventListener('mouseenter', stopAutoCycle);
            projectsSection.addEventListener('mouseleave', () => {
                if (!userInteracted) startAutoCycle();
            });

            const stackObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !userInteracted) {
                        startAutoCycle();
                    } else {
                        stopAutoCycle();
                    }
                });
            }, { threshold: 0.35 });
            stackObserver.observe(projectsSection);
        }

        syncPositions(0);
    }
});
