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
  document.addEventListener('click', e => {
    const btn = e.target.closest('.favorite-btn[data-id]');
    if (!btn) return;
    e.stopPropagation();
    const id = parseInt(btn.dataset.id);
    const resource = typeof RESOURCES !== 'undefined' ? RESOURCES.find(r => r.id === id) : null;
    const added = Favorites.toggle(id);
    syncFavoriteButtons();
    if (added) {
      window.showToast?.('Saved to your favorites', '♥', 2500);
    } else {
      window.showToast?.('Removed from saved', '♡', 2000);
    }
  });
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

document.addEventListener('DOMContentLoaded', initFavoriteButtons);

window.Favorites = Favorites;
window.syncFavoriteButtons = syncFavoriteButtons;
