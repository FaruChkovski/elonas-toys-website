// =========================================
// Elona's Toys — Frontend Application
// Static HTML + vanilla JS (no build step)
// =========================================

// --- State ---
let state = {
  lang: (() => {
    const saved = localStorage.getItem('elona-lang');
    if (saved) return saved;
    try { if (navigator.language?.startsWith('ar')) return 'ar'; } catch (e) {}
    return 'en';
  })(),
  theme: localStorage.getItem('elona-theme') || 'light',
  cart: [],
  watchlist: JSON.parse(localStorage.getItem('elona-watchlist') || '[]'),
  products: [],
  ageBrackets: [
    "0–12 Months",
    "1–3 Years",
    "3–5 Years",
    "6–8 Years",
    "9+ Years"
  ],
  categories: [
    "Baby & Toddler",
    "Dolls & Pretend Play",
    "Cars & Action",
    "Educational & STEM",
    "Board Games & Puzzles",
    "Outdoor & Ride-Ons",
    "Kids Essentials"
  ],
  filters: {
    age: 'all',
    category: 'all',
    keyword: '',
    budget: 'all'
  },
  budgetRanges: [
    { label: '0–25$', min: null, max: 25 },
    { label: '25–50$', min: 25, max: 50 },
    { label: '50–100$', min: 50, max: 100 },
    { label: '100+ $', min: 100, max: null }
  ],
  viewMode: 'grid', // 'grid' or 'list',
  whatsapp: '+961 78 702 712', // overridden from products.json store.whatsapp after load
  store: null
};

// --- DOM Elements ---
const els = {
  html: document.documentElement,
  themeToggle: document.getElementById('themeToggle'),
  langToggle: document.getElementById('langToggle'),
  cartBadge: document.getElementById('cartBadge'),
  cartCount: document.getElementById('cartCount'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartItems: document.getElementById('cartItems'),
  cartTotal: document.getElementById('cartTotal'),
  modalOverlay: document.getElementById('modalOverlay'),
  searchInput: document.getElementById('searchInput'),
  modalSearchInput: document.getElementById('modalSearchInput'),
  productsGrid: document.getElementById('productsGrid'),
  catalogResultCount: document.getElementById('catalogResultCount'),
  modalAgeFilterContainer: document.getElementById('modalAgeFilterContainer'),
  modalCategoryFilterContainer: document.getElementById('modalCategoryFilterContainer'),
  modalBudgetFilterContainer: document.getElementById('modalBudgetFilterContainer'),
  viewGridBtn: document.getElementById('viewGridBtn'),
  viewListBtn: document.getElementById('viewListBtn'),
  toast: document.getElementById('toast'),
  whatsappCheckout: document.getElementById('whatsappCheckout'),
  copyNumberBtn: document.getElementById('copyNumberBtn')
};

// --- Init ---
async function init() {
  // 1. Apply theme and language immediately (no dependencies)
  applyTheme();
  applyLang();
  updateCartUI();

  // 2. Attach ALL event listeners immediately — buttons work even if product fetch fails.
  // Guard each against missing elements so init() never crashes on pages that
  // don't have every control (e.g. index.html has no view-grid/list buttons).
  if (els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);
  if (els.langToggle) els.langToggle.addEventListener('click', toggleLang);
  if (els.cartBadge && els.cartDrawer) {
    els.cartBadge.addEventListener('click', () => els.cartDrawer.classList.toggle('open'));
  }

  const searchTrigger = document.getElementById('searchTrigger');
  const modalClose = document.getElementById('modalClose');
  if (searchTrigger && els.modalOverlay) {
    searchTrigger.addEventListener('click', () => els.modalOverlay.classList.add('open'));
  }
  if (modalClose && els.modalOverlay) {
    modalClose.addEventListener('click', () => els.modalOverlay.classList.remove('open'));
  }
  if (els.modalOverlay) {
    els.modalOverlay.addEventListener('click', (e) => {
      if (e.target === els.modalOverlay) els.modalOverlay.classList.remove('open');
    });
  }

  if (els.searchInput) {
    els.searchInput.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value.toLowerCase();
      renderProducts();
    });
  }
  if (els.modalSearchInput) {
    els.modalSearchInput.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value.toLowerCase();
      renderProducts();
    });
  }

  // Wire modal filter containers (rendered on-demand via renderFilters below)
  if (els.modalAgeFilterContainer) {
    els.modalAgeFilterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        const val = e.target.dataset.value;
        state.filters.age = val;
        els.modalAgeFilterContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
      }
    });
  }
  if (els.modalCategoryFilterContainer) {
    els.modalCategoryFilterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        const val = e.target.dataset.value;
        state.filters.category = val;
        els.modalCategoryFilterContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
      }
    });
  }
  if (els.modalBudgetFilterContainer) {
    els.modalBudgetFilterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        const val = e.target.dataset.value;
        state.filters.budget = val;
        els.modalBudgetFilterContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
      }
    });
  }

  if (els.viewGridBtn) els.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  if (els.viewListBtn) els.viewListBtn.addEventListener('click', () => setViewMode('list'));

  if (els.whatsappCheckout) els.whatsappCheckout.addEventListener('click', whatsappCheckout);
  if (els.copyNumberBtn) els.copyNumberBtn.addEventListener('click', copyNumber);

  // Close cart when clicking outside
  if (els.cartBadge && els.cartDrawer) {
    document.addEventListener('click', (e) => {
      if (!els.cartBadge.contains(e.target) && !els.cartDrawer.contains(e.target)) {
        els.cartDrawer.classList.remove('open');
      }
    });
  }

  // Mobile hamburger menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle('open');
      mobileMenuToggle.textContent = open ? '✕' : '☰';
    });
    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileMenuToggle.textContent = '☰';
      });
    });
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        mobileMenuToggle.textContent = '☰';
      }
    });
  }

  // 3. Load products (async, non-blocking — won't break buttons if it fails)
  try {
    const res = await fetch('products.json');
    const data = await res.json();
    state.products = data.products;
    state.store = data.store;
    if (data.store?.whatsapp) state.whatsapp = data.store.whatsapp;
    document.title = data.store.name;
    syncWhatsappLinks();
  } catch (e) {
    console.error('Failed to load products:', e);
  }

  // 4. Apply pre-selected filters from URL params (?age=...&category=...)
  applyUrlFilters();

  renderFilters();
  renderProducts();
  renderSpecialOffers();
  renderWatchlist();
}

