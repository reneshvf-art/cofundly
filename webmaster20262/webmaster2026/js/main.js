/* ============================================
   CoFundly — main.js
   Navigation · Theme · Shared utilities
   ============================================ */

// ---- Theme Toggle ----
// Migrate old CommonBridge theme key
(function migrateThemeKey() {
  try {
    const legacy = localStorage.getItem('cb_theme');
    if (legacy && !localStorage.getItem('cf_theme')) {
      localStorage.setItem('cf_theme', legacy);
      localStorage.removeItem('cb_theme');
    }
    const legacyFont = localStorage.getItem('cf_fontsize');
    if (legacyFont && !localStorage.getItem('cf_fontsize')) {
      localStorage.setItem('cf_fontsize', legacyFont);
      localStorage.removeItem('cf_fontsize');
    }
  } catch (_) { /* ignore */ }
})();

const THEME_KEY = 'cf_theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}

// ---- Navigation ----
function initNav() {
  const nav = document.querySelector('.site-nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const themeToggles = document.querySelectorAll('.theme-toggle');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  // Mobile menu
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Theme buttons
  themeToggles.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Mark active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && currentPath.startsWith(href.replace('.html', ''))) {
      link.classList.add('active');
    }
  });
}

// ---- Accessibility bar (font size) ----
function initA11yBar() {
  const bar = document.querySelector('.a11y-bar');
  if (!bar) return;
  let fontSize = parseInt(localStorage.getItem('cf_fontsize') || '16');
  document.documentElement.style.fontSize = fontSize + 'px';

  bar.querySelector('[data-a11y="increase"]')?.addEventListener('click', () => {
    fontSize = Math.min(22, fontSize + 2);
    document.documentElement.style.fontSize = fontSize + 'px';
    localStorage.setItem('cf_fontsize', fontSize);
  });
  bar.querySelector('[data-a11y="decrease"]')?.addEventListener('click', () => {
    fontSize = Math.max(14, fontSize - 2);
    document.documentElement.style.fontSize = fontSize + 'px';
    localStorage.setItem('cf_fontsize', fontSize);
  });
  bar.querySelector('[data-a11y="reset"]')?.addEventListener('click', () => {
    fontSize = 16;
    document.documentElement.style.fontSize = '16px';
    localStorage.setItem('cf_fontsize', 16);
  });

  // Close on X
  bar.querySelector('[data-a11y="close"]')?.addEventListener('click', () => {
    bar.style.display = 'none';
  });
}

// ---- Alert bar ----
function initAlertBar() {
  const bar = document.querySelector('.help-bar');
  if (!bar) return;
  bar.querySelector('.help-bar-close')?.addEventListener('click', () => {
    bar.style.display = 'none';
  });
}

// ---- Toast Notification ----
function showToast(message, icon = '✓', duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toast.classList.add('visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('visible'), duration);
}

// ---- FAQ Accordion ----
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close all
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('open');
      });
      // Toggle clicked
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling?.classList.add('open');
      }
    });
  });
}

// ---- Smooth number animation for stats ----
function animateCount(el, target, duration = 1400) {
  const start = performance.now();
  const numStr = target.replace(/[^0-9,.]/g, '');
  const suffix = target.replace(/[0-9,.\s]/g, '');
  const num = parseFloat(numStr.replace(',', ''));

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(ease * num);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

function initStats() {
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCount(entry.target, entry.target.dataset.target);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initA11yBar();
  initAlertBar();
  initFAQ();
  initStats();
});

// Expose showToast globally
window.showToast = showToast;
