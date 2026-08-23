/**
 * TRAVELIA - Fully Functional Pure JS Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTheme();
    initScrollAnimations();
    initCounters();
    initFilters();
    initFavorites();
    initModals();
    initTestimonials();
    initLightbox();
    initForms();
    initBackToTop();
    initGlobalSearch();
});

/* ==========================================================================
   1. NAVIGATION & SCROLLSPY
   ========================================================================== */
function initNavigation() {
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');

    // Sticky Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // ScrollSpy Highlight Active Link
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });

    // Mobile Hamburger Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fa-solid fa-xmark"></i>' 
                : '<i class="fa-solid fa-bars"></i>';
            document.body.classList.toggle('no-scroll');
        });
    }

    // Smooth Scroll & Auto Close Mobile Menu
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                navMenu.classList.remove('active');
                if (hamburger) hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.classList.remove('no-scroll');

                const headerOffset = 70;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ==========================================================================
   2. FAVORITES SYSTEM (Storage + UI Sync)
   ========================================================================== */
let favorites = JSON.parse(localStorage.getItem('travelia_favorites')) || [];
let activeModalCardId = null;

function initFavorites() {
    const favBadge = document.getElementById('fav-badge');
    const openFavBtn = document.getElementById('open-favorites');
    const favPanel = document.getElementById('fav-panel');
    const clearAllBtn = document.getElementById('clear-all-favs');

    updateFavUI();

    // Delegate Card Favorite Heart Clicks
    document.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.fav-btn');
        if (favBtn) {
            e.stopPropagation();
            const card = favBtn.closest('.card');
            if (card) toggleFavoriteCard(card);
        }
    });

    // Open Favorites Panel
    if (openFavBtn && favPanel) {
        openFavBtn.addEventListener('click', () => {
            renderFavPanel();
            favPanel.classList.add('active');
            document.body.classList.add('no-scroll');
        });
    }

    // Clear All Favorites
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            favorites = [];
            saveAndSyncFavs();
            renderFavPanel();
        });
    }

    // Modal Favorite Heart Toggle
    const modalFavToggle = document.getElementById('modal-fav-toggle');
    if (modalFavToggle) {
        modalFavToggle.addEventListener('click', () => {
            if (!activeModalCardId) return;
            const targetCard = document.querySelector(`.card[data-id="${activeModalCardId}"]`);
            if (targetCard) {
                toggleFavoriteCard(targetCard);
                // Update Modal Fav Heart UI
                const isFav = favorites.some(f => f.id === activeModalCardId);
                modalFavToggle.innerHTML = isFav ? '<i class="fa-solid fa-heart" style="color:var(--clr-orange)"></i>' : '<i class="fa-regular fa-heart"></i>';
            }
        });
    }
}

function toggleFavoriteCard(card) {
    const id = card.getAttribute('data-id');
    const title = card.getAttribute('data-title');
    const country = card.getAttribute('data-country');
    const img = card.getAttribute('data-img');
    const price = card.getAttribute('data-price');

    const index = favorites.findIndex(item => item.id === id);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id, title, country, img, price });
    }

    saveAndSyncFavs();
}

function saveAndSyncFavs() {
    localStorage.setItem('travelia_favorites', JSON.stringify(favorites));
    updateFavUI();
}

function updateFavUI() {
    const favBadge = document.getElementById('fav-badge');
    if (favBadge) favBadge.innerText = favorites.length;

    // Update all card hearts on page
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const id = card.getAttribute('data-id');
        const btn = card.querySelector('.fav-btn');
        const isFav = favorites.some(f => f.id === id);

        if (btn) {
            if (isFav) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            }
        }
    });
}

function renderFavPanel() {
    const favList = document.getElementById('fav-list');
    if (!favList) return;

    if (favorites.length === 0) {
        favList.innerHTML = '<p class="empty-msg">You haven\'t saved any favorites yet.</p>';
        return;
    }

    favList.innerHTML = favorites.map(item => `
        <div class="fav-item" onclick="jumpToFavItem('${item.id}')">
            <img src="${item.img}" alt="${item.title}">
            <div class="fav-item-info">
                <h4>${item.title}</h4>
                <span><i class="fa-solid fa-location-dot"></i> ${item.country} &bull; ${item.price}</span>
            </div>
            <button class="icon-btn remove-fav" onclick="event.stopPropagation(); removeFavItem('${item.id}')" title="Remove">
                <i class="fa-solid fa-trash" style="color:#d32f2f"></i>
            </button>
        </div>
    `).join('');
}

window.removeFavItem = function(id) {
    favorites = favorites.filter(f => f.id !== id);
    saveAndSyncFavs();
    renderFavPanel();
};

window.jumpToFavItem = function(id) {
    const favPanel = document.getElementById('fav-panel');
    if (favPanel) favPanel.classList.remove('active');
    document.body.classList.remove('no-scroll');

    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
        const headerOffset = 80;
        const elementPosition = card.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        card.style.outline = "2px solid var(--clr-turquoise)";
        setTimeout(() => card.style.outline = "none", 2000);
    }
};

/* ==========================================================================
   3. MODAL HANDLER (Details & View Trip)
   ========================================================================== */
