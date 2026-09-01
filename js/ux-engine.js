/**
 * UX & Fuzzy Search Engine v3.0 - PC Custom Lab & Ecosistema de Tiendas
 * Motor de Búsqueda Inteligente, Tolerante a Errores Ortográficos (Levenshtein),
 * Limpieza de Stopwords, Diccionario de Sinónimos y Live Autocomplete con Compra en 1 Clic.
 */

// 1. Utilidad de Distancia Levenshtein para tolerancia ortográfica
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // sustitución
                    matrix[i][j - 1] + 1,     // inserción
                    matrix[i - 1][j] + 1      // eliminación
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

class HighConversionSearchEngine {
    constructor() {
        this.input = document.querySelector('#boutiqueSearchInput, input[name="q"], #search-input, input[type="search"], .global-search-input');
        this.dropdown = null;
        this.selectedIndex = -1;
        this.originalQuery = '';
        this.k_RRF = 60;

        // Palabras vacías / Conectores a ignorar
        this.stopwords = new Set([
            'el', 'la', 'los', 'las', 'de', 'del', 'con', 'para', 'por', 'y', 'e', 'o', 'u', 'en', 'a', 'al', 
            'un', 'una', 'unos', 'unas', 'lo', 'que', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'se'
        ]);

        // Diccionario semántico de sinónimos y variantes técnicas
        this.synonymMap = {
            'laptop': ['portatil', 'portatiles', 'notebook', 'computadora', 'lap'],
            'portatil': ['laptop', 'notebook', 'computadora', 'portatiles'],
            'mouse': ['raton', 'ratones', 'mause', 'trackball'],
            'raton': ['mouse', 'mause', 'ratones'],
            'teclado': ['keyboard', 'teclados'],
            'toner': ['tinta', 'cartucho', 'consumible', 'tóner'],
            'cartucho': ['toner', 'tinta', 'consumible'],
            'tinta': ['toner', 'cartucho', 'botella'],
            'impresora': ['multifuncional', 'copiadora', 'plotter', 'impresion'],
            'multifuncional': ['impresora', 'copiadora'],
            'tablet': ['tableta', 'tabletas', 'ipad'],
            'tableta': ['tablet', 'ipad'],
            'nobreak': ['no-break', 'ups', 'regulador', 'respaldo'],
            'ups': ['nobreak', 'no-break', 'regulador'],
            'regulador': ['ups', 'nobreak', 'no-break', 'supresor'],
            'monitor': ['pantalla', 'display', 'monitores'],
            'pantalla': ['monitor', 'display'],
            'audifonos': ['diadema', 'headset', 'auriculares', 'audifono', 'cascos'],
            'diadema': ['audifonos', 'headset', 'auriculares'],
            'headset': ['audifonos', 'diadema', 'auriculares'],
            'disco': ['ssd', 'hdd', 'm2', 'nvme', 'almacenamiento', 'solido'],
            'ssd': ['disco', 'm2', 'nvme', 'solido', 'almacenamiento'],
            'hdd': ['disco', 'mecanico', 'almacenamiento'],
            'memoria': ['ram', 'usb', 'flash', 'pendrive', 'microsd'],
            'ram': ['memoria', 'ddr4', 'ddr5', 'dimm', 'sodimm'],
            'usb': ['memoria', 'pendrive', 'flash', 'kingston', 'adata'],
            'fuente': ['psu', 'poder', 'energia', 'alimentacion'],
            'gabinete': ['chasis', 'case', 'torre', 'caja'],
            'procesador': ['cpu', 'ryzen', 'intel', 'core'],
            'cpu': ['procesador', 'ryzen', 'intel'],
            'tarjeta': ['gpu', 'video', 'grafica', 'motherboard', 'madre'],
            'video': ['gpu', 'grafica', 'rtx', 'gtx', 'radeon'],
            'madre': ['motherboard', 'placa', 'mainboard']
        };

        this.symptomMap = {
            'calor': ['ventilador', 'enfriamiento', 'disipador', 'pasta', 'refrigeracion'],
            'lento': ['ssd', 'ram', 'nvme', 'procesador', 'disco'],
            'espacio': ['disco', 'ssd', 'usb', '1tb', '2tb', 'externo'],
            'antojo': ['chocolate', 'gomitas', 'mazapan', 'dulces', 'botana'],
            'estres': ['vape', 'cigarro', 'menta', 'esencia', 'pod'],
            'bateria': ['cargador', 'cable', 'powerbank', 'ups', 'nobreak'],
            'musica': ['audifonos', 'bocina', 'bluetooth', 'diadema', 'sonido']
        };

        if (this.input) this.init();
    }

