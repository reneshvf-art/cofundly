/* ============================================
   CoFundly — directory.js
   Search · Filter · Neighborhood · Sort · Modal
   ============================================ */

let activeCategory = null;
let activeNeighborhood = null;
let activeSort = 'default';
let searchQuery = '';

// ---- Category helpers ----
function getCatColor(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.color : '#64748B';
}
function getCatLabel(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.label : categoryId;
}
function getCatIcon(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.icon : '📋';
}

// ---- Resource card ----
function buildResourceCard(resource) {
  const color = getCatColor(resource.category);
  const label = getCatLabel(resource.category);
  const isFav = typeof Favorites !== 'undefined' ? Favorites.isFavorite(resource.id) : false;

  const tags = (resource.tags || []).slice(0, 3).map(t =>
    `<span class="tag">${t}</span>`
  ).join('');

  const badges = [
    resource.urgent ? `<span class="badge badge--urgent">⚡ Urgent help</span>` : '',
    resource.verified ? `<span class="badge badge--verified">✓ Verified</span>` : ''
  ].filter(Boolean).join('');

  return `
    <article class="resource-card animate-fadeUp" data-id="${resource.id}"
             onclick="openResourceModal(${resource.id})"
             tabindex="0" role="button"
             aria-label="View details for ${resource.name}"
             onkeydown="if(event.key==='Enter'||event.key===' '){openResourceModal(${resource.id})}">
      <div class="resource-card-accent" style="background:${color}"></div>
      <div class="resource-card-body">
        <div class="resource-card-meta">
          <div class="resource-card-category" style="color:${color}">
            <span class="cat-dot" style="background:${color}"></span>
            <span>${label}</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${badges}</div>
        </div>
        <h3>${resource.name}</h3>
        <p>${resource.shortDesc}</p>
        <div class="tag-list">${tags}</div>
      </div>
      <div class="resource-card-footer">
        <span class="resource-card-contact">📍 ${resource.neighborhood || resource.area}</span>
        <button class="favorite-btn${isFav ? ' active' : ''}"
                data-id="${resource.id}"
                onclick="event.stopPropagation()"
                aria-label="${isFav ? 'Remove from saved' : 'Save resource'}"
                title="${isFav ? 'Remove from saved' : 'Save resource'}">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
    </article>`;
}

// ---- Filter pipeline ----
function filterResources() {
  let results = RESOURCES;

  if (activeCategory) {
    results = results.filter(r => r.category === activeCategory);
  }
  if (activeNeighborhood) {
    // "Citywide" resources appear under every neighborhood filter
    results = results.filter(r =>
      r.neighborhood === activeNeighborhood || r.neighborhood === 'Citywide'
    );
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.shortDesc.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.neighborhood || '').toLowerCase().includes(q) ||
      (r.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (r.audience || []).some(a => a.toLowerCase().includes(q))
    );
  }

  if (activeSort === 'name') {
    results = [...results].sort((a, b) => a.name.localeCompare(b.name));
  } else if (activeSort === 'urgent') {
    results = [...results].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  }

  return results;
}

