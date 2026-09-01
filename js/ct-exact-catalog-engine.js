// =========================================================================
// MOTOR UNIVERSAL BILINGÜE PC CUSTOM LAB (16,139 PRODUCTOS INDEXADOS)
// =========================================================================

let currentViewStyle = 'grid';
let currentPageNumber = 1;
let productsPerPage = 24;
let activeSelectedCategory = 'Todas';
let activeSelectedChip = 'Todos';
let activeSelectedBrand = 'Todas';
let activeMinPrice = 0;
let activeMaxPrice = Infinity;
let activeMinDiscount = 0;
let activeSearchQuery = '';
let currentSortCriterion = 'destacados';
let isFullCatalogLoaded = false;

// Normalización de texto sin acentos, mayúsculas o símbolos
function stripAccents(text) {
    if (!text) return "";
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Diccionario de Sinónimos Bilingüe Español - Inglés
const SYNONYM_DICTIONARY = {
    // Ratón / Mouse
    "raton": ["mouse", "raton", "mice", "ratones", "trackball"],
    "ratones": ["mouse", "raton", "mice", "ratones", "trackball"],
    "mouse": ["mouse", "raton", "mice", "ratones", "trackball"],
    "mice": ["mouse", "raton", "mice", "ratones", "trackball"],
    
    // Teclado / Keyboard
    "teclado": ["teclado", "keyboard", "teclados", "keyboards", "keypad"],
    "teclados": ["teclado", "keyboard", "teclados", "keyboards", "keypad"],
    "keyboard": ["teclado", "keyboard", "teclados", "keyboards"],
    "keyboards": ["teclado", "keyboard", "teclados", "keyboards"],
    
    // Combos / Kits
    "combo": ["combo", "kit", "bundle", "duo", "pack"],
    "combos": ["combo", "kit", "bundle", "duo", "pack"],
    "kit": ["combo", "kit", "bundle", "duo", "pack"],
    "kits": ["combo", "kit", "bundle", "duo", "pack"],

    // Reguladores / UPS / No-Breaks / Baterías
    "regulador": ["regulador", "reguladores", "no-break", "nobreak", "ups", "koblenz", "sola basic", "complet", "tripp-lite", "tripp lite", "vica"],
    "reguladores": ["regulador", "reguladores", "no-break", "nobreak", "ups", "koblenz", "sola basic", "complet", "tripp-lite", "tripp lite", "vica"],
    "nobreak": ["no-break", "nobreak", "ups", "regulador", "reguladores", "respaldo"],
    "ups": ["no-break", "nobreak", "ups", "regulador", "reguladores", "respaldo"],
    "bateria": ["bateria", "baterias", "battery", "powerbank", "power bank", "pila", "pilas"],
    "baterias": ["bateria", "baterias", "battery", "powerbank", "power bank", "pila", "pilas"],
    "powerbank": ["powerbank", "power bank", "bateria externa", "cargador portatil", "banco de energia"],
    "power": ["power", "fuente", "energia", "alimentacion", "supply", "psu", "powerbank"],

    // Fuentes de Poder
    "fuente": ["fuente", "fuentes", "psu", "power supply", "poder", "alimentacion"],
    "fuentes": ["fuente", "fuentes", "psu", "power supply", "poder", "alimentacion"],
    "psu": ["fuente", "fuentes", "psu", "power supply"],

    // Pantallas / Monitores
    "pantalla": ["monitor", "pantalla", "display", "monitores", "pantallas", "screen"],
    "pantallas": ["monitor", "pantalla", "display", "monitores", "pantallas", "screen"],
    "monitor": ["monitor", "pantalla", "display", "monitores", "pantallas", "screen"],
    "monitores": ["monitor", "pantalla", "display", "monitores", "pantallas", "screen"],

    // Tarjetas de Video / GPUs
    "grafica": ["gpu", "video", "rtx", "gtx", "radeon", "grafica", "geforce", "tarjeta de video"],
    "graficas": ["gpu", "video", "rtx", "gtx", "radeon", "grafica", "geforce", "tarjeta de video"],
    "gpu": ["gpu", "video", "rtx", "gtx", "radeon", "grafica", "geforce", "tarjeta de video"],
    "video": ["gpu", "video", "rtx", "gtx", "radeon", "grafica", "geforce", "tarjeta de video"],

    // Almacenamiento / Discos
    "disco": ["ssd", "disco", "solido", "nvme", "m2", "hdd", "almacenamiento", "hard drive"],
    "discos": ["ssd", "disco", "solido", "nvme", "m2", "hdd", "almacenamiento", "hard drive"],
    "solido": ["ssd", "solido", "nvme", "m2", "disco"],
    "ssd": ["ssd", "solido", "nvme", "m2", "disco", "almacenamiento"],

    // Memorias RAM
    "ram": ["ram", "memoria", "memorias", "ddr4", "ddr5", "dimm", "sodimm", "kingston", "adata"],
    "memoria": ["ram", "memoria", "memorias", "ddr4", "ddr5", "dimm", "sodimm", "kingston", "adata"],
    "memorias": ["ram", "memoria", "memorias", "ddr4", "ddr5", "dimm", "sodimm", "kingston", "adata"],

    // Tarjetas Madre
    "placa": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd", "mobo", "asus", "gigabyte", "msi"],
    "placas": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd", "mobo", "asus", "gigabyte", "msi"],
    "madre": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd", "mobo"],
    "motherboard": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd", "mobo"]
};

const STOP_WORDS_SET = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas",
    "de", "del", "al", "a", "en", "con", "para", "por",
    "que", "se", "es", "y", "e", "o", "u", "su", "sus",
    "the", "and", "with", "for", "in", "on", "of"
]);

function cleanSearchTokens(query) {
    const qClean = stripAccents(query).replace(/[^a-z0-9\s]/g, ' ');
    const rawWords = qClean.split(' ').filter(w => w.length > 0);
    const filtered = rawWords.filter(w => !STOP_WORDS_SET.has(w));
    return filtered.length > 0 ? filtered : rawWords;
}

