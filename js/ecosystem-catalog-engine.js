// =========================================================================
// MOTOR UNIVERSAL DE CATÁLOGO MULTI-VISTA (GRID/LIST), PAGINACIÓN DUAL (ARRIBA/ABAJO)
// Y NAVEGACIÓN RESPONSIVA PARA EL ECOSISTEMA BAZAR NFL.GDL (8 SITIOS)
// =========================================================================

let globalViewMode = 'grid'; // 'grid' o 'list'
let globalCardSize = 'normal'; // 'normal' o 'large'
let globalCurrentPage = 1;
const globalItemsPerPage = 20;

let filterCategoryActive = 'Todos';
let filterBrandActive = 'Todas';
let filterMaxBudget = 35000;
let filterStockGdl = false;

// Inicializar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    initUniversalCatalog();
});

function initUniversalCatalog() {
    renderUniversalFilters();
    renderUniversalCatalog();
}

function getActiveCatalogItems() {
    let prods = [];
    if (window.boutiqueProducts && Array.isArray(window.boutiqueProducts) && window.boutiqueProducts.length > 0) {
        prods = window.boutiqueProducts;
    } else if (window.CT_ALL_PRODUCTS && Array.isArray(window.CT_ALL_PRODUCTS)) {
        prods = [...(window.PC_COMBOS || []), ...window.CT_ALL_PRODUCTS];
    } else if (window.UNIFIED_CATALOG && Array.isArray(window.UNIFIED_CATALOG)) {
        window.UNIFIED_CATALOG.forEach(c => {
            if (c.products) prods.push(...c.products);
        });
    }

    // Filtrar por Categoría
    if (filterCategoryActive !== 'Todos') {
        prods = prods.filter(p => {
            const cat = (p.categoria || p.categoria_ct || p.category || '').toLowerCase();
            return cat.includes(filterCategoryActive.toLowerCase());
        });
    }

    // Filtrar por Marca
    if (filterBrandActive !== 'Todas') {
        prods = prods.filter(p => {
            const b = (p.marca || p.brand || '').toUpperCase();
            return b.includes(filterBrandActive.toUpperCase());
        });
    }

    // Filtrar por Presupuesto
    prods = prods.filter(p => {
        const pr = p.precio || p.precio_mxn || p.price || 0;
        return pr <= filterMaxBudget;
    });

    return prods;
}

function setCatalogView(mode) {
    globalViewMode = mode;
    updateViewButtonsUI();
    renderUniversalCatalog();
}

function setCardSize(size) {
    globalCardSize = size;
    updateViewButtonsUI();
    renderUniversalCatalog();
}

function updateViewButtonsUI() {
    document.querySelectorAll(".btn-view-toggle-grid").forEach(el => {
        if (globalViewMode === 'grid') {
            el.className = "px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-1 transition active:scale-95 cursor-pointer btn-view-toggle-grid";
        } else {
            el.className = "px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer btn-view-toggle-grid";
        }
    });

    document.querySelectorAll(".btn-view-toggle-list").forEach(el => {
        if (globalViewMode === 'list') {
            el.className = "px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-1 transition active:scale-95 cursor-pointer btn-view-toggle-list";
        } else {
            el.className = "px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer btn-view-toggle-list";
        }
    });

    document.querySelectorAll(".btn-size-normal").forEach(el => {
        if (globalCardSize === 'normal') {
            el.className = "px-2 py-1 rounded-lg bg-slate-800 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/40 btn-size-normal";
        } else {
            el.className = "px-2 py-1 rounded-lg bg-slate-950 text-slate-400 font-mono text-[10px] hover:text-white btn-size-normal";
        }
    });

    document.querySelectorAll(".btn-size-large").forEach(el => {
        if (globalCardSize === 'large') {
            el.className = "px-2 py-1 rounded-lg bg-slate-800 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/40 btn-size-large";
        } else {
            el.className = "px-2 py-1 rounded-lg bg-slate-950 text-slate-400 font-mono text-[10px] hover:text-white btn-size-large";
        }
    });
}

