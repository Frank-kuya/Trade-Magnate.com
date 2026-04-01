document.addEventListener('DOMContentLoaded', () => {

    // 2. Header Scroll state
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
                document.body.style.overflow = 'hidden';
            } else {
                icon.className = 'fa-solid fa-bars';
                document.body.style.overflow = '';
            }
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (mobileBtn.querySelector('i')) {
                    mobileBtn.querySelector('i').className = 'fa-solid fa-bars';
                }
                document.body.style.overflow = '';
            });
        });
    }

    // 4. Scroll Reveal Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeObsever = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // optional: run once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => fadeObsever.observe(el));

    // ======================================
    // INTERACTIVE UI LOGIC
    // ======================================

    // 1. Swiper Carousel Initialization
    if(document.querySelector('.hero-swiper')) {
        const swiper = new Swiper('.hero-swiper', {
            loop: true,
            effect: 'fade', // professional enterprise transition
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            parallax: true,
            speed: 1000
        });
    }

    // 2. Stats Fun-Fact Counter Logic
    const statsContainer = document.getElementById('statsGrid');
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    if(statsContainer && statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    statNumbers.forEach(stat => {
                        const target = +stat.getAttribute('data-target');
                        const speed = 100; // lower is faster
                        
                        const updateCount = () => {
                            const current = +stat.innerText;
                            const increment = target / speed;

                            if(current < target) {
                                stat.innerText = Math.ceil(current + increment);
                                setTimeout(updateCount, 15);
                            } else {
                                stat.innerText = target;
                                if(target > 200) stat.innerText += "+";
                            }
                        };
                        updateCount();
                    });
                }
            });
        }, { threshold: 0.3 });
        
        counterObserver.observe(statsContainer);
    }

    // 3. Canvas-based water ripple / fluid cursor effect (pixel grid algorithm)
    const heroOverlay = document.querySelector('.hero-overlay-container');
    const glassCard = document.querySelector('.hero-glass-card');

    if (heroOverlay && glassCard) {
        const canvas = document.createElement('canvas');
        canvas.id = 'rippleCanvas';
        heroOverlay.insertBefore(canvas, heroOverlay.firstChild);
        const ctx = canvas.getContext('2d');

        let width = 0;
        let height = 0;
        let simW = 0;
        let simH = 0;
        let current = null;
        let previous = null;
        const damping = 33;

        const resizeSimulation = () => {
            width = heroOverlay.clientWidth;
            height = heroOverlay.clientHeight;
            const pixelScale = 2; /* lower = higher detail across full container */
            simW = Math.max(64, Math.floor(width / pixelScale));
            simH = Math.max(48, Math.floor(height / pixelScale));

            canvas.width = simW;
            canvas.height = simH;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';

            current = new Int32Array(simW * simH);
            previous = new Int32Array(simW * simH);
        };

        const disturb = (x, y, radius = 3, strength = 1024) => {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const px = x + dx;
                    const py = y + dy;
                    if (px >= 1 && px < simW - 1 && py >= 1 && py < simH - 1) {
                        const dist = dx * dx + dy * dy;
                        if (dist <= radius * radius) {
                            const index = py * simW + px;
                            previous[index] += strength - dist * 70;
                        }
                    }
                }
            }
        };

        const update = () => {
            if (!current || !previous) return;

            let idx = 0;
            for (let y = 1; y < simH - 1; y++) {
                for (let x = 1; x < simW - 1; x++) {
                    idx = y * simW + x;
                    const left = previous[idx - 1];
                    const right = previous[idx + 1];
                    const up = previous[idx - simW];
                    const down = previous[idx + simW];

                    let wave = ((left + right + up + down) >> 1) - current[idx];
                    wave -= wave >> (damping / 10);
                    current[idx] = wave;
                }
            }

            // swap buffers
            const tmp = previous;
            previous = current;
            current = tmp;

            const image = ctx.createImageData(simW, simH);
            for (let i = 0; i < simW * simH; i++) {
                const v = previous[i];
                const k = Math.min(255, Math.max(0, 128 + (v >> 2)));
                const alpha = Math.min(255, Math.abs(v) * 1.2);
                image.data[i * 4 + 0] = 40;
                image.data[i * 4 + 1] = 120;
                image.data[i * 4 + 2] = 200;
                image.data[i * 4 + 3] = alpha;
            }
            ctx.putImageData(image, 0, 0);

            requestAnimationFrame(update);
        };

        window.addEventListener('resize', resizeSimulation);
        resizeSimulation();
        update();

        heroOverlay.addEventListener('mousemove', (event) => {
            const rect = heroOverlay.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / rect.width * simW);
            const y = Math.floor((event.clientY - rect.top) / rect.height * simH);
            disturb(x, y, 3, 1024);
        });

        heroOverlay.addEventListener('mouseleave', () => {
            // reduce effect quickly when leaving
            for (let i = 0; i < simW * simH; i++) {
                previous[i] = 0;
                current[i] = 0;
            }
        });
    }

    // 4. Portfolio Isotope-style Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Manage active states
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    if(filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 300); // sync with CSS transition duration
                    }
                });
            });
        });
    }
});