function searchCatalogMaster(query) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const tokens = cleanSearchTokens(query);
    if (!tokens || tokens.length === 0) return all;

    const tokenGroups = tokens.map(t => SYNONYM_DICTIONARY[t] || [t]);
    const scoredResults = [];

    const isComboSearch = tokens.some(t => ['teclado', 'teclados', 'keyboard'].includes(t)) && 
        tokens.some(t => ['raton', 'ratones', 'mouse', 'mice', 'combo', 'kit'].includes(t));

    const isRegulatorSearch = tokens.some(t => ['regulador', 'reguladores', 'nobreak', 'ups'].includes(t));
    const isSolidSearch = tokens.some(t => ['solido', 'ssd', 'disco'].includes(t));
    const isPowerSupplySearch = tokens.some(t => ['fuente', 'fuentes', 'psu'].includes(t));

    for (let i = 0; i < all.length; i++) {
        const p = all[i];
        const skuNorm = stripAccents(p.sku || p.clave);
        const nameNorm = stripAccents(p.nombre);
        const catNorm = stripAccents(p.categoria_clasificada);
        const brandNorm = stripAccents(p.marca);
        const descNorm = stripAccents(p.descripcion_completa);

        let matchAll = true;
        let score = 0;

        for (let j = 0; j < tokenGroups.length; j++) {
            const syns = tokenGroups[j];
            let tokenFound = false;

            for (let k = 0; k < syns.length; k++) {
                const s = syns[k];
                if (skuNorm.includes(s)) {
                    score += 500;
                    tokenFound = true;
                    break;
                } else if (nameNorm.includes(s)) {
                    score += 200;
                    tokenFound = true;
                    break;
                } else if (catNorm.includes(s)) {
                    score += 80;
                    tokenFound = true;
                    break;
                } else if (brandNorm.includes(s)) {
                    score += 60;
                    tokenFound = true;
                    break;
                } else if (descNorm.includes(s)) {
                    score += 20;
                    tokenFound = true;
                    break;
                }
            }

            if (!tokenFound) {
                matchAll = false;
                break;
            }
        }

        if (matchAll) {
            // Ponderaciones especiales
            if (isComboSearch) {
                if (nameNorm.includes('teclado') && (nameNorm.includes('mouse') || nameNorm.includes('raton') || nameNorm.includes('kit') || nameNorm.includes('combo'))) {
                    score += 3000;
                }
                if (catNorm === 'accesorios_perifericos') score += 500;
            }

            if (isRegulatorSearch) {
                if (catNorm === 'reguladores_ups') score += 2000;
                if (nameNorm.includes('regulador') || nameNorm.includes('no-break') || nameNorm.includes('ups')) score += 1500;
            }

            if (isSolidSearch) {
                if (catNorm === 'discos_duros') score += 2000;
            }

            if (isPowerSupplySearch) {
                if (catNorm === 'fuentes_energia') score += 2000;
                if (nameNorm.includes('fuente') && (nameNorm.includes('poder') || nameNorm.includes('psu') || nameNorm.includes('600w') || nameNorm.includes('750w'))) score += 2500;
            }

            scoredResults.push({ score, product: p });
        }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.map(r => r.product);
}


// =========================================================================
// CONTROLES DE PRESUPUESTO, DESCUENTOS Y ORDENAMIENTO INTERACTIVO
// =========================================================================

window.setBudgetPreset = function(min, max) {
    activeMinPrice = min;
    activeMaxPrice = max;
    currentPageNumber = 1;
    
    const minInp = document.getElementById("budgetMinInput");
    const maxInp = document.getElementById("budgetMaxInput");
    if (minInp) minInp.value = min > 0 ? min : '';
    if (maxInp) maxInp.value = max < Infinity ? max : '';
    
    renderExactCatalogView();
    window.scrollToResults();
};

window.applyCustomBudget = function() {
    const minInp = document.getElementById("budgetMinInput");
    const maxInp = document.getElementById("budgetMaxInput");
    
    const minVal = parseFloat(minInp ? minInp.value : 0) || 0;
    const maxVal = parseFloat(maxInp && maxInp.value ? maxInp.value : Infinity) || Infinity;
    
    activeMinPrice = minVal;
    activeMaxPrice = maxVal;
    currentPageNumber = 1;
    
    renderExactCatalogView();
    window.scrollToResults();
};

window.setSortCriterion = function(criterion) {
    currentSortCriterion = criterion;
    currentPageNumber = 1;
    renderExactCatalogView();
};

window.setDiscountFilter = function(minPct) {
    activeMinDiscount = minPct;
    currentPageNumber = 1;
    renderExactCatalogView();
    window.scrollToResults();
};

window.scrollToResults = function() {
    const target = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};


window.selectSubChipFilter = function(chipId) {
    activeSelectedChip = chipId;
    currentPageNumber = 1;
    renderExactCatalogView();
    window.scrollToResults();
};

// Inicialización instantánea
function initFullCatalog() {
    if (window.CT_CATALOG_DATA && Array.isArray(window.CT_CATALOG_DATA) && window.CT_CATALOG_DATA.length > 0) {
        isFullCatalogLoaded = true;
        renderSidebarFacets();
        renderExactCatalogView();
        return;
    }
    if (window.CT_CATALOG_DATA_INITIAL && Array.isArray(window.CT_CATALOG_DATA_INITIAL)) {
        window.CT_CATALOG_DATA = window.CT_CATALOG_DATA_INITIAL;
        isFullCatalogLoaded = true;
        renderSidebarFacets();
        renderExactCatalogView();
        return;
    }
}

// Selección de categorías y auto-scroll instantáneo en celular y desktop
window.selectCategoryFacet = function(catId) {
    activeSelectedCategory = catId;
    activeSelectedChip = 'Todos';
    activeSelectedBrand = 'Todas';
    activeSearchQuery = '';
    currentPageNumber = 1;

    const searchInput = document.getElementById("boutiqueSearchInput");
    if (searchInput) searchInput.value = '';

    renderSidebarFacets();
    renderExactCatalogView();

    // Auto-scroll inmediato garantizado a la vitrina
    const target = document.getElementById("results-count-display") || document.getElementById("products-grid-container") || document.getElementById("catalog-main-content-root");
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
        const target2 = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
        if (target2) {
            target2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 80);
};

