document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       DARK MODE TOGGLE
    ========================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Cek Local Storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        // Cek OS preference jika belum ada di local storage
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            htmlElement.setAttribute('data-theme', 'dark');
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    /* ==========================================
       MOBILE MENU HAMBURGER
    ========================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Tutup menu saat link diklik (di mobile)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    /* ==========================================
       STICKY NAVBAR & ACTIVE LINK
    ========================================== */
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    
    window.addEventListener('scroll', () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Nav Link on Scroll
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    });

    /* ==========================================
       PROJECT FILTERING
    ========================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || filterValue === category) {
                    item.style.display = 'flex';
                    // Trigger reflow untuk animasi (opsional jika ingin fade saat filter)
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                }
            });
            
            // Perbarui scroll indicators jika ada perubahan filter
            setTimeout(() => {
                if(typeof window.updateProjectDots === 'function') window.updateProjectDots();
            }, 100);
        });
    });

    /* ==========================================
       SCROLL ANIMATION (FADE IN)
    ========================================== */
    const fadeElements = document.querySelectorAll('.fade-up, .fade-left');

    const fadeOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Hanya animasi sekali
            }
        });
    }, fadeOptions);

    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });

    /* ==========================================
       BACK TO TOP BUTTON
    ========================================== */
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* ==========================================
       SCROLL INDICATORS (DOTS)
    ========================================== */
    function initScrollIndicators(containerSelector, indicatorContainerId) {
        const container = document.querySelector(containerSelector);
        const indicatorContainer = document.getElementById(indicatorContainerId);
        
        if (!container || !indicatorContainer) return;
        
        let scrollHandler = null;

        function updateDots() {
            const visibleItems = Array.from(container.children).filter(item => {
                return window.getComputedStyle(item).display !== 'none';
            });
            
            indicatorContainer.innerHTML = '';
            
            if (scrollHandler) {
                container.removeEventListener('scroll', scrollHandler);
            }
            
            if (visibleItems.length <= 1) return;

            const dots = [];
            visibleItems.forEach((item, i) => {
                const dot = document.createElement('div');
                dot.classList.add('indicator-dot');
                if (i === 0) dot.classList.add('active');
                
                dot.addEventListener('click', () => {
                    const scrollPos = item.offsetLeft - container.offsetLeft - 15;
                    container.scrollTo({ left: scrollPos, behavior: 'smooth' });
                });
                
                indicatorContainer.appendChild(dot);
                dots.push({ el: dot, item: item });
            });

            scrollHandler = () => {
                let activeIndex = 0;
                let minDiff = Infinity;
                const containerCenter = container.getBoundingClientRect().left + (container.clientWidth / 2);
                
                visibleItems.forEach((item, i) => {
                    const itemRect = item.getBoundingClientRect();
                    const itemCenter = itemRect.left + (itemRect.width / 2);
                    const diff = Math.abs(itemCenter - containerCenter);
                    
                    if (diff < minDiff) {
                        minDiff = diff;
                        activeIndex = i;
                    }
                });
                
                dots.forEach((dotObj, index) => {
                    if (index === activeIndex) {
                        dotObj.el.classList.add('active');
                    } else {
                        dotObj.el.classList.remove('active');
                    }
                });
            };
            
            container.addEventListener('scroll', scrollHandler);
            // Trigger untuk set index awal
            container.dispatchEvent(new Event('scroll'));
        }

        updateDots();
        return updateDots;
    }

    window.updateProjectDots = initScrollIndicators('.project-grid', 'project-indicators');
    initScrollIndicators('.gallery-grid', 'gallery-indicators');

});

/* ==========================================
   MODAL 3D GALLERY (Global Scope)
========================================== */
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const captionText = document.getElementById("modal-caption");
const span = document.getElementsByClassName("close-modal")[0];

// Fungsi dipanggil via onclick di HTML
window.openModal = function(imageSrc, caption) {
    modal.style.display = "block";
    modalImg.src = imageSrc;
    captionText.innerHTML = caption;
    
    // Prevent scrolling behind modal
    document.body.style.overflow = "hidden";
}

if (span) {
    span.onclick = function() { 
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// Menutup modal jika klik di luar gambar
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}
