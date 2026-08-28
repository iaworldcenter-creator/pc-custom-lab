// =========================================================================
// MOTOR UNIVERSAL DE CATÁLOGO: FORMATO EXACTO CT ONLINE (GRID & LIST VIEW)
// =========================================================================

let globalViewMode = 'grid'; // 'grid' o 'list'
let globalCurrentPage = 1;
const globalItemsPerPage = 20;

let filterCategoryActive = 'Todos';
let filterBrandActive = 'Todas';
let filterMaxBudget = 35000;
let filterStockGdl = false;
let currentSortOrder = 'existencia';

document.addEventListener("DOMContentLoaded", () => {
    initUniversalCatalog();
});

function initUniversalCatalog() {
    renderUniversalFilters();
    renderUniversalCatalog();
}

function onSortChange(e) {
    currentSortOrder = e.target.value;
    renderUniversalCatalog();
}

function getActiveCatalogItems() {
    let prods = [];
    if (window.boutiqueProducts && Array.isArray(window.boutiqueProducts) && window.boutiqueProducts.length > 0) {
        prods = [...window.boutiqueProducts];
    } else if (window.CT_ALL_PRODUCTS && Array.isArray(window.CT_ALL_PRODUCTS)) {
        prods = [...(window.PC_COMBOS || []), ...window.CT_ALL_PRODUCTS];
    } else if (window.UNIFIED_CATALOG && Array.isArray(window.UNIFIED_CATALOG)) {
        window.UNIFIED_CATALOG.forEach(c => {
            if (c.products) prods.push(...c.products);
        });
    }

    // Filtro Categoría
    if (filterCategoryActive !== 'Todos') {
        prods = prods.filter(p => {
            const cat = (p.categoria || p.categoria_ct || p.category || '').toLowerCase();
            return cat.includes(filterCategoryActive.toLowerCase());
        });
    }

    // Filtro Marca
    if (filterBrandActive !== 'Todas') {
        prods = prods.filter(p => {
            const b = (p.marca || p.brand || '').toUpperCase();
            return b.includes(filterBrandActive.toUpperCase());
        });
    }

    // Filtro Presupuesto
    prods = prods.filter(p => {
        const pr = p.precio || p.precio_mxn || p.price || 0;
        return pr <= filterMaxBudget;
    });

    // Ordenamiento
    if (currentSortOrder === 'precio_asc') {
        prods.sort((a, b) => (a.precio || a.precio_mxn || 0) - (b.precio || b.precio_mxn || 0));
    } else if (currentSortOrder === 'precio_desc') {
        prods.sort((a, b) => (b.precio || b.precio_mxn || 0) - (a.precio || a.precio_mxn || 0));
    } else if (currentSortOrder === 'nombre') {
        prods.sort((a, b) => (a.nombre || a.title || '').localeCompare(b.nombre || b.title || ''));
    }

    return prods;
}

function setCatalogView(mode) {
    globalViewMode = mode;
    updateViewButtonsUI();
    renderUniversalCatalog();
}