window.scrollToDepartments = function() {
    const target = document.getElementById("sidebar-facets-root") || document.getElementById("boutiqueSearchInput");
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.resetFacets = function() {
    activeSelectedCategory = 'Todas';
    activeSelectedBrand = 'Todas';
    activeSearchQuery = '';
    currentPageNumber = 1;
    const searchInput = document.getElementById("boutiqueSearchInput");
    if (searchInput) searchInput.value = '';
    renderSidebarFacets();
    renderExactCatalogView();
    window.scrollToDepartments();
};

document.addEventListener("DOMContentLoaded", () => {
    initFullCatalog();
    initPredictiveSearchEngine();
    syncBoutiqueCart();
});

function setViewStyle(style) {
    currentViewStyle = style;
    const btnList = document.getElementById("btn-view-list");
    const btnGrid = document.getElementById("btn-view-grid");
    
    if (btnList && btnGrid) {
        if (style === 'list') {
            btnList.className = "btn-action p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer text-xs flex items-center justify-center min-h-[44px] min-w-[44px]";
            btnGrid.className = "btn-action p-2 rounded-lg text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center justify-center min-h-[44px] min-w-[44px]";
        } else {
            btnGrid.className = "btn-action p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer text-xs flex items-center justify-center min-h-[44px] min-w-[44px]";
            btnList.className = "btn-action p-2 rounded-lg text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center justify-center min-h-[44px] min-w-[44px]";
        }
    }
    renderExactCatalogView();
}

function getFilteredList() {
    let items = (activeSearchQuery && activeSearchQuery.trim() !== '')
        ? searchCatalogMaster(activeSearchQuery)
        : [...(window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [])];

    // 1. Filtro por Departamento / Categoría
    if (activeSelectedCategory !== 'Todas') {
        items = items.filter(p => {
            const catClasif = (p.categoria_clasificada || '').toLowerCase();
            return catClasif === activeSelectedCategory.toLowerCase();
        });

        // Filtro por sub-chip rápido (ej. HDMI, DisplayPort, Diademas)
        if (activeSelectedChip !== 'Todos') {
            items = items.filter(p => (p.chip_filter || '').toLowerCase() === activeSelectedChip.toLowerCase());
        }
    }

    // 2. Filtro por Marca
    if (activeSelectedBrand !== 'Todas') {
        items = items.filter(p => (p.marca || '').toUpperCase() === activeSelectedBrand.toUpperCase());
    }

    // 3. Filtro por Presupuesto (Rango de Precios Mínimo y Máximo)
    if (activeMinPrice > 0 || activeMaxPrice < Infinity) {
        items = items.filter(p => {
            const pr = parseFloat(p.precio_mxn || p.precio || 0);
            return pr >= activeMinPrice && pr <= activeMaxPrice;
        });
    }

    // 4. Filtro por Descuento Mínimo
    if (activeMinDiscount > 0) {
        items = items.filter(p => {
            const desc = parseFloat(p.descuento_porcentaje || 25);
            return desc >= activeMinDiscount;
        });
    }

    // 5. Ordenamiento Matemático y Regla Foto-First
    items.sort((a, b) => {
        // Orden Primario: Los productos con fotografía comprobada van en las primeras páginas (1, 2, 3, 4...)
        const aHasImg = (a.has_verified_image === true || a.distribuidor === 'CT Internacional') ? 1 : 0;
        const bHasImg = (b.has_verified_image === true || b.distribuidor === 'CT Internacional') ? 1 : 0;
        
        if (aHasImg !== bHasImg) {
            return bHasImg - aHasImg; // Primero con imagen
        }

        // Si tienen igual prioridad de imagen, aplicar el criterio seleccionado
        if (currentSortCriterion === 'precio_asc') {
            return (a.precio_mxn || a.precio || 0) - (b.precio_mxn || b.precio || 0);
        } else if (currentSortCriterion === 'precio_desc') {
            return (b.precio_mxn || b.precio || 0) - (a.precio_mxn || a.precio || 0);
        } else if (currentSortCriterion === 'descuento') {
            return (b.descuento_porcentaje || 25) - (a.descuento_porcentaje || 25);
        } else if (currentSortCriterion === 'nombre') {
            return (a.nombre || '').localeCompare(b.nombre || '');
        } else {
            // Destacados / Relevancia
            return (a.sort_priority || 1) - (b.sort_priority || 1);
        }
    });

    return items;
}

function getPlaceholderForCat(cat) {
    const map = {
        'procesadores': 'cpu_placeholder.jpg',
        'tarjetas_madre': 'mbd_placeholder.jpg',
        'memorias_ram': 'ram_placeholder.jpg',
        'almacenamiento_flash': 'ssd_placeholder.jpg',
        'almacenamiento_ssd': 'ssd_placeholder.jpg',
        'tarjetas_video': 'gpu_placeholder.jpg',
        'tarjetas_de_video': 'gpu_placeholder.jpg',
        'gabinetes': 'gab_placeholder.jpg',
        'fuentes_energia': 'psu_placeholder.jpg',
        'enfriamiento': 'cooling_placeholder.jpg',
        'reguladores_ups': 'ups_placeholder.jpg',
        'monitores': 'mon_placeholder.jpg',
        'cables_adaptadores': 'acc_placeholder.jpg',
        'audio_audifonos': 'elec_placeholder.jpg',
        'teclados_mouse': 'acc_placeholder.jpg',
        'laptops_portatiles': 'lap_placeholder.jpg',
        'computadoras_sistemas': 'pc_placeholder.jpg',
        'computadoras_ensambladas': 'pc_placeholder.jpg',
        'servidores_enterprise': 'minipc_placeholder.jpg',
        'impresoras_consumibles': 'imp_placeholder.jpg',
        'conectividad_redes': 'redes_placeholder.jpg',
        'software_licencias': 'sof_placeholder.jpg',
        'seguridad_cctv': 'cctv_placeholder.jpg',
        'telefonia_seguridad': 'cctv_placeholder.jpg',
        'punto_de_venta': 'pos_placeholder.jpg',
        'celulares_tablets': 'lap_placeholder.jpg',
        'videojuegos_gaming': 'acc_placeholder.jpg',
        'accesorios_perifericos': 'acc_placeholder.jpg'
    };
    return `./assets/img/placeholders/${map[cat] || 'acc_placeholder.jpg'}`;
}

window.handleProductImgError = function(imgEl, sku, cat) {
    if (!imgEl) return;
    const step = parseInt(imgEl.getAttribute('data-err-step') || '0', 10);
    const fallbacks = [
        `https://static.ctonline.mx/imagenes/${sku}/${sku}_full.jpg`,
        `https://static.ctonline.mx/imagenes/${sku}/${sku}_800.jpg`,
        `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`,
        `https://d22k14p2jfj20i.cloudfront.net/items/${sku}.jpg`,
        `https://static.ctonline.mx/img/Thumbs/${sku}_100.jpg`,
        getPlaceholderForCat(cat)
    ];

    if (step < fallbacks.length) {
        imgEl.setAttribute('data-err-step', (step + 1).toString());
        imgEl.src = fallbacks[step];
    } else {
        imgEl.onerror = null;
        imgEl.src = getPlaceholderForCat(cat);
    }
};

function renderExactCatalogView() {

    // Renderizar barra de chips si estamos en Cables o Audio
    let chipsHtml = '';
    if (activeSelectedCategory === 'cables_adaptadores') {
        const cableChips = [
            { id: 'Todos', label: 'Todos los Cables' },
            { id: 'hdmi', label: 'HDMI' },
            { id: 'displayport', label: 'DisplayPort' },
            { id: 'usb', label: 'USB-C / USB' },
            { id: 'red', label: 'Red / Cat6' },
            { id: 'impresora', label: 'Impresora / Paralelo' },
            { id: 'vga_dvi', label: 'VGA / DVI' },
            { id: 'poder', label: 'Alimentación' },
            { id: 'adaptadores', label: 'Adaptadores & Coples' }
        ];
        chipsHtml = `
            <div class="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-1">
                ${cableChips.map(c => `
                    <button type="button" onclick="selectSubChipFilter('${c.id}')" class="btn-action px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold shrink-0 transition cursor-pointer border ${activeSelectedChip === c.id ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'}">
                        ${c.label}
                    </button>
                `).join('')}
            </div>
        `;
    } else if (activeSelectedCategory === 'audio_audifonos') {
        const audioChips = [
            { id: 'Todos', label: 'Todo Audio' },
            { id: 'diademas', label: 'Diademas & Headsets Gamer' },
            { id: 'bluetooth', label: 'Bluetooth / TWS' },
            { id: 'bocinas', label: 'Bocinas & Parlantes' },
            { id: 'microfonos', label: 'Micrófonos' },
            { id: 'auriculares', label: 'Auriculares In-Ear' }
        ];
        chipsHtml = `
            <div class="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-1">
                ${audioChips.map(c => `
                    <button type="button" onclick="selectSubChipFilter('${c.id}')" class="btn-action px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold shrink-0 transition cursor-pointer border ${activeSelectedChip === c.id ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'}">
                        ${c.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    const container = document.getElementById("products-grid-container");
    const resultsCountTxt = document.getElementById("results-count-display");
    if (!container) return;

    const filtered = getFilteredList();
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / productsPerPage) || 1;

    if (currentPageNumber > totalPages) currentPageNumber = totalPages;
    const startIdx = (currentPageNumber - 1) * productsPerPage;
    const pageItems = filtered.slice(startIdx, startIdx + productsPerPage);

    if (resultsCountTxt) {
        let titleTxt = '';
        if (activeSearchQuery) {
            titleTxt = `Búsqueda: "${activeSearchQuery}" <span class="text-slate-400 font-normal">(${totalCount.toLocaleString('es-MX')} productos)</span>`;
        } else if (activeSelectedCategory !== 'Todas') {
            titleTxt = `${activeSelectedCategory.replace(/_/g, ' ').toUpperCase()} <span class="text-slate-400 font-normal">(${startIdx + 1}-${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount.toLocaleString('es-MX')})</span>`;
        } else {
            titleTxt = `Aparador Principal <span class="text-slate-400 font-normal">(${startIdx + 1}-${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount.toLocaleString('es-MX')})</span>`;
        }
        resultsCountTxt.innerHTML = titleTxt + (chipsHtml ? `<div class="mt-2 w-full">${chipsHtml}</div>` : '');
    }

    renderPaginationBar(totalPages);

    if (pageItems.length === 0) {
        container.className = "w-full py-16 text-center text-slate-300 font-mono text-sm bg-slate-900/90 border border-slate-800 rounded-2xl";
        container.innerHTML = `
            <i class="fa-solid fa-box-open text-4xl text-cyan-400 mb-3 block" aria-hidden="true"></i>
            No se encontraron productos con los filtros seleccionados.
            <br><button onclick="resetFacets()" aria-label="Ver todo el catálogo" class="btn-action mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-lg hover:shadow-cyan-500/30 min-h-[44px]">Ver Todo el Catálogo</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2";
        container.innerHTML = pageItems.map((p) => {
            const sku = p.sku;
            const cat = p.categoria_clasificada || 'accesorios_perifericos';
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const localImg = `assets/img/${sku}.webp`;
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_full.jpg`;
            const cdnImg400 = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const cdnThumb = `https://static.ctonline.mx/img/Thumbs/${sku}_100.jpg`;
            const cdnCloudfront = `https://d22k14p2jfj20i.cloudfront.net/items/${sku}.jpg`;
            const placeholder = getPlaceholderForCat(cat);

            return `
                <article class="bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-3.5 flex flex-col justify-between transition group shadow-xl hover:shadow-cyan-500/10 relative overflow-hidden text-slate-100">
                    <div class="absolute -top-7 -left-7 w-16 h-16 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow-md z-10">
                        <span class="text-[7.5px] font-black text-white uppercase tracking-tighter">-25% DTO</span>
                    </div>

                    <div>
                        <!-- Foto Grande -->
                        <div onclick="openProductDetailModal('${sku}')" class="w-full aspect-square bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 mb-2.5 group-hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-center">
                            <img 
                                src="${localImg}" 
                                alt="${title}" 
                                width="300" 
                                height="300" 
                                loading="lazy" 
                                decoding="async" 
                                class="w-full h-full object-contain group-hover:scale-105 transition duration-200" 
                                onerror="window.handleProductImgError(this, '${sku}', '${cat}')"
                            />
                        </div>

                        <!-- Precios Claros -->
                        <div class="text-center mb-1.5">
                            <span class="text-sm font-black text-emerald-300 block font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <div class="flex items-center justify-center gap-1.5 text-[10px] font-mono">
                                <span class="text-slate-400 line-through">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                <span class="text-amber-300 font-bold">Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div class="text-center text-[9px] text-cyan-300 font-mono font-bold mb-1 flex items-center justify-center gap-1">
                            <i class="fa-solid fa-truck-bolt text-[10px]" aria-hidden="true"></i> Disponible en Pedro Moreno 501 A
                        </div>

                        <h3 onclick="openProductDetailModal('${sku}')" class="text-slate-100 text-xs font-semibold text-center line-clamp-2 leading-tight hover:text-cyan-300 transition mb-1 cursor-pointer" title="${title}">
                            ${title}
                        </h3>

                        <div class="text-center text-[9.5px] font-mono text-slate-400 mb-2">
                            <span>SKU: <strong class="text-cyan-300">${sku}</strong></span>
                        </div>
                    </div>

                    <!-- Botones de Acción: Ficha, + Carrito y Comprar -->
                    <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div class="flex gap-1.5">
                            <button 
                                onclick="openProductDetailModal('${sku}')" 
                                aria-label="Ver ficha de ${title}" 
                                class="btn-action flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10.5px] font-bold rounded-xl py-2 transition cursor-pointer border border-slate-700 min-h-[40px] flex items-center justify-center gap-1"
                            >
                                <i class="fa-solid fa-file-lines text-xs"></i> <span>Ficha</span>
                            </button>
                            <button 
                                onclick="addToCartCT('${sku}')" 
                                aria-label="Agregar ${title} al carrito" 
                                class="btn-action flex-1 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10.5px] font-bold rounded-xl py-2 transition active:scale-95 shadow cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
                            >
                                <i class="fa-solid fa-cart-plus text-xs"></i> <span>+ Carrito</span>
                            </button>
                        </div>
                        <button 
                            onclick="buyNowCT('${sku}')" 
                            aria-label="Comprar ${title} ahora" 
                            class="btn-action w-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono text-[11px] font-black rounded-xl py-2.5 uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg cursor-pointer min-h-[44px]"
                        >
                            <i class="fa-solid fa-bolt text-yellow-300"></i> <span>Comprar Ahora</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    } else {
        container.className = "flex flex-col gap-3.5 pb-2";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const cat = p.categoria_clasificada || 'accesorios_perifericos';
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const localImg = `assets/img/${sku}.webp`;
            const placeholder = getPlaceholderForCat(cat);

            return `
                <article class="bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-xl relative overflow-hidden text-slate-100">
                    <div class="w-24 h-24 sm:w-28 sm:h-28 bg-slate-950 rounded-xl p-2 shrink-0 flex items-center justify-center cursor-pointer" onclick="openProductDetailModal('${sku}')">
                        <img src="${localImg}" alt="${title}" width="120" height="120" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${sku}', '${cat}')" />
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                        <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">${cat.replace(/_/g, ' ')} • SKU: ${sku}</span>
                        <h3 onclick="openProductDetailModal('${sku}')" class="text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-300 transition line-clamp-2 cursor-pointer mb-1.5">${title}</h3>
                        <div class="text-[11px] font-mono text-slate-400">Entrega Inmediata en Pedro Moreno 501 A • Garantía 48h Directa</div>
                    </div>
                    <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 shrink-0 space-y-2">
                        <div class="text-right">
                            <span class="text-[10px] text-slate-500 line-through font-mono block">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-sm sm:text-base font-black text-emerald-400 font-mono">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</div>
                        </div>
                        <div class="flex gap-1.5 w-full">
                            <button onclick="addToCartCT('${sku}')" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-[10.5px] font-mono uppercase flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer min-h-[40px]">
                                <i class="fa-solid fa-cart-plus"></i> +Carrito
                            </button>
                            <button onclick="buyNowCT('${sku}')" class="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black py-2 rounded-xl text-[10.5px] font-mono uppercase flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer min-h-[40px]">
                                <i class="fa-solid fa-bolt"></i> Comprar
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }
}

function renderPaginationBar(totalPages) {
    const bars = document.querySelectorAll(".pagination-target-bar");
    if (!bars.length) return;

    if (totalPages <= 1) {
        bars.forEach(b => b.innerHTML = '');
        return;
    }

    let html = `
        <div class="flex items-center gap-1 font-mono text-xs">
            <button onclick="goToPage(${currentPageNumber - 1})" ${currentPageNumber === 1 ? 'disabled class="p-1.5 rounded-lg text-slate-600 cursor-not-allowed min-h-[40px]"' : 'class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer min-h-[40px]"'} aria-label="Página anterior">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold font-mono">
                ${currentPageNumber} / ${totalPages}
            </span>
            <button onclick="goToPage(${currentPageNumber + 1})" ${currentPageNumber === totalPages ? 'disabled class="p-1.5 rounded-lg text-slate-600 cursor-not-allowed min-h-[40px]"' : 'class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer min-h-[40px]"'} aria-label="Página siguiente">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    `;

    bars.forEach(b => b.innerHTML = html);
}

function goToPage(page) {
    const filtered = getFilteredList();
    const totalPages = Math.ceil(filtered.length / productsPerPage) || 1;
    if (page < 1 || page > totalPages) return;
    currentPageNumber = page;
    renderExactCatalogView();
    const showcaseTarget = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (showcaseTarget) showcaseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSidebarFacets() {
    const root = document.getElementById("sidebar-facets-root");
    if (!root) return;

    // BLOQUE 1: ENSAMBLE DE HARDWARE & COMPUTADORAS (ORDEN PRIORITARIO)
    const block1 = [
        { id: 'procesadores', name: '⚡ Procesadores (Intel / AMD)', icon: 'fa-microchip' },
        { id: 'tarjetas_madre', name: '🧩 Tarjetas Madre (Motherboards)', icon: 'fa-chess-board' },
        { id: 'memorias_ram', name: '🧠 Memorias RAM para PC/Laptop', icon: 'fa-memory' },
        { id: 'almacenamiento_flash', name: '💾 Almacenamiento Flash, SD & USB', icon: 'fa-sd-card' },
        { id: 'almacenamiento_ssd', name: '💽 Discos SSD NVMe & HDDs', icon: 'fa-hard-drive' },
        { id: 'tarjetas_video', name: '🎮 Tarjetas de Video (GPUs)', icon: 'fa-vr-cardboard' },
        { id: 'gabinetes', name: '🖥️ Gabinetes & Chasis Gamer', icon: 'fa-server' },
        { id: 'fuentes_energia', name: '🔌 Fuentes de Poder Certificadas', icon: 'fa-bolt' },
        { id: 'enfriamiento', name: '❄️ Enfriamiento Líquido & Disipadores', icon: 'fa-fan' },
        { id: 'monitores', name: '🖥️ Monitores & Pantallas PC', icon: 'fa-desktop' },
        { id: 'teclados_mouse', name: '⌨️ Teclados, Mouse & Periféricos', icon: 'fa-keyboard' },
        { id: 'computadoras_sistemas', name: '💻 Computadoras Completas & Laptops', icon: 'fa-laptop-code' }
    ];

    // BLOQUE 2: CABLES, AUDIO & CONECTIVIDAD (DONDE DESTACA INTCOMEX)
    const block2 = [
        { id: 'cables_adaptadores', name: '🔌 Cables, Adaptadores & Conectores', icon: 'fa-network-wired' },
        { id: 'audio_audifonos', name: '🎧 Audio, Diademas & Audífonos', icon: 'fa-headphones' },
        { id: 'reguladores_ups', name: '🔋 Reguladores & No-Breaks (UPS)', icon: 'fa-car-battery' },
        { id: 'conectividad_redes', name: '🌐 Redes & Conectividad WiFi', icon: 'fa-wifi' }
    ];

    // BLOQUE 3: SOLUCIONES CORPORATIVAS, SOFTWARE & POS
    const block3 = [
        { id: 'impresoras_consumibles', name: '🖨️ Impresoras, Tóners & Tintas', icon: 'fa-print' },
        { id: 'software_licencias', name: '💿 Software & Licencias Originales', icon: 'fa-compact-disc' },
        { id: 'telefonia_seguridad', name: '📹 Seguridad CCTV & Control Acceso', icon: 'fa-video' },
        { id: 'punto_de_venta', name: '🏷️ Punto de Venta (POS)', icon: 'fa-barcode' },
        { id: 'celulares_tablets', name: '📱 Smartphones, Celulares & Tablets', icon: 'fa-mobile-screen-button' },
        { id: 'videojuegos_gaming', name: '🕹️ Consolas & Sillas Gamer', icon: 'fa-gamepad' },
        { id: 'accesorios_perifericos', name: '🎒 Accesorios & Maletines', icon: 'fa-bag-shopping' }
    ];

    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const getCount = (id) => all.filter(p => (p.categoria_clasificada || '').toLowerCase() === id.toLowerCase()).length;

    const renderBtn = (c) => `
        <label for="cat_${c.id}" class="category-link flex items-center justify-between cursor-pointer hover:text-cyan-300 transition py-1">
            <span class="flex items-center gap-2.5 truncate">
                <input type="radio" id="cat_${c.id}" name="cat_facet" aria-label="${c.name}" ${activeSelectedCategory === c.id ? 'checked' : ''} onchange="window.selectCategoryFacet('${c.id}')" class="accent-cyan-400 cursor-pointer shrink-0" />
                <i class="fa-solid ${c.icon} text-cyan-400 w-4 text-center shrink-0" aria-hidden="true"></i>
                <span class="cat-title truncate ${activeSelectedCategory === c.id ? 'font-black text-cyan-300' : 'text-slate-200'} text-xs">${c.name}</span>
            </span>
            <span class="cat-count font-mono text-[10px] text-slate-400">(${getCount(c.id)})</span>
        </label>
    `;

    root.innerHTML = `
        <div class="bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 text-white p-3 rounded-t-2xl font-bold text-xs uppercase flex items-center justify-between shadow-lg">
            <h2 class="flex items-center gap-2 text-cyan-300 font-mono text-xs"><i class="fa-solid fa-sliders text-cyan-400" aria-hidden="true"></i> Departamentos</h2>
            <span class="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">${all.length.toLocaleString('es-MX')} Items</span>
        </div>

        <div class="p-3 bg-slate-900/95 border-x border-b border-slate-800 rounded-b-2xl text-slate-200 text-xs shadow-2xl flex flex-col justify-between space-y-4">
            
            <div class="flex gap-2">
                <button onclick="renderExactCatalogView()" aria-label="Aplicar filtros seleccionados" class="btn-action flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-[11px] uppercase transition cursor-pointer shadow min-h-[44px]">
                    Aplicar
                </button>
                <button onclick="window.resetFacets()" aria-label="Limpiar todos los filtros" class="btn-action flex-1 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-200 hover:text-red-400 font-bold rounded-xl text-[11px] uppercase transition cursor-pointer min-h-[44px]">
                    Limpiar
                </button>
            </div>

            <!-- ENLACE A TODAS LAS CATEGORÍAS -->
            <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition flex items-center">
                <label for="cat_todas" class="category-link flex items-center justify-between cursor-pointer w-full">
                    <span class="flex items-center gap-2 truncate">
                        <input type="radio" id="cat_todas" name="cat_facet" aria-label="Todas las categorías" ${activeSelectedCategory === 'Todas' ? 'checked' : ''} onchange="window.selectCategoryFacet('Todas')" class="accent-cyan-400 cursor-pointer shrink-0" />
                        <i class="fa-solid fa-layer-group text-xs text-cyan-400 shrink-0" aria-hidden="true"></i>
                        <span class="cat-title truncate font-black text-white text-xs">Todas las Categorías</span>
                    </span>
                    <span class="cat-count font-mono font-bold text-[10px] text-cyan-300">(${all.length.toLocaleString('es-MX')})</span>
                </label>
            </div>

            <!-- BLOQUE 1 - COMPUTADORAS & COMPONENTES -->
            <div class="border-b border-slate-800 pb-3">
                <h3 class="dept-heading text-cyan-300 font-mono uppercase text-xs font-black mb-2">
                    <i class="fa-solid fa-microchip text-cyan-400" aria-hidden="true"></i> 1. Computadoras & Ensamble
                </h3>
                <div class="space-y-1 text-slate-300">
                    ${block1.map(renderBtn).join('')}
                </div>
            </div>

            <!-- BLOQUE 2 - CABLES, AUDIO & PERIFÉRICOS -->
            <div class="border-b border-slate-800 pb-3">
                <h3 class="dept-heading text-emerald-300 font-mono uppercase text-xs font-black mb-2">
                    <i class="fa-solid fa-plug text-emerald-400" aria-hidden="true"></i> 2. Cables, Audio & Periféricos
                </h3>
                <div class="space-y-1 text-slate-300">
                    ${block2.map(renderBtn).join('')}
                </div>
            </div>

            <!-- BLOQUE 3 - SOLUCIONES, REDES Y SOFTWARE -->
            <div class="border-b border-slate-800 pb-3">
                <h3 class="dept-heading text-purple-300 font-mono uppercase text-xs font-black mb-2">
                    <i class="fa-solid fa-puzzle-piece text-purple-400" aria-hidden="true"></i> 3. Soluciones & Redes
                </h3>
                <div class="space-y-1 text-slate-300">
                    ${block3.map(renderBtn).join('')}
                </div>
            </div>

            <!-- BARRA DE PRESUPUESTO INTERACTIVO Y RANGO DE PRECIO -->
            <div class="border-b border-slate-800 pb-3.5 space-y-2.5">
                <h3 class="dept-heading text-amber-300 font-mono uppercase text-xs font-black flex items-center justify-between">
                    <span><i class="fa-solid fa-calculator text-amber-400 mr-1.5"></i> Tu Presupuesto</span>
                    <span class="text-[9px] text-slate-400 font-normal">($ MXN)</span>
                </h3>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label for="budgetMinInput" class="text-[9px] font-mono text-slate-400 block mb-0.5">Mínimo:</label>
                        <input type="number" id="budgetMinInput" placeholder="$0" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono outline-none focus:border-cyan-400" />
                    </div>
                    <div>
                        <label for="budgetMaxInput" class="text-[9px] font-mono text-slate-400 block mb-0.5">Máximo:</label>
                        <input type="number" id="budgetMaxInput" placeholder="Sin límite" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono outline-none focus:border-cyan-400" />
                    </div>
                </div>

                <button type="button" onclick="applyCustomBudget()" class="btn-action w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono uppercase transition cursor-pointer shadow min-h-[36px]">
                    Filtrar Presupuesto
                </button>

                <!-- Botones de Presupuesto Rápido -->
                <div class="flex flex-wrap gap-1 pt-1">
                    <button type="button" onclick="setBudgetPreset(0, 1000)" class="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono transition cursor-pointer">&lt; $1,000</button>
                    <button type="button" onclick="setBudgetPreset(1000, 5000)" class="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono transition cursor-pointer">$1k - $5k</button>
                    <button type="button" onclick="setBudgetPreset(5000, 15000)" class="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono transition cursor-pointer">$5k - $15k</button>
                    <button type="button" onclick="setBudgetPreset(15000, 50000)" class="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono transition cursor-pointer">$15k - $50k</button>
                    <button type="button" onclick="setBudgetPreset(50000, 9999999)" class="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono transition cursor-pointer">&gt; $50k</button>
                </div>
            </div>

            <!-- FILTRO DE DESCUENTOS Y OFERTAS -->
            <div class="border-b border-slate-800 pb-3 space-y-1.5">
                <h3 class="dept-heading text-red-400 font-mono uppercase text-xs font-black flex items-center gap-1.5">
                    <i class="fa-solid fa-tags text-red-400"></i> Descuentos & Ofertas
                </h3>
                <div class="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                    <button type="button" onclick="setDiscountFilter(0)" class="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition cursor-pointer">Todos</button>
                    <button type="button" onclick="setDiscountFilter(25)" class="px-2 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-300 text-left font-bold transition cursor-pointer">-25% Apertura</button>
                </div>
            </div>

            <!-- 3 TARJETAS DE CONVERSIÓN INTEGRADAS -->
            <div class="pt-2 space-y-3.5 border-t border-slate-800">
                
                <!-- TARJETA 1: APP MÓVIL CON QR -->
                <div class="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-3.5 text-center shadow-lg space-y-2.5">
                    <span class="text-[11px] font-mono font-black text-cyan-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-mobile-screen-button text-cyan-400"></i> App Móvil & Pedidos
                    </span>
                    
                    <div class="w-32 h-32 mx-auto bg-white p-2 rounded-2xl shadow-md flex items-center justify-center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://iaworldcenter-creator.github.io/pc-custom-lab/&color=0-0-0&bgcolor=255-255-255" alt="Código QR Descargar App" width="120" height="120" class="w-full h-full object-contain" />
                    </div>
                    <span class="text-[9.5px] font-mono text-slate-400 block">Escanea con tu celular</span>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <a href="https://play.google.com/store" target="_blank" rel="noopener" class="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white rounded-xl p-2 flex flex-col items-center justify-center transition shadow group min-h-[44px]">
                            <i class="fa-brands fa-google-play text-cyan-400 text-sm mb-0.5 group-hover:scale-110 transition"></i>
                            <span class="text-[8px] font-mono uppercase text-slate-400 leading-none">Disponible en</span>
                            <span class="text-[9.5px] font-bold text-white leading-tight">Google Play</span>
                        </a>
                        <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener" class="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white rounded-xl p-2 flex flex-col items-center justify-center transition shadow group min-h-[44px]">
                            <i class="fa-brands fa-apple text-slate-200 text-sm mb-0.5 group-hover:scale-110 transition"></i>
                            <span class="text-[8px] font-mono uppercase text-slate-400 leading-none">Consíguelo en</span>
                            <span class="text-[9.5px] font-bold text-white leading-tight">App Store</span>
                        </a>
                    </div>

                    <a href="https://wa.me/523337271440" target="_blank" rel="noopener" class="w-full bg-slate-900 hover:bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40 hover:border-emerald-400 font-mono font-bold rounded-xl text-[10.5px] uppercase py-2.5 flex items-center justify-center gap-1.5 transition shadow min-h-[40px]">
                        <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                        <span>▶ Abrir App Oficial</span>
                    </a>
                </div>

                <!-- TARJETA 2: CREADO CON GOOGLE GEMINI -->
                <div class="bg-slate-950/90 border border-blue-500/40 hover:border-blue-400 rounded-2xl p-3.5 shadow-lg transition text-left space-y-2">
                    <span class="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-wand-magic-sparkles text-blue-400" aria-hidden="true"></i> Creado con Google Gemini
                    </span>
                    <div class="text-white font-bold text-xs leading-snug">
                        Inteligencia Artificial para tu Negocio
                    </div>
                    <a href="https://gemini.google.com/" target="_blank" rel="noopener" aria-label="Suscribirse a Google Gemini" class="btn-action w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-[10.5px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow min-h-[42px]">
                        <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        <span>SUSCRÍBETE A GOOGLE GEMINI</span>
                    </a>
                </div>

                <!-- TARJETA 3: DESARROLLADO POR ANTI-GRAVITY -->
                <div class="bg-slate-950/90 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 shadow-lg transition text-left space-y-2">
                    <span class="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-robot text-amber-400" aria-hidden="true"></i> Desarrollado por Anti-Gravity
                    </span>
                    <div class="text-white font-bold text-xs leading-snug">
                        Agente Autónomo de Software
                    </div>
                    <a href="https://antigravity.google/download" target="_blank" rel="noopener" aria-label="Descargar Anti-Gravity Gratis" class="btn-action w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-[10.5px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow min-h-[42px]">
                        <i class="fa-solid fa-download text-[10px]"></i>
                        <span>DESCARGAR Y PRUEBA ANTI-GRAVITY</span>
                    </a>
                </div>

            </div>

        </div>
    `;
}

let searchDebounceTimer = null;
function initPredictiveSearchEngine() {
    const input = document.getElementById("boutiqueSearchInput");
    const box = document.getElementById("boutique-autocomplete-box");
    if (!input || !box) return;

    const form = input.closest("form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            box.classList.add("hidden");
            window.executeSearchQuery(input.value);
        });
    }

    input.addEventListener("input", (e) => {
        clearTimeout(searchDebounceTimer);
        const rawQuery = (e.target.value || '').trim();
        
        if (rawQuery.length < 1) {
            box.classList.add("hidden");
            box.innerHTML = "";
            if (activeSearchQuery !== '') {
                activeSearchQuery = '';
                renderExactCatalogView();
            }
            return;
        }

        searchDebounceTimer = setTimeout(() => {
            const matches = searchCatalogMaster(rawQuery);

            if (matches.length === 0) {
                box.innerHTML = `
                    <div class="p-4 text-center text-slate-300 font-mono text-xs">
                        <i class="fa-solid fa-magnifying-glass text-cyan-400 text-lg mb-1 block" aria-hidden="true"></i>
                        No se encontraron coincidencias para "<strong>${rawQuery}</strong>".
                        <br><span class="text-[10px] text-slate-400">Prueba con: ratón y teclado, regulador, i9, RTX 4070, fuente de poder...</span>
                    </div>
                `;
                box.classList.remove("hidden");
                return;
            }

            const topMatches = matches.slice(0, 10);

            box.innerHTML = `
                <div class="p-2.5 border-b border-slate-800 flex justify-between items-center text-[10.5px] font-mono text-slate-300 bg-slate-950/90">
                    <span>${matches.length.toLocaleString('es-MX')} coincidencias encontradas para: "<strong>${rawQuery}</strong>"</span>
                    <button type="button" onclick="window.executeSearchQuery(document.getElementById('boutiqueSearchInput').value);" class="text-cyan-300 font-bold hover:underline cursor-pointer">
                        Ver todas en aparador »
                    </button>
                </div>
                <div class="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                    ${topMatches.map(p => {
                        const sku = p.sku || p.clave;
                        const cat = p.categoria_clasificada || 'accesorios_perifericos';
                        const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
                        const price = p.precio_mxn || p.precio;
                        const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
                        const localImg = `assets/img/${sku}.webp`;
                        const placeholder = getPlaceholderForCat(cat);

                        return `
                            <div class="flex items-center justify-between gap-3 p-3 hover:bg-slate-850 transition cursor-pointer group min-h-[48px]" onclick="openProductDetailModal('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" role="button" tabindex="0" aria-label="Ver detalle de ${title}">
                                <div class="w-12 h-12 bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-800 group-hover:border-cyan-400/50 flex items-center justify-center">
                                    <img src="${localImg}" alt="${title}" width="48" height="48" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${sku}', '${cat}')" />
                                </div>
                                <div class="flex-1 min-w-0 text-left">
                                    <div class="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate">${title}</div>
                                    <div class="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                                        <span class="text-cyan-300 font-bold">SKU: ${sku}</span>
                                        <span>•</span>
                                        <span class="text-amber-300">May: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div class="text-right shrink-0 flex items-center gap-1.5">
                                    <div class="text-xs font-mono font-black text-emerald-300">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                                    <button type="button" onclick="event.stopPropagation(); openProductDetailModal('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" aria-label="Ver ficha de ${title}" class="btn-action bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-slate-700 uppercase min-h-[40px]">
                                        Ficha
                                    </button>
                                    <button type="button" onclick="event.stopPropagation(); addToCartCT('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" aria-label="Agregar ${title} al carrito" class="btn-action bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase min-h-[40px]">
                                        + Carrito
                                    </button>
                                    <button type="button" onclick="event.stopPropagation(); buyNowCT('${sku}');" aria-label="Comprar ${title} ahora" class="btn-action bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow min-h-[40px]">
                                        ⚡ Comprar
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            box.classList.remove("hidden");
        }, 100);
    });

    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !box.contains(e.target)) {
            box.classList.add("hidden");
        }
    });
}