// --- URL filter params ---
function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const ageParam = params.get('age');
  const catParam = params.get('category');

  if (ageParam) {
    const decoded = decodeURIComponent(ageParam);
    const match = state.ageBrackets.find(a => a === decoded);
    if (match) state.filters.age = match;
  }
  if (catParam) {
    const decoded = decodeURIComponent(catParam);
    const match = state.categories.find(c => c === decoded);
    if (match) state.filters.category = match;
  }
}

// --- Theme ---
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('elona-theme', state.theme);
  applyTheme();
}
function applyTheme() {
  els.html.setAttribute('data-theme', state.theme);
  els.themeToggle.textContent = state.theme === 'light' ? '🌙' : '☀️';
}

// --- Language ---
function toggleLang() {
  state.lang = state.lang === 'en' ? 'ar' : 'en';
  localStorage.setItem('elona-lang', state.lang);
  applyLang();
  renderProducts();
}
function applyLang() {
  els.html.setAttribute('lang', state.lang);
  els.html.setAttribute('dir', state.lang === 'ar' ? 'rtl' : 'ltr');
  els.langToggle.textContent = state.lang === 'en' ? 'EN / AR' : 'AR / EN';

  // Translate static strings
  const translations = {
    en: {
      'nav.home': 'Home', 'nav.catalog': 'Catalog', 'nav.about': 'About Us',
      'nav.watchlist': 'Watchlist', 'nav.delivery': 'Delivery Info',
      'hero.title': "Elona's Toys", 'hero.tagline': "Your One-Stop Kids Store — Toys & Essentials — Quality You Can Trust",
      'hero.shop': 'Shop Toys', 'hero.whatsapp': 'WhatsApp Us',
      'section.special': 'Special Offers', 'section.categories': 'Categories',
      'section.socials': 'Follow Us', 'section.feedback': "Customer Feedbacks",
      'section.location': 'Visit Us', 'footer.rights': '© 2026 Elona\'s Toys — Khaldeh, Lebanon',
      'cart.title': 'Your Cart', 'cart.empty': 'Your cart is waiting 🧸', 'cart.checkout': 'Checkout via WhatsApp',
      'filter.age': 'Filter by Age', 'filter.category': 'Filter by Category',
      'view.grid': 'Grid', 'view.list': 'List',
      'copy.success': 'Number copied!', 'toast.added': 'Added to cart 🧸',
      'watchlist.title': 'Your Watchlist', 'watchlist.subtitle': 'Save toys you love and get notified when they\'re on offer.',
      'watchlist.empty': 'Your watchlist is empty', 'watchlist.browse': 'Browse Catalog',
      'watchlist.add': 'Add to Watchlist', 'watchlist.remove': 'Remove from Watchlist',
      'watchlist.notify': 'You\'ll be notified when this goes on offer!',
      'auth.signIn': 'Sign In / Join', 'auth.createAccount': 'Create Account',
      'auth.signInWithGoogle': 'Continue with Google', 'auth.signUpWithGoogle': 'Continue with Google',
      'auth.or': 'or', 'auth.noAccount': "Don't have an account?", 'auth.haveAccount': 'Already have an account?',
      'auth.welcome': 'Welcome to Elona\'s Toys 🧸', 'auth.completeProfile': "Let's complete your profile",
      'auth.saveProfile': 'Save & Continue', 'auth.marketing': "I'd like to hear about offers"
    },
    ar: {
      'nav.home': 'الرئيسية', 'nav.catalog': 'المتجر', 'nav.about': 'معلومات عنا',
      'nav.watchlist': 'قائمة الأمنيات', 'nav.delivery': 'معلومات التوصيل',
      'hero.title': "ألعاب إيلونا", 'hero.tagline': "متجرك الشامل للأطفال — ألعاب ومستلزمات — جودة تثق بها",
      'hero.shop': 'تسوق الألعاب', 'hero.whatsapp': 'واتساب',
      'section.special': 'عروض خاصة', 'section.categories': 'الأقسام',
      'section.socials': 'تابعونا', 'section.feedback': 'آراء العملاء',
      'section.location': 'قم بزيارتنا', 'footer.rights': '© 2026 ألعاب إيلونا — خلدة، لبنان',
      'cart.title': 'عربة التسوق', 'cart.empty': 'عربتك في انتظارك 🧸', 'cart.checkout': 'الدفع عبر واتساب',
      'filter.age': 'تصفية حسب العمر', 'filter.category': 'تصفية حسب القسم', 'filter.budget': 'تصفية حسب الميزانية',
      'view.grid': 'عرض شبكي', 'view.list': 'عرض قائمة',
      'copy.success': 'تم نسخ الرقم!', 'toast.added': 'أضيف إلى السلة 🧸',
      'watchlist.title': 'قائمة الأمنيات', 'watchlist.subtitle': 'احفظ الألعاب المفضلة واحصل على إشعار عند توفر عروض.',
      'watchlist.empty': 'قائمة الأمنيات فارغة', 'watchlist.browse': 'تصفح الكتالوج',
      'watchlist.add': 'إضافة إلى الأمنيات', 'watchlist.remove': 'إزالة من الأمنيات',
      'watchlist.notify': 'سيتم إعلامك عند توفر عرض!',
      'auth.signIn': 'تسجيل الدخول / انضمام', 'auth.createAccount': 'إنشاء حساب',
      'auth.signInWithGoogle': 'استمرار مع جوجل', 'auth.signUpWithGoogle': 'استمرار مع جوجل',
      'auth.or': 'أو', 'auth.noAccount': 'ليس لديك حساب؟', 'auth.haveAccount': 'لديك حساب بالفعل؟',
      'auth.welcome': 'أهلاً بك في ألعاب إيلونا 🧸', 'auth.completeProfile': 'دعنا نكمل ملفك الشخصي',
      'auth.saveProfile': 'حفظ والمتابعة', 'auth.marketing': 'أرغب في سماع العروض'
    }
  };
  const t = translations[state.lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  // Only set the store-name title on the homepage (title is just the store name).
  // Subpages already have their own <title> (e.g. "Catalog — Elona's Toys") — preserve them.
  if (document.title === "Elona's Toys" || document.title === 'ألعاب إيلونا') {
    document.title = state.lang === 'ar' ? 'ألعاب إيلونا' : "Elona's Toys";
  }
}

// --- Filters ---
function renderFilters() {
  // Render main-page containers if present (catalog.html)
  const mainAgeContainer = document.getElementById('ageFilterContainer');
  const mainCatContainer = document.getElementById('categoryFilterContainer');
  const mainBudgetContainer = document.getElementById('budgetFilterContainer');
  if (mainAgeContainer || mainCatContainer) {
    renderFilterContainer('age', mainAgeContainer);
    renderFilterContainer('category', mainCatContainer);
    if (mainBudgetContainer) renderFilterContainer('budget', mainBudgetContainer);
  }
  // Render modal containers if present (index, product-detail, about, contact, delivery)
  if (els.modalAgeFilterContainer || els.modalCategoryFilterContainer) {
    renderFilterContainer('age', els.modalAgeFilterContainer);
    renderFilterContainer('category', els.modalCategoryFilterContainer);
    if (els.modalBudgetFilterContainer) renderFilterContainer('budget', els.modalBudgetFilterContainer);
  }
  if (!mainAgeContainer && !els.modalAgeFilterContainer) return;

  // Chip click handlers for main containers
  if (mainAgeContainer) {
    mainAgeContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        const val = e.target.dataset.value;
        state.filters.age = val;
        mainAgeContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
      }
    });
  }
  if (mainCatContainer) {
    mainCatContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        const val = e.target.dataset.value;
        state.filters.category = val;
        mainCatContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
      }
    });
  }
  if (mainBudgetContainer) {
    mainBudgetContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        const val = e.target.dataset.value;
        state.filters.budget = val;
        mainBudgetContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts();
      }
    });
  }
}