    init() {
        // Asignar el placeholder oficial solicitado
        this.input.placeholder = "Encuentra aquí y compra lo que necesitas en un solo clic";
        this.input.setAttribute('autocomplete', 'off');

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
            this.dropdown.setAttribute('aria-label', 'Sugerencias de productos en vivo');
            
            // Estilos flotantes responsivos de alta gama
            this.dropdown.style.cssText = `
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                background: #090d16;
                border: 1px solid #1e293b;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(56, 189, 248, 0.2);
                z-index: 99999;
                display: none;
                max-height: 520px;
                overflow-y: auto;
                backdrop-filter: blur(12px);
                padding: 8px;
            `;

            const parent = this.input.closest('.relative') || this.input.parentNode;
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(this.dropdown);
            }
        }
        this.bindEvents();
    }

    bindEvents() {
        let debounceTimer;
        this.input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            this.originalQuery = e.target.value.trim();
            this.selectedIndex = -1;
            debounceTimer = setTimeout(() => {
                this.fetchHybridSuggestions(this.originalQuery);
            }, 180);
        });

        this.input.addEventListener('focus', () => {
            if (this.input.value.trim().length >= 2) {
                this.fetchHybridSuggestions(this.input.value.trim());
            }
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
                    const viewBtn = items[this.selectedIndex].querySelector('.action-view');
                    if (viewBtn) viewBtn.click();
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
                item.style.borderColor = '#38bdf8';
                item.style.background = '#131c2e';
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.borderColor = '#1e293b';
                item.style.background = '#0d131f';
                item.removeAttribute('aria-selected');
            }
        });
    }

    // Normalizar texto (remover acentos y caracteres especiales)
    normalize(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // Tokenizar eliminando stopwords y expandiendo sinónimos
    tokenizeAndExpand(query) {
        const rawTokens = this.normalize(query).split(/\s+/).filter(t => t.length > 0);
        const usefulTokens = rawTokens.filter(t => !this.stopwords.has(t));
        const finalTokens = usefulTokens.length ? usefulTokens : rawTokens;

        const expandedTerms = new Set(finalTokens);
        finalTokens.forEach(token => {
            if (this.synonymMap[token]) {
                this.synonymMap[token].forEach(syn => expandedTerms.add(this.normalize(syn)));
            }
        });

        return {
            tokens: finalTokens,
            expanded: Array.from(expandedTerms)
        };
    }

    fetchHybridSuggestions(query) {
        if (query.length < 2) {
            this.closeDropdown();
            return;
        }

        const catalog = window.unifiedCatalog || window.PRODUCT_CATALOG || window.boutiqueProducts || window.productCatalog || window.ctCatalogData || [];
        const { tokens, expanded } = this.tokenizeAndExpand(query);
        const cleanQ = this.normalize(query);

        const scoredResults = [];

        catalog.forEach((p) => {
            const name = this.normalize(p.nombre || p.title || p.Nombre_Producto || '');
            const sku = this.normalize(p.sku || p.SKU || '');
            const desc = this.normalize(p.desc || p.Descripcion_Completa || '');
            const cat = this.normalize(p.categoria || p.category || p.Categoria_Clasificada || '');
            const brand = this.normalize(p.marca || p.brand || p.Marca || '');
            const combinedText = `${name} ${sku} ${brand} ${cat} ${desc}`;

            let score = 0;

            // 1. Coincidencia exacta de SKU
            if (sku === cleanQ) score += 150;
            else if (sku.includes(cleanQ)) score += 60;

            // 2. Coincidencia de frase completa en título
            if (name.startsWith(cleanQ)) score += 80;
            else if (name.includes(cleanQ)) score += 40;

            // 3. Multi-token matching con soporte de sinónimos
            let tokensMatched = 0;
            tokens.forEach(tok => {
                if (combinedText.includes(tok)) {
                    tokensMatched++;
                    score += 25;
                } else {
                    // Fuzzy / Levenshtein match si no hubo coincidencia literal
                    let foundFuzzy = false;
                    const words = name.split(/\s+/);
                    for (let w of words) {
                        if (Math.abs(w.length - tok.length) <= 2 && (w.length >= 4 || tok.length >= 4)) {
                            const dist = levenshteinDistance(w, tok);
                            if (dist <= 2) {
                                score += (dist === 1 ? 18 : 10);
                                foundFuzzy = true;
                                tokensMatched += 0.8;
                                break;
                            }
                        }
                    }
                }
            });

            // Bono si todos los tokens del usuario coinciden (ej. "teclado raton")
            if (tokensMatched >= tokens.length && tokens.length > 1) {
                score += 50;
            }

            // 4. Sinónimos expandidos
            expanded.forEach(exp => {
                if (combinedText.includes(exp)) score += 12;
            });

            // 5. Mapeo de síntomas
            for (const [symptom, solutions] of Object.entries(this.symptomMap)) {
                if (cleanQ.includes(symptom)) {
                    solutions.forEach(sol => {
                        if (combinedText.includes(this.normalize(sol))) score += 20;
                    });
                }
            }

            if (score > 15) {
                scoredResults.push({ product: p, score });
            }
        });

        scoredResults.sort((a, b) => b.score - a.score);
        const finalMatches = scoredResults.slice(0, 8).map(r => r.product);
        this.renderSuggestions(finalMatches, query);
    }

    renderSuggestions(matches, query) {
        if (!this.dropdown) return;
        if (!matches.length) {
            this.dropdown.innerHTML = `
                <div style="padding: 16px; text-align: center;">
                    <div style="font-size: 1.5rem; margin-bottom: 6px;">🔍</div>
                    <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 10px;">
                        Sin resultados exactos para "<b>${query}</b>"
                    </p>
                    <a href="https://wa.me/523326652109?text=Hola,%20busco%20disponibilidad%20de:%20${encodeURIComponent(query)}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #10b981; color: #020617; font-weight: 800; padding: 8px 14px; border-radius: 10px; font-size: 0.75rem; text-decoration: none;">
                        <span>💬 Consultar inventario por WhatsApp (+52 33 2665 2109)</span>
                    </a>
                </div>
            `;
            this.dropdown.style.display = 'block';
            return;
        }

        const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeQ})`, 'gi');

        const itemsHtml = matches.map((m, idx) => {
            const title = m.nombre || m.title || m.Nombre_Producto || 'Producto';
            const price = parseFloat(m.precio || m.price || m.Precio_Venta_Inauguracion_MXN || m.Precio_Lista_Original_MXN) || 0;
            const sku = m.sku || m.SKU || 'N/A';
            const brand = m.marca || m.brand || m.Marca || '';
            const img = m.imagen || m.image || m.Imagen_Local || m.URL_CDN || `https://iaworldcenter-creator.github.io/pc-custom-lab/img/${sku}.jpg`;
            const highlighted = title.replace(regex, '<mark style="background: rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 2px; padding: 0 2px;">$1</mark>');

            return `
                <div id="sugg-item-${idx}" class="suggestion-item" data-sku="${sku}" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px; border-radius: 12px; background: #0d131f; border: 1px solid #1e293b; margin-bottom: 6px; transition: all 0.2s ease;">
                    <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                        <img src="${img}" alt="${title}" onerror="this.src='https://placehold.co/80x80/0f172a/38bdf8?text=${sku}'" style="width: 48px; height: 48px; object-fit: contain; background: #020617; border-radius: 8px; border: 1px solid #334155; shrink: 0;">
                        <div style="min-width: 0;">
                            <div style="font-size: 0.7rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">${brand} · SKU: ${sku}</div>
                            <div style="font-size: 0.8rem; color: #f8fafc; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">${highlighted}</div>
                            <div style="font-size: 0.9rem; color: #fbbf24; font-weight: 900; font-family: monospace;">$${price.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</div>
                        </div>
                    </div>
                    
                    <!-- Acciones directas: 1 Clic y Ver Detalle -->
                    <div style="display: flex; align-items: center; gap: 6px; shrink: 0;">
                        <button onclick="window.ecosystemAddToCart('${sku}', '${encodeURIComponent(title)}', ${price}, '${img}')" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; padding: 7px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">
                            🛒 <span>Comprar 1 clic</span>
                        </button>
                        <a href="producto.html?sku=${sku}" class="action-view" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 7px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                            👁️ <span>Ver</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        this.dropdown.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px 8px 8px; border-bottom: 1px solid #1e293b; margin-bottom: 8px;">
                <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 700;">⚡ RESULTADOS EN VIVO (${matches.length})</span>
                <button onclick="window.closeGlobalSearchDropdown()" style="background: transparent; border: none; color: #64748b; font-size: 0.85rem; font-weight: bold; cursor: pointer;">✕ Cerrar</button>
            </div>
            ${itemsHtml}
        `;
        this.dropdown.style.display = 'block';
    }

    closeDropdown() {
        if (this.dropdown) this.dropdown.style.display = 'none';
        this.selectedIndex = -1;
    }
}

// Función global de compra / agregado en 1 clic
window.ecosystemAddToCart = function(sku, titleEnc, price, img) {
    const title = decodeURIComponent(titleEnc);
    let cart = [];
    try {
        const raw = localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items');
        if (raw) cart = JSON.parse(raw);
    } catch(e) { cart = []; }

    const existing = cart.find(i => i.sku === sku);
    if (existing) {
        existing.quantity = (parseInt(existing.quantity || existing.qty) || 1) + 1;
        existing.qty = existing.quantity;
    } else {
        cart.push({
            sku: sku,
            nombre: title,
            title: title,
            precio: price,
            price: price,
            imagen: img,
            quantity: 1,
            qty: 1
        });
    }

    try {
        localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
        localStorage.setItem('cart_items', JSON.stringify(cart));
    } catch(e) {}

    if (typeof updateCartCounter === 'function') updateCartCounter();

    // Notificación Toast de confirmación
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(135deg, #10b981, #047857);
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 800;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    toast.innerHTML = `✅ <span>¡Agregado a tu canasta en 1 clic! (${sku})</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
};

window.closeGlobalSearchDropdown = function() {
    const dd = document.getElementById('search-suggestions');
    if (dd) dd.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    new HighConversionSearchEngine();
});