window.executeSearchQuery = function(query) {
    activeSearchQuery = (query || '').trim();
    activeSelectedCategory = 'Todas';
    activeSelectedBrand = 'Todas';
    currentPageNumber = 1;
    renderSidebarFacets();
    renderExactCatalogView();
    
    const box = document.getElementById("boutique-autocomplete-box");
    if (box) box.classList.add("hidden");
    
    const target = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// =========================================================================
// CARRITO GLOBAL PERSISTENTE Y COMPRA INMEDIATA
// =========================================================================

function getBoutiqueCart() {
    try {
        return JSON.parse(localStorage.getItem('ecosystem_global_cart')) || [];
    } catch(e) { return []; }
}

function saveBoutiqueCart(cart) {
    localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
    syncBoutiqueCart();
}

function syncBoutiqueCart() {
    const cart = getBoutiqueCart();
    const badge = document.getElementById("boutique-cart-badge");
    const totalTxt = document.getElementById("boutique-cart-total");
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

    if (badge) badge.innerText = count;
    if (totalTxt) totalTxt.innerText = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
}

window.addToCartCT = function(sku) {
    const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const p = catalog.find(item => item.sku === sku || item.clave === sku);
    if (!p) return;

    const cart = getBoutiqueCart();
    const existing = cart.find(item => item.sku === sku);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        const cat = p.categoria_clasificada || 'accesorios_perifericos';
        const price = p.precio_mxn || p.precio || 0;
        cart.push({
            sku: sku,
            name: p.nombre || p.descripcion_completa,
            price: price,
            store: 'pc-custom-lab',
            storeName: 'PC Custom Lab',
            image: `./assets/img/catalog/${cat}/${sku}.jpg`,
            cdn_url: `https://static.ctonline.mx/imagenes/${sku}/${sku}_800.jpg`,
            quantity: 1
        });
    }

    saveBoutiqueCart(cart);
    showAddToCartToast(p.nombre || p.descripcion_completa || "Producto");
};