function updateViewButtonsUI() {
    document.querySelectorAll(".btn-view-toggle-grid").forEach(el => {
        if (globalViewMode === 'grid') {
            el.className = "btn-view-toggle-grid p-2 rounded-lg bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 transition cursor-pointer";
        } else {
            el.className = "btn-view-toggle-grid p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer";
        }
    });

    document.querySelectorAll(".btn-view-toggle-list").forEach(el => {
        if (globalViewMode === 'list') {
            el.className = "btn-view-toggle-list p-2 rounded-lg bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30 transition cursor-pointer";
        } else {
            el.className = "btn-view-toggle-list p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer";
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
    const el = document.getElementById("section-title") || document.getElementById("products-grid-container");
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

    document.querySelectorAll(".results-count-text").forEach(el => {
        el.innerText = `Mostrando ${startIdx + 1} - ${Math.min(startIdx + globalItemsPerPage, totalItems)} de ${totalItems} Productos`;
    });

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
        // ==========================================
        // VISTA CUADRÍCULA / GRUPOS (IMAGEN 2 DE REFERENCIA)
        // 5 columnas en PC/TV, 2 columnas en Móvil
        // ==========================================
        container.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 pb-2";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku || p.id || 'SKU';
            const title = (p.nombre || p.model || p.title || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio || p.precio_mxn || p.price || 0;
            const original = p.original || p.precio_original || (price * 1.28);
            const usdPrice = (price / 19.50).toFixed(2);
            const img = p.local_img || p.img || p.image || `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const marca = p.marca || p.brand || 'CT';

            return `
                <div class="bg-slate-950/90 hover:bg-slate-900/95 rounded-2xl p-3 flex flex-col justify-between transition group shadow-xl hover:shadow-[0_8px_30px_rgba(6,182,212,0.25)] border border-slate-800/80 hover:border-cyan-500/50 relative overflow-hidden">
                    <!-- Badge Diagonal de Promoción en esquina izquierda -->
                    <div class="absolute -top-6 -left-6 w-16 h-16 bg-red-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow z-10">
                        <span class="text-[8px] font-mono font-black text-white uppercase tracking-tighter">PROMO</span>
                    </div>

                    <!-- Corazón de Favoritos -->
                    <button class="absolute top-2 right-2 text-slate-500 hover:text-red-500 transition text-xs z-10 cursor-pointer" title="Guardar en Favoritos">
                        <i class="fa-regular fa-heart"></i>
                    </button>

                    <div>
                        <!-- Foto centrada -->
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
                        </div>

                        <!-- Precios Grandes en Verde/Ámbar -->
                        <div class="text-center mb-1">
                            <span class="text-xs sm:text-sm font-black font-mono text-emerald-400 block">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <span class="text-[9px] font-mono text-slate-500 line-through">
                                $${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                        </div>

                        <div class="text-center text-[8px] font-mono text-cyan-400 font-bold mb-1 flex items-center justify-center gap-1">
                            <i class="fa-solid fa-cloud-arrow-down"></i> Entrega Digital / Express
                        </div>

                        <!-- Título y Clave CT -->
                        <h4 class="text-white text-xs font-bold text-center line-clamp-2 leading-snug group-hover:text-cyan-300 transition mb-1" title="${title}">
                            ${title}
                        </h4>

                        <div class="text-center text-[9px] font-mono text-slate-400 mb-2">
                            <span>SKU: ${sku}</span>
                        </div>
                    </div>

                    <!-- Botón Azul Comprar / Terminar Compra -->
                    <div class="pt-1">
                        <button 
                            onclick="buyNowUniversal('${sku}', '${title}', ${price}, '${img}')" 
                            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold py-1.5 px-2 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow cursor-pointer"
                        >
                            <i class="fa-solid fa-cart-shopping text-[10px]"></i> <span>Comprar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // ==========================================
        // VISTA LISTADO HORIZONTAL (IMAGEN 1 DE REFERENCIA)
        // Fila extendida de izquierda a derecha
        // ==========================================
        container.className = "flex flex-col gap-3 pb-2";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku || p.id || 'SKU';
            const title = (p.nombre || p.model || p.title || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio || p.precio_mxn || p.price || 0;
            const original = p.original || p.precio_original || (price * 1.28);
            const usdPrice = (price / 19.50).toFixed(2);
            const img = p.local_img || p.img || p.image || `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const marca = p.marca || p.brand || 'CT';
            const desc = p.descripcion_completa || p.desc || '';

            return `
                <div class="bg-slate-950/90 hover:bg-slate-900/95 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-xl border border-slate-800/80 hover:border-cyan-500/50 relative overflow-hidden">
                    <!-- Badge Diagonal Promo -->
                    <div class="absolute -top-5 -left-5 w-14 h-14 bg-red-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow z-10">
                        <span class="text-[7px] font-mono font-black text-white uppercase">PROMO</span>
                    </div>

                    <!-- Miniatura Izquierda -->
                    <div class="w-full md:w-36 h-28 overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center p-2 relative shadow-inner shrink-0 border border-slate-800">
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
                    </div>

                    <!-- Información Central -->
                    <div class="flex-1 min-w-0">
                        <h4 class="text-white font-bold text-sm mb-1 group-hover:text-cyan-300 transition leading-snug">${title}</h4>
                        <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1">
                            <span class="text-cyan-400 font-bold uppercase">${marca}</span>
                            <span>•</span>
                            <span>SKU: ${sku}</span>
                            <span>•</span>
                            <span>Clave CT: ${sku}</span>
                        </div>
                        
                        <!-- Calificación Estrellas -->
                        <div class="flex items-center gap-1 text-red-500 text-xs mb-1.5">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </div>

                        <p class="text-slate-400 text-xs leading-relaxed line-clamp-2 font-normal">${desc}</p>
                    </div>

                    <!-- Precios y Botón de Compra Derecha -->
                    <div class="w-full md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4 shrink-0">
                        <div class="text-right w-full mb-2">
                            <span class="text-[9px] font-mono text-cyan-400 font-bold uppercase block"><i class="fa-solid fa-cloud-arrow-down"></i> Entrega Express</span>
                            <span class="text-[10px] font-mono text-slate-500 line-through block">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-base sm:text-lg font-black font-mono text-emerald-400 leading-tight">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </div>
                            <span class="text-[9px] font-mono text-slate-400 block">$${usdPrice} USD</span>
                        </div>

                        <div class="flex items-center gap-2 w-full">
                            <button class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 transition cursor-pointer" title="Favoritos">
                                <i class="fa-regular fa-heart"></i>
                            </button>
                            <button 
                                onclick="addToCartUniversal('${sku}', '${title}', ${price}, '${img}')" 
                                class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow cursor-pointer uppercase tracking-wider"
                            >
                                <i class="fa-solid fa-cart-plus text-xs"></i> <span>Agregar al carrito</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// PAGINACIÓN DUAL IDÉNTICA A LA REFERENCIA (1 2 3 4 5 6 7 ... N)
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
            return `<span class="px-1 text-slate-500 font-mono text-xs">...</span>`;
        }
        const isAct = (p === globalCurrentPage);
        const cls = isAct ? "bg-blue-600 text-white font-bold border-blue-500" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800";
        return `<button onclick="goCatalogPage(${p})" class="w-6 h-6 sm:w-7 sm:h-7 rounded text-xs font-mono border transition flex items-center justify-center cursor-pointer ${cls}">${p}</button>`;
    }).join('');

    containers.forEach(box => {
        box.innerHTML = `
            <div class="flex items-center gap-1">
                <button onclick="goCatalogPage(${globalCurrentPage - 1})" ${globalCurrentPage <= 1 ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:text-white"'} class="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-left text-[9px]"></i>
                </button>
                ${htmlPages}
                <button onclick="goCatalogPage(${globalCurrentPage + 1})" ${globalCurrentPage >= totalPages ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:text-white"'} class="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-right text-[9px]"></i>
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

// BARRA LATERAL CON DISEÑO EXACTO DE LA IMAGEN 1/2
function renderUniversalFilters() {
    const root = document.getElementById("boutique-sidebar-root");
    if (!root) return;

    root.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h2 class="font-mono text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-sliders text-cyan-400"></i> Filtros de Búsqueda
            </h2>
        </div>

        <div class="flex gap-2 mb-4">
            <button onclick="renderUniversalCatalog()" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer">
                Aplicar Filtros
            </button>
            <button onclick="resetCatalogFilters()" class="flex-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer">
                Limpiar Filtros
            </button>
        </div>

        <!-- PROMOCIONES -->
        <div class="mb-4">
            <h3 class="text-[11px] font-mono font-bold text-slate-300 uppercase mb-2">Promociones</h3>
            <div class="flex flex-col gap-1 text-xs text-slate-400">
                <label class="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input type="checkbox" checked class="w-3.5 h-3.5 accent-blue-600 cursor-pointer" /> Promociones
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input type="checkbox" class="w-3.5 h-3.5 accent-blue-600 cursor-pointer" /> Nuevos
                </label>
            </div>
        </div>

        <!-- CATEGORÍAS -->
        <div class="mb-4">
            <h3 class="text-[11px] font-mono font-bold text-slate-300 uppercase mb-2">Categorías</h3>
            <div class="flex flex-col gap-1 text-xs text-slate-400 max-h-48 overflow-y-auto no-scrollbar">
                ${['Todos', 'Procesadores', 'Tarjetas Madre', 'Tarjetas de Video', 'Memorias RAM', 'Almacenamiento', 'Fuentes de Poder', 'Gabinetes', 'Equipos Armados'].map(cat => `
                    <label class="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="radio" name="sidebar_cat" ${filterCategoryActive === cat ? 'checked' : ''} onchange="selectCategoryFilter('${cat}')" class="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                        <span>${cat}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <!-- MARCAS -->
        <div class="mb-4">
            <h3 class="text-[11px] font-mono font-bold text-slate-300 uppercase mb-2">Marcas</h3>
            <div class="flex flex-col gap-1 text-xs text-slate-400 max-h-44 overflow-y-auto no-scrollbar">
                ${['Todas', 'ASUS', 'INTEL', 'AMD', 'KINGSTON', 'MSI', 'GIGABYTE', 'ACTECK', 'TRIPP-LITE', 'ADATA', 'CORSAIR'].map(b => `
                    <label class="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="radio" name="sidebar_brand" ${filterBrandActive === b ? 'checked' : ''} onchange="selectBrandFilter('${b}')" class="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                        <span>${b}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <!-- STOCK / SUCURSALES -->
        <div class="mb-4">
            <h3 class="text-[11px] font-mono font-bold text-slate-300 uppercase mb-2">Sucursales</h3>
            <div class="flex flex-col gap-1 text-xs text-slate-400">
                <label class="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input type="checkbox" checked class="w-3.5 h-3.5 accent-blue-600 cursor-pointer" /> Guadalajara (Pedro Moreno 501 A)
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input type="checkbox" class="w-3.5 h-3.5 accent-blue-600 cursor-pointer" /> Envío Nacional Express
                </label>
            </div>
        </div>

        <!-- RANGO DE PRECIO -->
        <div class="mb-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[9px] font-mono text-slate-400 uppercase">Presupuesto Máx:</span>
                <span class="budget-slider-val text-xs font-mono font-black text-amber-400">$${filterMaxBudget.toLocaleString('es-MX')} MXN</span>
            </div>
            <input 
                type="range" 
                min="500" 
                max="35000" 
                step="500" 
                value="${filterMaxBudget}" 
                class="budget-slider-input w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg" 
                oninput="onBudgetSliderInput(event)" 
            />
        </div>
    `;
}

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