// ---- Render ----
function renderDirectory() {
  const grid = document.getElementById('directory-grid');
  const count = document.getElementById('result-count');
  if (!grid) return;

  const results = filterResources();

  if (count) count.textContent = `${results.length} resource${results.length !== 1 ? 's' : ''}`;

  if (!results.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <h3>No resources match those filters</h3>
        <p>Try a different neighborhood, category, or search term — or clear filters to see every listing.</p>
        <button class="btn btn--secondary" style="margin-top:1rem" onclick="clearFilters()">
          Clear all filters
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = results.map(r => buildResourceCard(r)).join('');
  if (typeof syncFavoriteButtons === 'function') syncFavoriteButtons();
}

// ---- Category chips ----
function initCategoryChips() {
  const container = document.getElementById('category-chips');
  if (!container) return;

  const allChip = `
    <button class="chip active" id="chip-all" onclick="setCategory(null)">
      All resources
    </button>`;

  const chips = CATEGORIES.map(cat => `
    <button class="chip" id="chip-${cat.id}"
            onclick="setCategory('${cat.id}')"
            style="--cat-color:${cat.color}">
      <span aria-hidden="true">${cat.icon}</span>
      <span>${cat.label}</span>
    </button>`).join('');

  container.innerHTML = allChip + chips;
}

function setCategory(catId) {
  activeCategory = catId;

  document.querySelectorAll('[id^="chip-"]').forEach(chip => {
    chip.classList.remove('active');
    chip.style.background = '';
    chip.style.color = '';
    chip.style.borderColor = '';
  });

  if (!catId) {
    const all = document.getElementById('chip-all');
    if (all) {
      all.classList.add('active');
      all.style.background = 'var(--navy)';
      all.style.color = '#fff';
      all.style.borderColor = 'var(--navy)';
    }
  } else {
    const chip = document.getElementById(`chip-${catId}`);
    const color = getCatColor(catId);
    if (chip) {
      chip.classList.add('active');
      chip.style.background = color;
      chip.style.color = '#fff';
      chip.style.borderColor = color;
    }
  }

  renderDirectory();
}

function setNeighborhood(name) {
  activeNeighborhood = name && name !== 'Citywide' ? name : null;
  renderDirectory();
}

function setSort(mode) {
  activeSort = mode || 'default';
  renderDirectory();
}

function clearFilters() {
  activeCategory = null;
  activeNeighborhood = null;
  activeSort = 'default';
  searchQuery = '';

  const input = document.getElementById('search-input');
  if (input) input.value = '';
  document.querySelector('.search-clear')?.classList.remove('visible');

  const neigh = document.getElementById('neighborhood-select');
  if (neigh) neigh.value = '';

  const sort = document.getElementById('sort-select');
  if (sort) sort.value = 'default';

  setCategory(null);
}

window.clearFilters = clearFilters;
window.setCategory = setCategory;
window.setNeighborhood = setNeighborhood;
window.setSort = setSort;

// ---- Search ----
function initSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.querySelector('.search-clear');
  if (!input) return;

  // Hero search on home page redirects here
  const heroInput = document.getElementById('hero-search');
  if (heroInput) {
    heroInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = heroInput.value.trim();
        if (q) window.location.href = `directory.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  input.addEventListener('input', () => {
    searchQuery = input.value;
    clearBtn?.classList.toggle('visible', !!input.value);
    renderDirectory();
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.classList.remove('visible');
    input.focus();
    renderDirectory();
  });

  // Pre-fill from URL params: ?q=, ?cat=, ?neighborhood=
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q');
  const catParam = urlParams.get('cat');
  const neighParam = urlParams.get('neighborhood');

  if (q) {
    input.value = q;
    searchQuery = q;
    clearBtn?.classList.add('visible');
  }
  if (catParam && CATEGORIES.find(c => c.id === catParam)) {
    setCategory(catParam);
    document.querySelectorAll('[id^="sidebar-"]').forEach(b => b.classList.remove('active'));
    document.getElementById(`sidebar-${catParam}`)?.classList.add('active');
  }
  if (neighParam) {
    activeNeighborhood = neighParam;
    const sel = document.getElementById('neighborhood-select');
    if (sel) sel.value = neighParam;
  }
}

// ---- Modal ----
function openResourceModal(id) {
  const resource = RESOURCES.find(r => r.id === id);
  if (!resource) return;

  const color = getCatColor(resource.category);
  const label = getCatLabel(resource.category);
  const icon = getCatIcon(resource.category);
  const isFav = typeof Favorites !== 'undefined' ? Favorites.isFavorite(id) : false;

  const backdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');
  if (!backdrop || !modalContent) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <div style="display:flex;align-items:flex-start;gap:1rem;padding-right:2.5rem">
        <div style="width:52px;height:52px;border-radius:12px;background:${color}1f;color:${color};display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">${icon}</div>
        <div>
          <div class="resource-card-category" style="color:${color};margin-bottom:4px">
            <span class="cat-dot" style="background:${color}"></span>
            <span>${label}</span>
          </div>
          <h2 style="font-size:1.45rem;margin-bottom:4px">${resource.name}</h2>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${resource.urgent ? `<span class="badge badge--urgent">⚡ Urgent help</span>` : ''}
            ${resource.verified ? `<span class="badge badge--verified">✓ Verified</span>` : ''}
            ${resource.neighborhood ? `<span class="badge" style="background:rgba(30,58,95,.08);color:var(--navy)">📍 ${resource.neighborhood}</span>` : ''}
          </div>
        </div>
      </div>
      <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <div class="modal-section-label">About this resource</div>
        <p style="font-size:0.95rem;line-height:1.75;color:var(--text-muted)">${resource.description}</p>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Contact & location</div>
        <div class="modal-detail-row"><span class="modal-detail-icon">📞</span><span><strong>Phone:</strong>&nbsp;<a href="tel:${resource.phone}" style="color:var(--navy)">${resource.phone}</a></span></div>
        <div class="modal-detail-row"><span class="modal-detail-icon">✉️</span><span><strong>Email:</strong>&nbsp;<a href="mailto:${resource.email}" style="color:var(--navy)">${resource.email}</a></span></div>
        <div class="modal-detail-row"><span class="modal-detail-icon">🌐</span><span><strong>Website:</strong>&nbsp;<a href="${resource.website}" target="_blank" rel="noopener" style="color:var(--navy)">${resource.website.replace('https://', '')}</a></span></div>
        <div class="modal-detail-row"><span class="modal-detail-icon">📍</span><span>${resource.address}</span></div>
        <div class="modal-detail-row"><span class="modal-detail-icon">🗺️</span><span>Serves: ${resource.area}</span></div>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Hours & availability</div>
        <div class="modal-detail-row"><span class="modal-detail-icon">🕐</span><span>${resource.hours}</span></div>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Who this serves</div>
        <div class="tag-list">${(resource.audience || []).map(a => `<span class="tag">${a}</span>`).join('')}</div>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Tags</div>
        <div class="tag-list">${(resource.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>

      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:1.5rem">
        <a href="${resource.website}" target="_blank" rel="noopener" class="btn btn--primary">
          Visit website ↗
        </a>
        <a href="tel:${resource.phone}" class="btn btn--secondary">
          📞 Call now
        </a>
        <button class="btn ${isFav ? 'btn--danger' : 'btn--secondary'} favorite-btn"
                data-id="${resource.id}">
          ${isFav ? '♥ Saved' : '♡ Save resource'}
        </button>
      </div>
    </div>`;

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  backdrop.querySelector('.modal-close')?.focus();
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (typeof syncFavoriteButtons === 'function') syncFavoriteButtons();
}

window.openResourceModal = openResourceModal;
window.closeModal = closeModal;

// ---- Init directory page ----
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('directory-grid')) return;

  initCategoryChips();
  setCategory(null);
  initSearch();
  renderDirectory();

  // Modal backdrop click-outside
  document.getElementById('modal-backdrop')?.addEventListener('click', e => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