function onBudgetSliderInput(e) {
    filterMaxBudget = parseFloat(e.target.value);
    document.querySelectorAll(".budget-slider-val").forEach(el => {
        el.innerText = `$${filterMaxBudget.toLocaleString('es-MX')} MXN`;
    });
    globalCurrentPage = 1;
    renderUniversalCatalog();
}

function selectCategoryFilter(cat) {
    filterCategoryActive = cat;
    globalCurrentPage = 1;
    renderUniversalFilters();
    renderUniversalCatalog();
    scrollToProducts();
}

function selectBrandFilter(brand) {
    filterBrandActive = brand;
    globalCurrentPage = 1;
    renderUniversalFilters();
    renderUniversalCatalog();
    scrollToProducts();
}

function resetCatalogFilters() {
    filterCategoryActive = 'Todos';
    filterBrandActive = 'Todas';
    filterMaxBudget = 35000;
    filterStockGdl = false;
    globalCurrentPage = 1;
    
    document.querySelectorAll(".budget-slider-input").forEach(el => el.value = 35000);
    document.querySelectorAll(".budget-slider-val").forEach(el => el.innerText = `$35,000 MXN`);
    document.querySelectorAll(".chk-gdl-stock").forEach(el => el.checked = false);

    renderUniversalFilters();
    renderUniversalCatalog();
}