function renderFilterContainer(kind, container) {
  container.innerHTML = '<button class="chip active" data-filter="' + kind + '" data-value="all">' + (state.lang === 'ar' ? kind === 'age' ? 'جميع الأعمار' : kind === 'category' ? 'جميع الأقسام' : 'جميع الميزانيات' : kind === 'age' ? 'All Ages' : kind === 'category' ? 'All Categories' : 'All Budgets') + '</button>';
  let items = [];
  if (kind === 'age') items = state.ageBrackets || [];
  if (kind === 'category') items = state.categories || [];
  if (kind === 'budget') items = state.budgetRanges.map(r => r.label);
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.filter = kind;
    btn.dataset.value = item;
    btn.textContent = item;
    container.appendChild(btn);
  });
}

// --- Products ---
window.renderProducts = function renderProducts() {
  if (!els.productsGrid) return;

  const filtered = state.products.filter(p => {
    const ageMatch = state.filters.age === 'all' || p.ageBracket === state.filters.age;
    const catMatch = state.filters.category === 'all' || p.category === state.filters.category;
    const kwMatch = state.filters.keyword === '' ||
      p.name.toLowerCase().includes(state.filters.keyword) ||
      (p.nameAr && p.nameAr.toLowerCase().includes(state.filters.keyword));
    let budgetMatch = true;
    if (state.filters.budget !== 'all') {
      const range = state.budgetRanges.find(r => r.label === state.filters.budget);
      if (range) {
        if (range.min !== null && p.price < range.min) budgetMatch = false;
        if (range.max !== null && p.price > range.max) budgetMatch = false;
      }
    }
    return ageMatch && catMatch && kwMatch && budgetMatch;
  });

  // Update result count
  if (els.catalogResultCount) {
    const count = filtered.length;
    const total = state.products.length;
    const label = state.lang === 'ar'
      ? (count === total ? 'إظهار جميع الألعاب (' + total + ')' : 'نتائج (' + count + ' من ' + total + ')')
      : (count === total ? 'Showing all toys (' + total + ')' : count + ' of ' + total + ' toys');
    els.catalogResultCount.textContent = label;
  }

  if (state.viewMode === 'grid') {
    els.productsGrid.className = 'grid grid-cols-4';
    els.productsGrid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
  } else {
    els.productsGrid.className = 'grid grid-cols-4';
    els.productsGrid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
  }
}