function initModals() {
    const destModal = document.getElementById('dest-modal');
    const closeBtns = document.querySelectorAll('.modal-close');

    // Attach click listeners to all detail buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-details-btn');
        if (btn) {
            const card = btn.closest('.card');
            if (card) openCardModal(card);
        }
    });

    function openCardModal(card) {
        activeModalCardId = card.getAttribute('data-id');
        
        document.getElementById('modal-img').src = card.getAttribute('data-img');
        document.getElementById('modal-title').innerText = card.getAttribute('data-title');
        document.getElementById('modal-country').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${card.getAttribute('data-country')}`;
        document.getElementById('modal-rating').innerText = card.getAttribute('data-rating') || '4.9';
        document.getElementById('modal-reviews').innerText = card.getAttribute('data-reviews') || '10k';
        document.getElementById('modal-duration').innerText = card.getAttribute('data-duration') || '5 Days';
        document.getElementById('modal-desc').innerText = card.getAttribute('data-desc') || 'Incredible experience waiting for you.';
        document.getElementById('modal-price').innerText = card.getAttribute('data-price') || '$999';

        const modalFavToggle = document.getElementById('modal-fav-toggle');
        const isFav = favorites.some(f => f.id === activeModalCardId);
        if (modalFavToggle) {
            modalFavToggle.innerHTML = isFav ? '<i class="fa-solid fa-heart" style="color:var(--clr-orange)"></i>' : '<i class="fa-regular fa-heart"></i>';
        }

        destModal.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    const closeAll = () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        document.body.classList.remove('no-scroll');
    };

    closeBtns.forEach(btn => btn.addEventListener('click', closeAll));
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAll();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll();
    });
}

/* ==========================================================================
   4. FILTERS, COUNTERS, THEME & OTHER UTILITIES
   ========================================================================== */
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tripCards = document.querySelectorAll('.trip-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            tripCards.forEach(card => {
                card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                card.style.opacity = "0";
                
                setTimeout(() => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'flex';
                        setTimeout(() => { card.style.opacity = "1"; card.style.transform = "translateY(0)"; }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });
}

function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('travelia_theme') || 'light';

    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('travelia_theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('travelia_theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    }
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

function initCounters() {
    const statsSection = document.getElementById('stats-section');
    if (!statsSection) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !animated) {
            animated = true;
            document.querySelectorAll('.counter, .counter-float').forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const isFloat = counter.classList.contains('counter-float');
                let count = 0;
                const speed = target / 100;

                const update = () => {
                    count += speed;
                    if (count < target) {
                        counter.innerText = isFloat ? count.toFixed(1) : Math.ceil(count);
                        requestAnimationFrame(update);
                    } else {
                        counter.innerText = isFloat ? target.toFixed(1) : target;
                    }
                };
                update();
            });
        }
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

function initTestimonials() {
    const track = document.getElementById('testimonials-track');
    const prev = document.getElementById('testi-prev');
    const next = document.getElementById('testi-next');
    if (!track) return;

    if (next) next.addEventListener('click', () => track.scrollBy({ left: 350, behavior: 'smooth' }));
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -350, behavior: 'smooth' }));
}

function initLightbox() {
    const galleryImgs = document.querySelectorAll('.gallery-img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-nav.prev');
    const nextBtn = document.querySelector('.lightbox-nav.next');
    const counter = document.getElementById('lightbox-counter');

    if (!lightbox) return;

    let currentIndex = 0;
    const images = Array.from(galleryImgs).map(img => img.src);

    const update = () => {
        lightboxImg.src = images[currentIndex];
        counter.innerText = `${currentIndex + 1} / ${images.length}`;
    };

    galleryImgs.forEach((img, i) => {
        img.addEventListener('click', () => {
            currentIndex = i;
            update();
            lightbox.classList.add('active');
            document.body.classList.add('no-scroll');
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    if (nextBtn) nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; update(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; update(); });
}

function initForms() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = document.getElementById('newsletter-msg');
            const input = document.getElementById('email-input');
            if (input.value.includes('@')) {
                msg.className = "form-msg msg-success";
                msg.innerText = "✓ Thank you! You have successfully subscribed.";
                input.value = "";
            } else {
                msg.className = "form-msg msg-error";
                msg.innerText = "Please enter a valid email address.";
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = document.getElementById('contact-msg');
            msg.className = "form-msg msg-success";
            msg.innerText = "✓ Message sent successfully! We will get back to you soon.";
            contactForm.reset();
        });
    }
}

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initGlobalSearch() {
    const overlay = document.getElementById('search-overlay');
    const toggle = document.getElementById('toggle-search');
    const close = document.getElementById('close-search');
    const input = document.getElementById('global-search-input');
    const results = document.getElementById('search-results');

    if (!overlay || !toggle) return;

    toggle.addEventListener('click', () => {
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        input.value = '';
        results.innerHTML = '';
        setTimeout(() => input.focus(), 100);
    });

    if (close) close.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        results.innerHTML = '';
        if (!query) return;

        const cards = document.querySelectorAll('.card');
        let matches = 0;

        cards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const country = card.getAttribute('data-country').toLowerCase();

            if (title.includes(query) || country.includes(query)) {
                matches++;
                const item = document.createElement('div');
                item.className = 'fav-item';
                item.innerHTML = `<h4>${card.getAttribute('data-title')} (${card.getAttribute('data-country')})</h4>`;
                item.addEventListener('click', () => {
                    overlay.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                    jumpToFavItem(card.getAttribute('data-id'));
                });
                results.appendChild(item);
            }
        });

        if (matches === 0) {
            results.innerHTML = '<p class="empty-msg">😕 No destinations found.</p>';
        }
    });
}