function scrollToProducts() {
    const el = document.getElementById("section-title") || document.getElementById("catalog-top-bar") || document.getElementById("products-grid-container");
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderUniversalCatalog() {
    const container = document.getElementById("products-grid-container");
    if (!container) return;

    const items = getActiveCatalogItems();
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / globalItemsPerPage) || 1;

    if (globalCurrentPage > totalPages) globalCurrentPage = totalPages;
    const startIdx = (globalCurrentPage - 1) * globalItemsPerPage;
    const pageItems = items.slice(startIdx, startIdx + globalItemsPerPage);

    // Actualizar contadores
    document.querySelectorAll(".results-count-text").forEach(el => {
        el.innerText = `Mostrando ${startIdx + 1} - ${Math.min(startIdx + globalItemsPerPage, totalItems)} de ${totalItems} Productos`;
    });

    // Renderizar Paginación DUAL (Arriba y Abajo) con formato 1..7 ... N
    renderDualPagination(totalPages);

    if (pageItems.length === 0) {
        container.className = "col-span-full py-16 text-center text-slate-400 font-mono text-sm";
        container.innerHTML = `
            <i class="fa-solid fa-filter-circle-xmark text-4xl text-cyan-400 mb-3 block"></i>
            No se encontraron productos con los filtros seleccionados.
            <br><button onclick="resetCatalogFilters()" class="mt-4 bg-cyan-500 text-slate-950 font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer">Restablecer Filtros</button>
        `;
        return;
    }

    if (globalViewMode === 'grid') {
        // VISTA CUADRÍCULA (5 Columnas en Pantalla Grande / TV / PC, 2 Columnas en Celular)
        const gridCols = (globalCardSize === 'large') 
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4" 
            : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 pb-4";
        
        container.className = gridCols;
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku || p.id || 'SKU';
            const title = (p.nombre || p.model || p.title || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio || p.precio_mxn || p.price || 0;
            const original = p.original || p.precio_original || (price * 1.28);
            const img = p.local_img || p.img || p.image || `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const marca = p.marca || p.brand || 'Bazar';
            const desc = (p.desc || p.descripcion_completa || '').slice(0, 70);

            return `
                <div class="bg-slate-950/90 hover:bg-slate-900/90 rounded-2xl p-3 flex flex-col justify-between transition group shadow-xl hover:shadow-[0_8px_30px_rgba(6,182,212,0.25)] border border-slate-800/80 hover:border-cyan-500/50 relative overflow-hidden">
                    <div>
                        <div class="w-full h-32 sm:h-36 overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center p-2 relative mb-2 shadow-inner border border-slate-800/50">
                            <img 
                                src="${img}" 
                                alt="${title}" 
                                width="180" 
                                height="180" 
                                loading="lazy" 
                                decoding="async" 
                                class="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                                onerror="this.onerror=null; this.src='https://iaworldcenter-creator.github.io/pc-custom-lab/assets/img/mascota_tigre_thumb.webp';"
                            />
                            <span class="absolute top-1.5 left-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[8px] font-mono font-black px-1.5 py-0.5 rounded shadow uppercase truncate max-w-[80px]">
                                ${marca}
                            </span>
                            <span class="absolute top-1.5 right-1.5 text-[8px] font-mono text-emerald-400 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                                <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> Stock GDL
                            </span>
                        </div>

                        <div class="flex justify-between items-center text-[9px] font-mono mb-1">
                            <span class="text-cyan-400 font-bold uppercase truncate">${marca}</span>
                            <span class="text-slate-400 font-bold">${sku}</span>
                        </div>

                        <h4 class="text-white font-bold text-xs mb-1 line-clamp-2 leading-snug group-hover:text-cyan-300 transition" title="${title}">${title}</h4>
                        <p class="text-slate-400 text-[10px] leading-relaxed line-clamp-2 mb-2 font-normal">${desc}...</p>
                    </div>

                    <div>
                        <div class="mb-1.5 flex items-center justify-between">
                            <span class="text-[8px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                Mayoreo 10+ pzs (-5%)
                            </span>
                        </div>

                        <div class="pt-1.5 border-t border-slate-900 mb-2 flex flex-col gap-0.5">
                            <div class="flex items-center justify-between gap-1 text-[10px] font-mono">
                                <span class="text-slate-400 font-bold uppercase text-[8px]">Antes:</span>
                                <span class="text-red-400 font-bold line-through bg-red-950/50 border border-red-500/40 px-1 py-0.2 rounded">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div class="flex items-baseline justify-between">
                                <span class="text-[9px] font-mono text-emerald-400 font-bold uppercase">Contado:</span>
                                <span class="text-sm sm:text-base font-black font-mono text-amber-400">
                                    $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span class="text-[9px] text-amber-300/80 font-normal">MXN</span>
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-1.5">
                            <button 
                                onclick="addToCartUniversal('${sku}', '${title}', ${price}, '${img}')" 
                                aria-label="Terminar Compra ${sku}" 
                                class="bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold py-1.5 px-1 rounded-xl text-[9px] flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow border border-cyan-500/30 truncate" 
                                title="Agregar a la canasta"
                            >
                                <i class="fa-solid fa-cart-plus text-[9px]"></i> <span>Terminar Compra</span>
                            </button>
                            <button 
                                onclick="buyNowUniversal('${sku}', '${title}', ${price}, '${img}')" 
                                aria-label="Pagar ${sku} Ahora" 
                                class="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black py-1.5 px-1 rounded-xl text-[9px] flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer uppercase tracking-wider truncate" 
                                title="Pagar Ahora Directamente"
                            >
                                <i class="fa-solid fa-bolt text-[9px]"></i> <span>Pagar Ahora</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // VISTA LISTADO HORIZONTAL DETALLADO (Línea por Línea con Ficha Técnica Extendida)
        container.className = "flex flex-col gap-3 pb-4";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku || p.id || 'SKU';
            const title = (p.nombre || p.model || p.title || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio || p.precio_mxn || p.price || 0;
            const original = p.original || p.precio_original || (price * 1.28);
            const img = p.local_img || p.img || p.image || `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const marca = p.marca || p.brand || 'Bazar';
            const desc = p.descripcion_completa || p.desc || '';

            return `
                <div class="bg-slate-950/90 hover:bg-slate-900/90 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-xl border border-slate-800/80 hover:border-cyan-500/50">
                    <div class="w-full md:w-36 h-32 md:h-28 overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center p-2 relative shadow-inner shrink-0 border border-slate-800">
                        <img 
                            src="${img}" 
                            alt="${title}" 
                            width="140" 
                            height="140" 
                            loading="lazy" 
                            decoding="async" 
                            class="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                            onerror="this.onerror=null; this.src='https://iaworldcenter-creator.github.io/pc-custom-lab/assets/img/mascota_tigre_thumb.webp';"
                        />
                        <span class="absolute top-1 left-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase">
                            ${marca}
                        </span>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 text-[10px] font-mono mb-1">
                            <span class="text-cyan-400 font-bold uppercase">${marca}</span>
                            <span class="text-slate-500">•</span>
                            <span class="text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">SKU: ${sku}</span>
                            <span class="text-emerald-400 font-bold ml-auto hidden sm:inline"><i class="fa-solid fa-check-circle"></i> En Existencia Guadalajara</span>
                        </div>
                        <h4 class="text-white font-bold text-sm mb-1.5 group-hover:text-cyan-300 transition leading-snug">${title}</h4>
                        <p class="text-slate-400 text-xs leading-relaxed font-normal">${desc}</p>
                        
                        <div class="mt-2 flex items-center gap-2 flex-wrap">
                            <span class="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                                🏷️ Precio de Mayoreo a partir de 10 piezas (-5%)
                            </span>
                            <span class="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                                🛡️ Garantía Física 48h Pedro Moreno 501 A
                            </span>
                        </div>
                    </div>

                    <div class="w-full md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4 shrink-0">
                        <div class="text-right w-full mb-3">
                            <span class="text-[10px] font-mono text-slate-400 block line-through">Antes: $${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-lg sm:text-xl font-black font-mono text-amber-400">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span class="text-xs text-amber-300 font-normal">MXN</span>
                            </div>
                            <span class="text-[9px] font-mono text-emerald-400 block uppercase">IVA Incluido / Factura</span>
                        </div>

                        <div class="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                            <button 
                                onclick="addToCartUniversal('${sku}', '${title}', ${price}, '${img}')" 
                                class="w-full bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-cyan-500/40 transition active:scale-95 shadow cursor-pointer"
                            >
                                <i class="fa-solid fa-cart-plus text-xs"></i> <span>Terminar Compra</span>
                            </button>
                            <button 
                                onclick="buyNowUniversal('${sku}', '${title}', ${price}, '${img}')" 
                                class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-mono font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-wider transition active:scale-95 shadow cursor-pointer"
                            >
                                <i class="fa-solid fa-bolt text-xs"></i> <span>Pagar Ahora</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// RENDERIZADO DUAL DE PAGINACIÓN (ARRIBA Y ABAJO CON FORMATO 1..7 ... N)
function renderDualPagination(totalPages) {
    const containers = document.querySelectorAll(".pagination-controls-container");
    if (!containers || containers.length === 0) return;

    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (globalCurrentPage <= 4) {
            pages = [1, 2, 3, 4, 5, 6, 7, '...', totalPages];
        } else if (globalCurrentPage >= totalPages - 4) {
            pages = [1, '...', totalPages - 6, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', globalCurrentPage - 2, globalCurrentPage - 1, globalCurrentPage, globalCurrentPage + 1, globalCurrentPage + 2, '...', totalPages];
        }
    }

    const htmlPages = pages.map(p => {
        if (p === '...') {
            return `<span class="px-1.5 sm:px-2 text-slate-600 font-mono font-bold text-xs">...</span>`;
        }
        const isAct = (p === globalCurrentPage);
        const cls = isAct ? "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 border-cyan-400 scale-110" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800";
        return `<button onclick="goCatalogPage(${p})" class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition border cursor-pointer ${cls}">${p}</button>`;
    }).join('');

    containers.forEach(box => {
        box.innerHTML = `
            <div class="flex items-center justify-between gap-2 sm:gap-4 w-full flex-wrap">
                <button 
                    onclick="goCatalogPage(${globalCurrentPage - 1})" 
                    ${globalCurrentPage <= 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-800 hover:text-white"'}
                    class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 font-mono font-bold text-xs border border-slate-800 flex items-center gap-1.5 transition active:scale-95"
                >
                    <i class="fa-solid fa-chevron-left text-[10px]"></i> <span class="hidden sm:inline">Anterior</span>
                </button>

                <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                    ${htmlPages}
                </div>

                <button 
                    onclick="goCatalogPage(${globalCurrentPage + 1})" 
                    ${globalCurrentPage >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-800 hover:text-white"'}
                    class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 font-mono font-bold text-xs border border-slate-800 flex items-center gap-1.5 transition active:scale-95"
                >
                    <span class="hidden sm:inline">Siguiente</span> <i class="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
            </div>
        `;
    });
}

function goCatalogPage(p) {
    const items = getActiveCatalogItems();
    const totalPages = Math.ceil(items.length / globalItemsPerPage) || 1;
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    globalCurrentPage = p;
    renderUniversalCatalog();
    scrollToProducts();
}

// RENDERIZADO DE FILTROS LATERALES UNIFORMES
function renderUniversalFilters() {
    const root = document.getElementById("boutique-sidebar-root");
    if (!root) return;

    root.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h2 class="font-mono text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-sliders text-cyan-400"></i> Filtros de Búsqueda
            </h2>
            <button onclick="resetCatalogFilters()" class="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold uppercase transition cursor-pointer">
                <i class="fa-solid fa-rotate-left"></i> Limpiar
            </button>
        </div>

        <!-- CONTROL DE PRESUPUESTO PRICE SLIDER -->
        <div class="mb-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-[10px] font-mono text-slate-300 font-bold uppercase">Presupuesto Máx:</span>
                <span class="budget-slider-val text-xs font-mono font-black text-amber-400">$${filterMaxBudget.toLocaleString('es-MX')} MXN</span>
            </div>
            <input 
                type="range" 
                min="500" 
                max="35000" 
                step="500" 
                value="${filterMaxBudget}" 
                class="budget-slider-input w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg" 
                oninput="onBudgetSliderInput(event)" 
            />
            <div class="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                <span>$500 MXN</span>
                <span>$35,000 MXN</span>
            </div>
        </div>

        <!-- FILTRO STOCK GUADALAJARA -->
        <div class="mb-4 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <label class="flex items-center gap-2 text-xs text-slate-300 font-bold cursor-pointer">
                <input type="checkbox" class="chk-gdl-stock w-4 h-4 rounded accent-emerald-500 cursor-pointer" onchange="filterStockGdl = this.checked; globalCurrentPage=1; renderUniversalCatalog();" />
                <span class="flex items-center gap-1 text-[11px]">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Entrega Hoy Guadalajara (Pedro Moreno 501 A)
                </span>
            </label>
        </div>

        <!-- CATEGORÍAS -->
        <div class="mb-4">
            <h3 class="text-[11px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="fa-solid fa-layer-group text-amber-400"></i> Departamentos
            </h3>
            <div class="flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar">
                ${['Todos', 'Tarjetas Madre', 'Procesadores', 'Tarjetas de Video', 'Memorias RAM', 'Almacenamiento', 'Fuentes de Poder', 'Gabinetes', 'Equipos Armados'].map(cat => `
                    <button 
                        onclick="selectCategoryFilter('${cat}')" 
                        class="w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex justify-between items-center ${filterCategoryActive === cat ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}"
                    >
                        <span>${cat}</span>
                        <i class="fa-solid fa-chevron-right text-[9px] opacity-70"></i>
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- MARCAS -->
        <div class="mb-3">
            <h3 class="text-[11px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="fa-solid fa-tags text-cyan-400"></i> Marcas
            </h3>
            <div class="flex flex-wrap gap-1.5">
                ${['Todas', 'ASUS', 'INTEL', 'AMD', 'KINGSTON', 'MSI', 'GIGABYTE', 'ACTECK', 'TRIPP-LITE'].map(b => `
                    <button 
                        onclick="selectBrandFilter('${b}')" 
                        class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition border ${filterBrandActive === b ? 'bg-amber-500/20 text-amber-300 border-amber-500/60' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'}"
                    >
                        ${b}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Funciones globales de Carrito y Pago
window.addToCartUniversal = function(sku, title, price, img) {
    let cart = JSON.parse(localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items') || '[]');
    const existing = cart.find(i => i.sku === sku);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
        existing.qty = existing.quantity;
    } else {
        cart.push({
            sku: sku,
            nombre: title,
            title: title,
            precio: price,
            price: price,
            quantity: 1,
            qty: 1,
            imagen: img,
            image: img
        });
    }
    localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
    localStorage.setItem('cart_items', JSON.stringify(cart));
    if (typeof syncBoutiqueCart === 'function') syncBoutiqueCart();
    alert(`🛒 ¡${title} se agregó a tu canasta!`);
};

window.buyNowUniversal = function(sku, title, price, img) {
    window.addToCartUniversal(sku, title, price, img);
    window.location.href = "checkout.html";
};
