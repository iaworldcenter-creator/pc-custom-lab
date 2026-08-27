class HighConversionSearchEngine {
constructor() {
this.input = document.querySelector('#boutiqueSearchInput, input[name="q"], #search-input, input[type="search"]');
this.dropdown = null;
this.selectedIndex = -1;
this.originalQuery = '';
this.k_RRF = 60; // Constante de penalización RRF de estándar internacional
this.symptomMap = {
'calor': ['ventilador', 'enfriamiento', 'disipador', 'agua', 'refresco'],
'lento': ['ssd', 'ram', 'm.2', 'nvme', 'procesador'],
'espacio': ['disco duro', 'ssd', '1tb', 'mochila', 'bolsa'],
'antojo': ['chocolate', 'gomitas', 'mazapan', 'dulces', 'papas'],
'regalo': ['reloj', 'joyeria', 'plata', 'perfume', 'cartera', 'lentes'],
'estres': ['vape', 'cigarro', 'menta', 'esencia', 'pod'],
'bateria': ['cargador', 'cable', 'powerbank', 'tipo c'],
'musica': ['audifonos', 'bocina', 'bluetooth', 'diadema']
};
if (this.input) this.init();
}
init() {
const urlParams = new URLSearchParams(window.location.search);
const currentQuery = urlParams.get('q') || urlParams.get('search');
if (currentQuery && this.input) {
this.input.value = decodeURIComponent(currentQuery);
}
this.dropdown = document.querySelector('#search-suggestions, .search-autocomplete-drawer');
if (!this.dropdown) {
this.dropdown = document.createElement('div');
this.dropdown.id = 'search-suggestions';
this.dropdown.className = 'search-autocomplete-drawer';
this.dropdown.setAttribute('role', 'listbox');
this.dropdown.setAttribute('aria-label', 'Sugerencias de productos');
const parent = this.input.closest('.relative') || this.input.parentNode;
if (parent) {
parent.style.position = 'relative';
parent.appendChild(this.dropdown);
}
}
this.bindEvents();
}
bindEvents() {
this.input.addEventListener('input', (e) => {
this.originalQuery = e.target.value.trim();
this.selectedIndex = -1;
this.fetchHybridSuggestions(this.originalQuery);
});
this.input.addEventListener('keydown', (e) => {
if (!this.dropdown || this.dropdown.style.display !== 'block') return;
const items = this.dropdown.querySelectorAll('.suggestion-item');
if (!items.length) return;
if (e.key === 'ArrowDown') {
e.preventDefault();
this.selectedIndex = (this.selectedIndex + 1) % items.length;
this.updateSelection(items);
} else if (e.key === 'ArrowUp') {
e.preventDefault();
this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
this.updateSelection(items);
} else if (e.key === 'Escape') {
this.closeDropdown();
this.input.focus();
} else if (e.key === 'Enter') {
if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
e.preventDefault();
items[this.selectedIndex].click();
}
}
});
document.addEventListener('click', (e) => {
if (this.input && !this.input.contains(e.target) && this.dropdown && !this.dropdown.contains(e.target)) {
this.closeDropdown();
}
});
}
updateSelection(items) {
items.forEach((item, idx) => {
if (idx === this.selectedIndex) {
item.classList.add('active');
item.setAttribute('aria-selected', 'true');
if (item.dataset.suggestion) {
this.input.value = item.dataset.suggestion;
}
this.input.setAttribute('aria-activedescendant', `sugg-item-${idx}`);
} else {
item.classList.remove('active');
item.removeAttribute('aria-selected');
}
});
}
fetchHybridSuggestions(query) {
if (query.length < 2) {
this.closeDropdown();
return;
}
const catalog = window.boutiqueProducts || window.PRODUCT_CATALOG || window.productCatalog || window.unifiedCatalog || [];
const cleanQ = query.toLowerCase();
const lexicalRank = [];
catalog.forEach((p, idx) => {
const name = (p.nombre || p.title || '').toLowerCase();
const sku = (p.sku || '').toLowerCase();
let score = 0;
if (sku === cleanQ) score += 100;
else if (sku.includes(cleanQ)) score += 50;
if (name.startsWith(cleanQ)) score += 30;
else if (name.includes(cleanQ)) score += 15;
if (score > 0) lexicalRank.push({ product: p, score });
});
lexicalRank.sort((a, b) => b.score - a.score);
const semanticRank = [];
let symptomTokens = [];
for (const [symptom, solutions] of Object.entries(this.symptomMap)) {
if (cleanQ.includes(symptom)) {
symptomTokens = symptomTokens.concat(solutions);
}
}
catalog.forEach((p) => {
const desc = (p.desc || '').toLowerCase();
const cat = (p.categoria || p.category || '').toLowerCase();
const brand = (p.marca || p.brand || '').toLowerCase();
let score = 0;
if (cat.includes(cleanQ)) score += 20;
if (brand.includes(cleanQ)) score += 20;
if (desc.includes(cleanQ)) score += 10;
symptomTokens.forEach(t => {
if (desc.includes(t) || cat.includes(t)) score += 25;
});
if (score > 0) semanticRank.push({ product: p, score });
});
semanticRank.sort((a, b) => b.score - a.score);
const rrfScores = new Map();
lexicalRank.forEach((item, rank) => {
const sku = item.product.sku;
const rrfVal = 1.0 / (this.k_RRF + (rank + 1));
rrfScores.set(sku, { product: item.product, score: rrfVal });
});
semanticRank.forEach((item, rank) => {
const sku = item.product.sku;
const rrfVal = 1.0 / (this.k_RRF + (rank + 1));
if (rrfScores.has(sku)) {
rrfScores.get(sku).score += rrfVal;
} else {
rrfScores.set(sku, { product: item.product, score: rrfVal });
}
});
const finalResults = Array.from(rrfScores.values())
.sort((a, b) => b.score - a.score)
.map(entry => entry.product)
.slice(0, 6);
this.renderSuggestions(finalResults, query);
}
renderSuggestions(matches, query) {
if (!this.dropdown) return;
if (!matches.length) {
this.dropdown.innerHTML = `
<div class="zero-suggestion-box">
<p class="text-xs text-slate-400">Sin coincidencias directas para "<b>${query}</b>"</p>
<a href="https://wa.me/523326652109?text=Hola,%20busco%20disponibilidad%20de:%20${encodeURIComponent(query)}" target="_blank" class="quick-support-link">
<i class="fa-brands fa-whatsapp"></i> Consultar existencias por WhatsApp (+52 33 2665 2109)
</a>
</div>`;
this.dropdown.style.display = 'block';
return;
}
const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
this.dropdown.innerHTML = matches.map((m, idx) => {
const title = m.nombre || m.title || 'Producto';
const price = parseFloat(m.precio || m.price) || 0;
const highlighted = title.replace(regex, '<mark>$1</mark>');
return `
<div id="sugg-item-${idx}" class="suggestion-item" data-suggestion="${title}" role="option" onclick="location.href='producto.html?sku=${m.sku}'">
<div class="flex items-center gap-2 min-w-0">
<i class="fa-solid fa-magnifying-glass text-cyan-400 text-[10px] shrink-0"></i>
<span class="suggestion-title truncate">${highlighted}</span>
</div>
<span class="suggestion-price font-mono font-bold text-amber-400">$${price.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
</div>
`;
}).join('');
this.dropdown.style.display = 'block';
}
closeDropdown() {
if (this.dropdown) this.dropdown.style.display = 'none';
this.selectedIndex = -1;
}
}
class PredictiveMegaMenu {
constructor() {
this.menu = document.querySelector('.mega-menu, .nav-departments, #boutique-sidebar-root, nav');
this.mouseLocs = [];
this.timeoutId = null;
if (this.menu) this.init();
}
init() {
document.addEventListener('mousemove', (e) => {
this.mouseLocs.push({ x: e.pageX, y: e.pageY });
if (this.mouseLocs.length > 5) this.mouseLocs.shift();
});
const triggers = this.menu.querySelectorAll('.has-submenu, .dept-item, button[data-category]');
triggers.forEach(trigger => {
trigger.addEventListener('mouseenter', () => this.handleMouseEnter(trigger));
trigger.addEventListener('mouseleave', () => this.handleMouseLeave(trigger));
});
}
handleMouseEnter(trigger) {
if (this.timeoutId) clearTimeout(this.timeoutId);
const submenu = trigger.querySelector('.submenu-panel, .flyout-drawer');
if (!submenu) return;
const isMovingTowards = this.isCursorInSafeTriangle(submenu);
if (isMovingTowards) {
this.timeoutId = setTimeout(() => this.openSubmenu(trigger, submenu), 300);
} else {
this.openSubmenu(trigger, submenu);
}
}
handleMouseLeave(trigger) {
if (this.timeoutId) clearTimeout(this.timeoutId);
this.timeoutId = setTimeout(() => {
const submenu = trigger.querySelector('.submenu-panel, .flyout-drawer');
if (submenu) submenu.style.display = 'none';
trigger.classList.remove('active');
trigger.setAttribute('aria-expanded', 'false');
}, 500);
}
openSubmenu(trigger, submenu) {
if (this.menu) {
this.menu.querySelectorAll('.submenu-panel, .flyout-drawer').forEach(p => p.style.display = 'none');
}
submenu.style.display = 'grid';
trigger.classList.add('active');
trigger.setAttribute('aria-expanded', 'true');
}
isCursorInSafeTriangle(submenu) {
if (!this.mouseLocs.length || !submenu.offsetParent) return false;
const loc = this.mouseLocs[this.mouseLocs.length - 1];
const prevLoc = this.mouseLocs[0];
if (!loc || !prevLoc) return false;
return (loc.x - prevLoc.x > 0);
}
}
function initFacetMicroSearch() {
const facetLists = document.querySelectorAll('.filter-facet-group, .facet-list, #sidebar-categories-list');
facetLists.forEach(group => {
const options = group.querySelectorAll('.facet-option, button');
if (options.length > 8 && !group.querySelector('.facet-search-input')) {
const searchInput = document.createElement('input');
searchInput.type = 'search';
searchInput.placeholder = '🔍 Filtrar departamentos...';
searchInput.className = 'facet-search-input';
searchInput.style.cssText = 'width: 100%; padding: 8px 12px; margin-bottom: 10px; border-radius: 12px; border: 1px solid #334155; background: #020617; color: #f8fafc; font-size: 0.75rem; outline: none;';
searchInput.addEventListener('input', (e) => {
const term = e.target.value.toLowerCase();
options.forEach(opt => {
const txt = opt.textContent.toLowerCase();
opt.style.display = txt.includes(term) ? '' : 'none';
});
});
group.insertBefore(searchInput, group.firstChild);
}
});
}
function renderZeroResultsSafetyNet(containerId, failedQuery) {
const container = document.getElementById(containerId);
if (!container) return;
container.innerHTML = `
<div class="zero-results-card" style="padding: 35px 20px; text-align: center; background: #090d16; border-radius: 20px; border: 1px solid #1e293b; margin: 20px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
<div style="font-size: 2.2rem; margin-bottom: 10px;">🔍</div>
<h2 style="font-size: 1.25rem; color: #f8fafc; font-weight: 900; margin-bottom: 6px;">No encontramos coincidencias exactas para "<b>${failedQuery}</b>"</h2>
<p style="color: #94a3b8; font-size: 0.85rem; max-width: 500px; margin: 0 auto 20px;">Revisa la ortografía o explora las alternativas más solicitadas:</p>
<!-- Pilares 1 & 4: Atajos de Navegación & Social Proof -->
<div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
<button onclick="clearBoutiqueSearch()" style="background:#1e293b; color:#38bdf8; padding:8px 16px; border-radius:12px; font-size:0.8rem; font-weight:bold; border:1px solid #38bdf840; cursor:pointer;">📦 Todo el Catálogo</button>
<a href="checkout.html" style="background:#1e293b; color:#fbbf24; padding:8px 16px; border-radius:12px; font-size:0.8rem; font-weight:bold; text-decoration:none; border:1px solid #fbbf2440;">🛒 Ver Canasta</a>
</div>
<!-- Pilar 5: Vía de Escape y Asistencia Humana Directa -->
<div style="border-top: 1px solid #1e293b; padding-top: 20px;">
<p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 12px;">¿Buscas un producto específico o compras al por mayor?</p>
<a href="https://wa.me/523326652109?text=Hola,%20busco%20asistencia%20para%20encontrar:%20${encodeURIComponent(failedQuery)}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(to right, #10b981, #14b8a6); color: #020617; font-weight: 900; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-size: 0.85rem; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
<i class="fa-brands fa-whatsapp text-base"></i>
<span>Hablar con un Asesor por WhatsApp (+52 33 2665 2109)</span>
</a>
</div>
</div>
`;
}
document.addEventListener('DOMContentLoaded', () => {
new HighConversionSearchEngine();
new PredictiveMegaMenu();
initFacetMicroSearch();
});