function renderSpecialOffers() {
  const container = document.getElementById('specialOffers');
  if (!container || !state.store?.specialOffers) return;

  const offers = state.store.specialOffers
    .map(id => state.products.find(p => p.id === id))
    .filter(Boolean);

  container.innerHTML = offers.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const name = state.lang === 'ar' && p.nameAr ? p.nameAr : p.name;
  const stockClass = p.stock.toLowerCase().replace(' ', '-');
  return `
    <article class="card product-card fade-in" data-id="${p.id}">
      <div class="product-image" style="position:relative;">
        <img src="${p.images?.[0] || 'assets/placeholder-bear-card.png'}" alt="${escapeHtml(name)}" style="width:100%; height:100%; object-fit:cover; display:block;">
        ${renderOfferBadge(p)}
      </div>
      <span class="product-badge">${p.ageBracket}</span>
      <div class="product-info">
        <div class="product-name">${escapeHtml(name)}</div>
        <div class="product-stock ${stockClass}">${p.stock}</div>
        <div class="product-price">$${p.price}</div>
      </div>
      <div class="product-actions">
        <button class="btn btn-accent btn-sm w-full mb-8" onclick="addToCart('${p.id}')">${state.lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart <span style="font-size:1.15em; text-shadow:0 1px 2px rgba(0,0,0,0.6);">🛒</span>'}</button>
        <button class="btn btn-ghost btn-sm w-full mb-8" onclick="toggleWatchlist('${p.id}')" style="color:var(--color-text); border-color:var(--color-border);">${isInWatchlist(p.id) ? (state.lang === 'ar' ? 'مُضاف للأمنيات' : 'Added to Watchlist 💖') : (state.lang === 'ar' ? 'إضافة للأمنيات' : 'Add to Watchlist 💖')}</button>
        <button class="btn btn-ghost btn-sm w-full" onclick="openProductModal('${p.id}')" style="color:var(--color-text); border-color:var(--color-border);">${state.lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}</button>
      </div>
    </article>
  `;
}

/* Small "On Offer" badge shown on the product image when the item has a discount */
function renderOfferBadge(p) {
  const offer = state.store?.offers?.[p.id];
  if (!offer || !offer.originalPrice || offer.originalPrice <= p.price) return '';
  const discountPct = Math.round(((offer.originalPrice - p.price) / offer.originalPrice) * 100);
  return `<span class="offer-badge">-${discountPct}%</span>`;
}

function setViewMode(mode) {
  state.viewMode = mode;
  els.viewGridBtn.classList.toggle('active', mode === 'grid');
  els.viewListBtn.classList.toggle('active', mode === 'list');
  renderProducts();
}

