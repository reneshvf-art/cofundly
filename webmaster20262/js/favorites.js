/* ============================================
   CoFundly — favorites.js
   localStorage-based resource bookmarking
   ============================================ */

// Migrate any pre-existing "cb_favorites" entries from the old CommonBridge build.
(function migrateLegacyFavorites() {
  try {
    const legacy = localStorage.getItem('cb_favorites');
    if (legacy && !localStorage.getItem('cf_favorites')) {
      localStorage.setItem('cf_favorites', legacy);
      localStorage.removeItem('cb_favorites');
    }
  } catch (_) { /* storage unavailable — ignore */ }
})();

const FAVORITES_KEY = 'cf_favorites';

const Favorites = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch { return []; }
  },
  save(ids) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  },
  isFavorite(id) {
    return this.get().includes(id);
  },
  toggle(id) {
    const favs = this.get();
    const idx = favs.indexOf(id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      this.save(favs);
      return false;
    } else {
      favs.push(id);
      this.save(favs);
      return true;
    }
  },
  count() {
    return this.get().length;
  }
};

// Update all favorite buttons in the DOM
function syncFavoriteButtons() {
  document.querySelectorAll('.favorite-btn[data-id]').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    const isFav = Favorites.isFavorite(id);
    btn.classList.toggle('active', isFav);
    btn.setAttribute('aria-label', isFav ? 'Remove from saved' : 'Save resource');
    btn.innerHTML = isFav ? '♥' : '♡';
  });
  updateFavCount();
}

// Update favorite count badge in nav (if present)
function updateFavCount() {
  const count = Favorites.count();
  document.querySelectorAll('.fav-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Attach click listeners to all favorite buttons
function initFavoriteButtons() {
  // Capture phase: fires before inline onclick="event.stopPropagation()" on card buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('.favorite-btn[data-id]');
    if (!btn) return;
    e.stopPropagation();
    const id = parseInt(btn.dataset.id);
    const added = Favorites.toggle(id);
    syncFavoriteButtons();
    window.renderDrawerContent?.();
    if (added) {
      window.showToast?.('Saved to your favorites', '♥', 2500);
    } else {
      window.showToast?.('Removed from saved', '♡', 2000);
    }
  }, true);
  syncFavoriteButtons();
}

// Render saved resources page section
function renderSavedResources(container) {
  if (!container || typeof RESOURCES === 'undefined') return;
  const ids = Favorites.get();
  if (!ids.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔖</div>
        <h3>No saved resources yet</h3>
        <p>Click the ♡ on any resource to save it here for quick access.</p>
      </div>`;
    return;
  }
  const saved = RESOURCES.filter(r => ids.includes(r.id));
  container.innerHTML = `
    <div class="grid grid-auto">
      ${saved.map(r => buildResourceCard(r)).join('')}
    </div>`;
  initFavoriteButtons();
}

// ---- Saved Drawer ----
function renderDrawerContent() {
  const body = document.getElementById('saved-drawer-body');
  if (!body) return;
  const ids = Favorites.get();
  if (!ids.length) {
    body.innerHTML = `
      <div class="saved-drawer-empty">
        <div class="saved-drawer-empty-icon">♡</div>
        <h3>No saved resources yet</h3>
        <p>Click the ♡ on any resource card to save it here for quick access.</p>
      </div>`;
    return;
  }
  const resources = typeof RESOURCES !== 'undefined' ? RESOURCES : [];
  const categories = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const items = ids.map(id => {
    const r = resources.find(x => x.id === id);
    if (!r) return '';
    const cat = categories.find(c => c.id === r.category);
    return `
      <div class="saved-item">
        <div class="saved-item-icon" style="background:${cat ? cat.color + '22' : 'rgba(255,255,255,0.06)'}">
          ${cat ? cat.icon : '📋'}
        </div>
        <div class="saved-item-content">
          <div class="saved-item-name">${r.name}</div>
          <div class="saved-item-cat">${cat ? cat.label : r.category}</div>
        </div>
        <button class="saved-item-remove" data-id="${r.id}" aria-label="Remove from saved" title="Remove">♥</button>
      </div>`;
  }).filter(Boolean).join('');

  body.innerHTML = items + `<a href="directory.html" class="saved-drawer-dir-link">Browse all resources →</a>`;

  body.querySelectorAll('.saved-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      Favorites.toggle(id);
      syncFavoriteButtons();
      renderDrawerContent();
    });
  });
}

function initSavedDrawer() {
  const navBtn = document.getElementById('saved-nav-btn');
  const drawer = document.getElementById('saved-drawer');
  const closeBtn = document.getElementById('saved-drawer-close');
  const backdrop = document.getElementById('saved-drawer-backdrop');
  if (!navBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderDrawerContent();
    navBtn.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    navBtn.setAttribute('aria-expanded', 'false');
  }

  navBtn.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
}

document.addEventListener('DOMContentLoaded', () => {
  initFavoriteButtons();
  initSavedDrawer();
});

window.Favorites = Favorites;
window.syncFavoriteButtons = syncFavoriteButtons;
window.renderDrawerContent = renderDrawerContent;