window.buyNowCT = function(sku) {
    const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const p = catalog.find(item => item.sku === sku || item.clave === sku);
    if (!p) {
        window.location.href = "checkout.html";
        return;
    }

    const cart = getBoutiqueCart();
    const existing = cart.find(item => item.sku === sku);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        const cat = p.categoria_clasificada || 'accesorios_perifericos';
        const price = p.precio_mxn || p.precio || 0;
        cart.push({
            sku: sku,
            name: p.nombre || p.descripcion_completa,
            price: price,
            store: 'pc-custom-lab',
            storeName: 'PC Custom Lab',
            image: `./assets/img/catalog/${cat}/${sku}.jpg`,
            cdn_url: `https://static.ctonline.mx/imagenes/${sku}/${sku}_800.jpg`,
            quantity: 1
        });
    }

    saveBoutiqueCart(cart);
    window.location.href = "checkout.html";
};

function showAddToCartToast(productTitle) {
    let toast = document.getElementById("cart-notification-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cart-notification-toast";
        toast.className = "fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 border-2 border-emerald-500/80 p-4 rounded-2xl shadow-2xl text-white transform transition-all duration-300 ease-out";
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">¡Agregado al Carrito!</div>
                    <div class="text-xs text-slate-200 font-bold truncate">${productTitle}</div>
                </div>
            </div>
            <div class="flex gap-2 pt-1 border-t border-slate-800">
                <button onclick="window.scrollToDepartments(); this.closest('#cart-notification-toast').classList.add('hidden');" class="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] font-bold py-2 px-2.5 rounded-xl border border-cyan-500/40 cursor-pointer min-h-[44px]">
                    <i class="fa-solid fa-layer-group"></i> Más Productos
                </button>
                <a href="checkout.html" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-black py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer min-h-[44px]">
                    <i class="fa-solid fa-cart-shopping"></i> Ir a Pagar
                </a>
            </div>
        </div>
    `;
    toast.classList.remove("hidden");
    setTimeout(() => {
        if (toast) toast.classList.add("hidden");
    }, 6000);
}

// Modal Ficha Técnica (PDP)
window.openProductDetailModal = function(sku) {
    const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const p = catalog.find(item => item.sku === sku || item.clave === sku);
    if (!p) return;

    const modal = document.getElementById("productDetailModal");
    const content = document.getElementById("productDetailModalContent");
    if (!modal || !content) return;

    const cat = p.categoria_clasificada || 'accesorios_perifericos';
    const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;");
    const desc = (p.descripcion_completa || p.nombre || '').replace(/'/g, "&#39;");
    const price = p.precio_mxn || p.precio || 0;
    const original = p.precio_original || (price * 1.33);
    const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
    const localImg = `assets/img/${sku}.webp`;
    const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_full.jpg`;
    const cdnImg400 = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
    const cdnThumb = `https://static.ctonline.mx/img/Thumbs/${sku}_100.jpg`;
    const cdnCloudfront = `https://d22k14p2jfj20i.cloudfront.net/items/${sku}.jpg`;
    const placeholder = getPlaceholderForCat(cat);

    content.innerHTML = `
        <div class="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <i class="fa-solid fa-circle-info mr-1"></i> Ficha Técnica Oficial PC Custom Lab
            </span>
            <button onclick="closeProductDetailModal()" aria-label="Cerrar modal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer min-h-[44px]">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="w-full aspect-square bg-slate-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800">
                <img src="${localImg}" alt="${title}" width="400" height="400" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${sku}', '${cat}')" />
            </div>

            <div class="flex flex-col justify-between space-y-4">
                <div>
                    <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                        ${cat.replace(/_/g, ' ')} • SKU: ${sku}
                    </span>
                    <h2 class="text-base sm:text-lg font-bold text-white leading-snug mb-2">${title}</h2>
                    <p class="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">${desc}</p>
                </div>

                <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div class="flex items-baseline justify-between">
                        <div>
                            <span class="text-xs text-slate-500 line-through font-mono block">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-xl font-black text-emerald-400 font-mono">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</div>
                        </div>
                        <span class="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
                            Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div class="text-[11px] font-mono text-slate-400 space-y-1">
                        <div><i class="fa-solid fa-shield-check text-emerald-400 mr-1"></i> Garantía 48h Directa / 1 Año Fabricante</div>
                        <div><i class="fa-solid fa-location-dot text-cyan-400 mr-1"></i> Entrega Inmediata en Pedro Moreno 501 A</div>
                    </div>

                    <div class="flex gap-2 pt-2">
                        <button onclick="addToCartCT('${sku}'); closeProductDetailModal();" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition cursor-pointer min-h-[44px]">
                            <i class="fa-solid fa-cart-plus"></i> <span>+ Carrito</span>
                        </button>
                        <button onclick="buyNowCT('${sku}');" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition cursor-pointer min-h-[44px]">
                            <i class="fa-solid fa-bolt"></i> <span>Comprar Ahora</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");
};

window.closeProductDetailModal = function() {
    const modal = document.getElementById("productDetailModal");
    if (modal) modal.classList.add("hidden");
};