// --- Cart ---
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(state.lang === 'ar' ? 'أضيف إلى السلة 🧸' : 'Added to cart 🧸');
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function changeQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else {
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

function saveCart() {
  localStorage.setItem('elona-cart', JSON.stringify(state.cart));
}

// --- Watchlist ---
function toggleWatchlist(productId) {
  const existing = state.watchlist.find(item => item.id === productId);
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const name = state.lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  if (existing) {
    state.watchlist = state.watchlist.filter(item => item.id !== productId);
    showToast(state.lang === 'ar' ? 'تم الإزالة من الأمنيات' : 'Removed from watchlist');
  } else {
    state.watchlist.push({ id: productId });
    showToast(state.lang === 'ar' ? 'تم الإضافة إلى الأمنيات' : 'Added to watchlist 💖');
  }
  saveWatchlist();
  renderWatchlist();
}

function saveWatchlist() {
  localStorage.setItem('elona-watchlist', JSON.stringify(state.watchlist));
}

function isInWatchlist(productId) {
  return state.watchlist.some(item => item.id === productId);
}

function renderWatchlist() {
  const empty = document.getElementById('watchlistEmpty');
  const grid = document.getElementById('watchlistGrid');
  if (!empty || !grid) return; // not on homepage

  if (state.watchlist.length === 0) {
    empty.style.display = '';
    grid.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = state.watchlist.map(item => {
    const p = state.products.find(prod => prod.id === item.id);
    if (!p) return '';
    const name = state.lang === 'ar' && p.nameAr ? p.nameAr : p.name;
    const desc = state.lang === 'ar' && p.descriptionAr ? p.descriptionAr : p.description;
    const onOffer = state.store?.specialOffers?.includes(p.id);
    return `
      <article class="card product-card fade-in">
        <div class="product-image" style="height:160px;">🧸</div>
        <span class="product-badge">${p.ageBracket}</span>
        <div class="product-info">
          <div class="product-name">${escapeHtml(name)}</div>
          <div class="product-price">$${p.price}</div>
          <p class="product-desc" style="font-size:0.85rem; color:var(--color-text-muted); margin:10px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(desc)}</p>
          ${onOffer ? `<div style="color:var(--color-primary); font-weight:700; font-size:0.85rem;">🎉 On offer!</div>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-accent btn-sm w-full mb-8" onclick="addToCart('${p.id}')">${state.lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart <span style="font-size:1.15em; text-shadow:0 1px 2px rgba(0,0,0,0.6);">🛒</span>'}</button>
          <button class="btn btn-ghost btn-sm w-full" onclick="toggleWatchlist('${p.id}')" style="color:var(--color-text); border-color:var(--color-border);">${state.lang === 'ar' ? 'إزالة من الأمنيات' : 'Remove from Watchlist'}</button>
        </div>
      </article>
    `;
  }).join('');
}

function updateCartUI() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  els.cartCount.textContent = totalQty;
  els.cartCount.style.display = totalQty > 0 ? 'flex' : 'none';
  renderCartItems();
}

function renderCartItems() {
  if (state.cart.length === 0) {
    els.cartItems.innerHTML = `<div class="cart-empty">${state.lang === 'ar' ? 'عربتك في انتظارك 🧸' : 'Your cart is waiting 🧸'}</div>`;
    els.cartTotal.textContent = '$0';
    return;
  }
  els.cartItems.innerHTML = state.cart.map(item => {
    const p = state.products.find(prod => prod.id === item.id);
    if (!p) return '';
    const name = state.lang === 'ar' && p.nameAr ? p.nameAr : p.name;
    const lineTotal = p.price * item.qty;
    return `
      <div class="cart-item">
        <div class="bear">🧸</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(name)}</div>
          <div class="cart-item-price">$${p.price} × ${item.qty}</div>
          <div class="cart-item-qty">${state.lang === 'ar' ? 'الكمية' : 'Qty'}: ${item.qty}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="changeQty('${p.id}', -1)">−</button>
          <button class="btn btn-ghost btn-sm" onclick="changeQty('${p.id}', 1)">+</button>
          <button class="btn btn-ghost btn-sm" style="color:#C62828;" onclick="removeFromCart('${p.id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  const total = state.cart.reduce((sum, item) => {
    const p = state.products.find(prod => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  els.cartTotal.textContent = `$${total}`;
}

// --- WhatsApp Checkout ---
function whatsappCheckout() {
  if (state.cart.length === 0) {
    showToast(state.lang === 'ar' ? 'عربتك فارغة' : 'Your cart is empty');
    return;
  }
  const lines = state.cart.map(item => {
    const p = state.products.find(prod => prod.id === item.id);
    if (!p) return '';
    return `- ${p.name} ×${item.qty} = $${(p.price * item.qty).toFixed(2)}`;
  }).join('\n');
  const total = state.cart.reduce((sum, item) => {
    const p = state.products.find(prod => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const message = `New order from Elona's Toys 🧸\n\n${lines}\n\nTotal: $${total.toFixed(2)}\nPayment: Whish Money or Pay Upon Delivery`;
  const url = `https://wa.me/${state.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// --- Copy Number ---
function copyNumber() {
  navigator.clipboard.writeText(state.whatsapp).then(() => {
    showToast(state.lang === 'ar' ? 'تم نسخ الرقم!' : 'Number copied!');
  });
}

function syncWhatsappLinks() {
  document.querySelectorAll('a[data-whatsapp]').forEach(a => {
    try {
      const url = new URL(a.href);
      const phone = state.whatsapp.replace(/\+/g, '').replace(/\s/g, '');
      url.hostname = 'wa.me';
      url.pathname = '/' + phone;
      a.href = url.toString();
    } catch (e) { /* ignore */ }
  });
}

// --- Toast ---
function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 2500);
}

// --- Utility ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- Product Detail Modal --- (full detailed view opened by View Details)
function openProductModal(productId) {
  const p = state.products.find(prod => prod.id === productId);
  if (!p) return;
  const overlay = document.getElementById('productModalOverlay');
  const content = document.getElementById('productModalContent');
  // Some pages (e.g. index.html) don't have the product modal markup — fall back
  // to opening the product modal instead of a removed page.
  if (!overlay || !content) {
    openProductModal(productId);
    return;
  }
  const name = state.lang === 'ar' && p.nameAr ? p.nameAr : p.name;
  const desc = state.lang === 'ar' && p.descriptionAr ? p.descriptionAr : p.description;
  const details = p.details || desc;
  const stockClass = p.stock.toLowerCase().replace(' ', '-');
  const offer = state.store?.offers?.[p.id];
  const onOffer = !!offer && offer.originalPrice && offer.originalPrice > p.price;
  const discountPct = onOffer ? Math.round(((offer.originalPrice - p.price) / offer.originalPrice) * 100) : 0;
  const savings = onOffer ? (offer.originalPrice - p.price).toFixed(2) : 0;

  const priceHTML = onOffer
    ? `<div class="product-offer-price" style="margin-bottom:16px;">
         <span class="product-price-original">${offer.originalPrice.toFixed(2)}</span>
         <span class="product-price-sale" style="font-size:1.75rem;">$${p.price}</span>
         <span class="product-discount" style="font-size:0.9rem; margin-left:8px;">-${discountPct}% (save $${savings})</span>
       </div>`
    : `<div style="font-size:1.75rem; font-weight:700; color:var(--color-primary); margin-bottom:16px;">$${p.price}</div>`;

  content.innerHTML = `
    <div style="position:relative; text-align:center; margin-bottom:8px;">
      <img src="${p.images?.[0] || 'assets/placeholder-bear-detail.png'}" alt="${escapeHtml(name)}" style="width:100%; max-width:420px; height:auto; border-radius:var(--radius-sm); border:1px solid var(--color-border); object-fit:cover; margin-bottom:12px; display:block; margin-left:auto; margin-right:auto;">
      ${onOffer ? `<span class="offer-badge" style="position:absolute; top:10px; left:10px;">On Offer -${discountPct}%</span>` : ''}
    </div>
    <h2 style="font-family:var(--font-heading); color:var(--color-primary); margin-bottom:8px;">${escapeHtml(name)}</h2>
    <span style="font-size:0.9rem; font-weight:700; color:var(--color-primary);">Age: ${p.ageBracket}</span>
    <span class="product-stock ${stockClass}" style="margin-left:12px;">${p.stock}</span>
    <div style="margin:20px 0;">
      <h3 style="font-family:var(--font-heading); color:var(--color-primary); margin-bottom:8px;">Product Details</h3>
      <p style="color:var(--color-text-muted); line-height:1.7; margin-bottom:12px;">${escapeHtml(desc)}</p>
      <h4 style="font-family:var(--font-heading); color:var(--color-text); margin-bottom:6px; font-size:1rem;">How to Use</h4>
      <p style="color:var(--color-text-muted); line-height:1.7; margin-bottom:16px;">${escapeHtml(details)}</p>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:16px; background:var(--color-surface); border-radius:var(--radius-sm); border:1px solid var(--color-border);">
      <div>
        <div style="font-size:0.85rem; color:var(--color-text-muted);">Price</div>
        ${priceHTML}
      </div>
      <div>
        <div style="font-size:0.85rem; color:var(--color-text-muted);">Category</div>
        <div style="font-size:1rem; font-weight:600;">${escapeHtml(p.category)}</div>
      </div>
    </div>
    <div style="display:flex; gap:12px;">
      <button class="btn btn-accent" style="flex:1;" onclick="addToCart('${p.id}')">${state.lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart <span style="font-size:1.15em; text-shadow:0 1px 2px rgba(0,0,0,0.6);">🛒</span>'}</button>
      <a href="https://wa.me/${state.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`I want to order ${name} for $${p.price} from Elona's Toys`)}" class="btn btn-primary" target="_blank">${state.lang === 'ar' ? 'طلب عبر واتساب' : 'Order via WhatsApp'}</a>
    </div>
  `;
  document.getElementById('productModalOverlay').classList.add('open');
}

// Close the product detail modal when the × button is clicked
const productModalCloseBtn = document.getElementById('productModalClose');
if (productModalCloseBtn) {
  productModalCloseBtn.addEventListener('click', () => {
    document.getElementById('productModalOverlay').classList.remove('open');
  });
}


const origToggleWatchlist = window.toggleWatchlist;
window.toggleWatchlist = async function(productId) {
  origToggleWatchlist(productId);
  await syncWatchlistToFirestore();
};

// Auth state listener — sync watchlist on login
window.firebaseAuth?.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const snap = await getDoc(doc(window.firebaseDb, 'users', user.uid, 'watchlist', 'items'));
      if (snap.exists() && snap.data().items) {
        state.watchlist = snap.data().items;
      }
      renderWatchlist();
    } catch (e) { /* best effort */ }
  }
});

// --- Auth UI ---
function setupAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const authModal = document.getElementById('authModal');
  const authModalClose = document.getElementById('authModalClose');

  function showAuthModal() {
    if (!authModal) return;
    authModal.classList.add('open');
    showSignInForm();
  }
  function hideAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('open');
  }
  function showSignInForm() {
    const sIn = document.getElementById('authFormSignIn');
    const sUp = document.getElementById('authFormSignUp');
    const prof = document.getElementById('authProfileForm');
    if (sIn) sIn.style.display = '';
    if (sUp) sUp.style.display = 'none';
    if (prof) prof.style.display = 'none';
  }
  function showSignUpForm() {
    const sIn = document.getElementById('authFormSignIn');
    const sUp = document.getElementById('authFormSignUp');
    const prof = document.getElementById('authProfileForm');
    if (sIn) sIn.style.display = 'none';
    if (sUp) sUp.style.display = '';
    if (prof) prof.style.display = 'none';
  }

  if (authModalClose) {
    authModalClose.addEventListener('click', hideAuthModal);
  }
  if (authModal) {
    authModal.addEventListener('click', (e) => { if (e.target === authModal) hideAuthModal(); });
  }

  // Single click handler on the auth button — checks auth state at click time
  // so it works even if Firebase's onAuthStateChanged hasn't fired yet, and
  // so updateAuthUI never overwrites it with a stale handler.
  if (authBtn) {
    authBtn.onclick = null;
    authBtn.onclick = (e) => {
      e.stopPropagation();
      const user = window.firebaseAuth?.currentUser;
      if (user) {
        console.log('[auth] profile button clicked (signed in)');
        showProfilePopup();
      } else {
        console.log('[auth] profile button clicked (signed out)');
        showAuthModal();
      }
    };
  }

  // Restore signed-in state on page refresh — update button + sync watchlist
  window.firebaseAuth?.onAuthStateChanged(async (user) => {
    updateAuthUI(user);
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const snap = await getDoc(doc(window.firebaseDb, 'users', user.uid, 'watchlist', 'items'));
      if (snap.exists() && snap.data().items) {
        state.watchlist = snap.data().items;
      }
      renderWatchlist();
    } catch (e) { /* best effort */ }
  });

  // Immediate check if already signed in (covers case where Firebase restores
  // session before setupAuthUI has run — prevents login modal instead of profile)
  const currentUser = window.firebaseAuth?.currentUser;
  if (currentUser && typeof updateAuthUI === 'function') {
    updateAuthUI(currentUser);
  }

  // --- Profile popup ---
  const profileModalClose = document.getElementById('profileModalClose');
  const profileNameEl = document.getElementById('profileName');
  const profileEmailEl = document.getElementById('profileEmail');
  const profileSwitchBtn = document.getElementById('profileSwitchBtn');
  const profileSignOutBtn = document.getElementById('profileSignOutBtn');

  function getProfileModal() {
    return document.getElementById('profileModal');
  }

  function showProfilePopup() {
    const profileModal = getProfileModal();
    if (!profileModal) return;
    const user = window.firebaseAuth.currentUser;
    const avatarEl = profileModal.querySelector('#profileAvatar');
    const nameEl = profileModal.querySelector('#profileName');
    const emailEl = profileModal.querySelector('#profileEmail');
    if (avatarEl) {
      avatarEl.src = user?.photoURL || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="28">🧸</text></svg>';
      avatarEl.alt = 'Profile';
    }
    if (nameEl) nameEl.textContent = user?.displayName || user?.email?.split('@')[0] || 'User';
    if (emailEl) emailEl.textContent = user?.email || '';
    // Use CSS class toggling — visibility is handled by style.css
    profileModal.style.display = 'flex';
    profileModal.style.visibility = 'visible';
    profileModal.style.opacity = '1';
    profileModal.style.zIndex = '99999';
    profileModal.classList.add('open');
    console.log('[profile] modal opened, computed display:', getComputedStyle(profileModal).display);
  }
  function hideProfilePopup() {
    const profileModal = getProfileModal();
    if (!profileModal) return;
    profileModal.classList.remove('open');
    profileModal.style.setProperty('display', 'none', 'important');
    profileModal.style.setProperty('visibility', 'hidden', 'important');
    profileModal.style.setProperty('opacity', '0', 'important');
  }
  if (profileModalClose) profileModalClose.addEventListener('click', hideProfilePopup);
  const profileModalEl = getProfileModal();
  if (profileModalEl) {
    profileModalEl.addEventListener('click', (e) => { if (e.target === profileModalEl) hideProfilePopup(); });
  }
  if (profileSignOutBtn) profileSignOutBtn.addEventListener('click', async () => {
    hideProfilePopup();
    await signOut();
  });
  if (profileSwitchBtn) profileSwitchBtn.addEventListener('click', async () => {
    hideProfilePopup();
    await signOut();
    showAuthModal();
  });

  // Google sign-in
  const authGoogleBtn = document.getElementById('authGoogleBtn');
  const authGoogleBtn2 = document.getElementById('authGoogleBtn2');
  async function googleSignIn() {
    if (!window.firebaseAuth) return;
    const { signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(window.firebaseAuth, provider);
      handleSignedIn(cred.user);
    } catch (e) {
      showToast(e.message || 'Sign in failed');
    }
  }
  if (authGoogleBtn) authGoogleBtn.addEventListener('click', googleSignIn);
  if (authGoogleBtn2) authGoogleBtn2.addEventListener('click', googleSignIn);

  // Email sign-in
  const authEmailBtn = document.getElementById('authEmailBtn');
  if (authEmailBtn) {
    authEmailBtn.addEventListener('click', async () => {
      if (!window.firebaseAuth) return;
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const email = document.getElementById('authEmail')?.value;
      const password = document.getElementById('authPassword')?.value;
      try {
        const cred = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
        handleSignedIn(cred.user);
      } catch (e) { showToast(e.message || 'Sign in failed'); }
    });
  }

  // Email sign-up
  const authEmailBtn2 = document.getElementById('authEmailBtn2');
  if (authEmailBtn2) {
    authEmailBtn2.addEventListener('click', async () => {
      if (!window.firebaseAuth) return;
      const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const name = document.getElementById('authName')?.value;
      const email = document.getElementById('authEmail2')?.value;
      const password = document.getElementById('authPassword2')?.value;
      const marketing = document.getElementById('authMarketing')?.checked;
      try {
        const cred = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
        const user = cred.user;
        await setDoc(doc(window.firebaseDb, 'users', user.uid), {
          uid: user.uid, email: user.email, name: name || '',
          phone: '', city: '', marketingOptIn: !!marketing, createdAt: new Date()
        });
        showToast(state.lang === 'ar' ? 'تم إنشاء الحساب' : 'Account created');
        handleSignedIn(user, true);
      } catch (e) { showToast(e.message || 'Signup failed'); }
    });
  }

  // Switch forms
  const authSwitchToSignup = document.getElementById('authSwitchToSignup');
  const authSwitchToSignIn = document.getElementById('authSwitchToSignIn');
  if (authSwitchToSignup) authSwitchToSignup.addEventListener('click', showSignUpForm);
  if (authSwitchToSignIn) authSwitchToSignIn.addEventListener('click', showSignInForm);

  // Profile save
  const profileSaveBtn = document.getElementById('profileSaveBtn');
  if (profileSaveBtn) {
    profileSaveBtn.addEventListener('click', async () => {
      if (!window.firebaseAuth || !window.firebaseDb || !window.firebaseAuth.currentUser) return;
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const name = document.getElementById('profileName')?.value;
      const phone = document.getElementById('profilePhone')?.value;
      const city = document.getElementById('profileCity')?.value;
      try {
        await setDoc(doc(window.firebaseDb, 'users', window.firebaseAuth.currentUser.uid), {
          name: name || '', phone: phone || '', city: city || '', updatedAt: new Date()
        }, { merge: true });
        showToast(state.lang === 'ar' ? 'تم حفظ الملف الشخصي' : 'Profile saved');
        hideAuthModal();
      } catch (e) { showToast(e.message || 'Save failed'); }
    });
  }

  async function handleSignedIn(user, isNew = false) {
    hideAuthModal();
    updateAuthUI(user);
    if (isNew) {
      const pf = document.getElementById('authProfileForm');
      const si = document.getElementById('authFormSignIn');
      const su = document.getElementById('authFormSignUp');
      const pn = document.getElementById('profileName');
      if (pf) pf.style.display = '';
      if (si) si.style.display = 'none';
      if (su) su.style.display = 'none';
      if (pn) pn.value = user.displayName || '';
    } else {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      try {
        const snap = await getDoc(doc(window.firebaseDb, 'users', user.uid));
        if (snap.exists() && snap.data().name) {
          showToast(state.lang === 'ar' ? `مرحباً ${snap.data().name}` : `Welcome back, ${snap.data().name}`);
        }
      } catch (e) {}
    }
  }

  function updateAuthUI(user) {
    console.log('[auth] updateAuthUI called, user:', user ? user.email : null);
    if (!authBtn) return;
    if (user) {
      const photo = user.photoURL;
      const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">👤</text></svg>';
      authBtn.innerHTML = `<img src="${photo || fallback}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;">`;
      authBtn.title = 'Profile';
      authBtn.classList.add('round');
      // click handler is set once in setupAuthUI — don't overwrite it here
    } else {
      authBtn.classList.remove('round');
      authBtn.textContent = state.lang === 'ar' ? 'انضمام' : 'Join';
      authBtn.title = 'Join';
      authBtn.onclick = null;
      authBtn.onclick = (e) => { e.stopPropagation(); showAuthModal(); };
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupAuthUI();
});

// Also call setupAuthUI immediately if DOM is already past loading state,
// since this is a deferred module script and DOMContentLoaded may have
// already fired by the time it executes.
if (document.readyState !== 'loading') {
  setupAuthUI();
}

// Expose inline onclick handlers to window scope (product cards call them via HTML attributes)
window.addToCart = addToCart;
window.toggleWatchlist = toggleWatchlist;
window.openProductModal = openProductModal;
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;

// --- Start ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
