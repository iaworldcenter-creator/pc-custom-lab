// =========================================================================
// MOTOR OFICIAL PC CUSTOM LAB (INDEXACIÓN Y NAVEGACIÓN TOTAL DE 16,139 ITEMS)
// =========================================================================

let currentViewStyle = 'grid'; // 'grid' (5x4) o 'list'
let currentPageNumber = 1;
const productsPerPage = 20; // 5 filas x 4 columnas

let activeSelectedCategory = 'Todas';
let activeSelectedBrand = 'Todas';
let activeSearchQuery = '';
let currentSortCriterion = 'existencia';
let isFullCatalogLoaded = false;

// Inicialización instantánea
function initFullCatalog() {
    if (window.CT_CATALOG_DATA && Array.isArray(window.CT_CATALOG_DATA)) {
        isFullCatalogLoaded = true;
        renderSidebarFacets();
        renderExactCatalogView();
    }
}

// Función global para seleccionar categoría
window.selectCategoryFacet = function(catId) {
    activeSelectedCategory = catId;
    activeSearchQuery = '';
    activeSelectedBrand = 'Todas';
    currentPageNumber = 1;
    
    const searchInput = document.getElementById("boutiqueSearchInput");
    if (searchInput) searchInput.value = '';

    renderSidebarFacets();
    renderExactCatalogView();

    // Auto-scroll fluido al encabezado de la vitrina
    setTimeout(() => {
        const showcaseTarget = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
        if (showcaseTarget) {
            showcaseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 60);
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

function setViewStyle(style) {
    currentViewStyle = style;
    const btnList = document.getElementById("btn-view-list");
    const btnGrid = document.getElementById("btn-view-grid");
    
    if (btnList && btnGrid) {
        if (style === 'list') {
            btnList.className = "p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition cursor-pointer text-xs";
            btnGrid.className = "p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs";
        } else {
            btnGrid.className = "p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition cursor-pointer text-xs";
            btnList.className = "p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs";
        }
    }
    renderExactCatalogView();
}

function getFilteredList() {
    let items = (activeSearchQuery && activeSearchQuery.trim() !== '')
        ? searchCatalogMaster(activeSearchQuery)
        : [...(window.CT_CATALOG_DATA || [])];

    if (activeSelectedCategory !== 'Todas') {
        items = items.filter(p => {
            const catClasif = (p.categoria_clasificada || '').toLowerCase();
            return catClasif === activeSelectedCategory.toLowerCase();
        });

        items.sort((a, b) => (a.sort_priority || 1) - (b.sort_priority || 1));
    }

    if (activeSelectedBrand !== 'Todas') {
        items = items.filter(p => (p.marca || '').toUpperCase() === activeSelectedBrand.toUpperCase());
    }

    if (currentSortCriterion === 'precio_asc') {
        items.sort((a, b) => (a.precio_mxn || a.precio || 0) - (b.precio_mxn || b.precio || 0));
    } else if (currentSortCriterion === 'precio_desc') {
        items.sort((a, b) => (b.precio_mxn || b.precio || 0) - (a.precio_mxn || a.precio || 0));
    } else if (currentSortCriterion === 'nombre') {
        items.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }

    return items;
}

function getPlaceholderForCat(cat) {
    const map = {
        'procesadores': 'cpu_placeholder.jpg',
        'tarjetas_madre': 'mbd_placeholder.jpg',
        'memorias_ram': 'ram_placeholder.jpg',
        'discos_duros': 'ssd_placeholder.jpg',
        'tarjetas_de_video': 'gpu_placeholder.jpg',
        'gabinetes': 'gab_placeholder.jpg',
        'fuentes_energia': 'psu_placeholder.jpg',
        'enfriamiento': 'cooling_placeholder.jpg',
        'reguladores_ups': 'ups_placeholder.jpg',
        'monitores': 'mon_placeholder.jpg',
        'mini_pcs_ia': 'minipc_placeholder.jpg',
        'computadoras_ensambladas': 'pc_placeholder.jpg',
        'laptops': 'lap_placeholder.jpg',
        'all_in_one': 'aio_placeholder.jpg',
        'consumibles': 'toner_placeholder.jpg',
        'impresoras': 'imp_placeholder.jpg',
        'accesorios_perifericos': 'acc_placeholder.jpg',
        'conectividad_redes': 'redes_placeholder.jpg',
        'software': 'sof_placeholder.jpg',
        'telefonia_seguridad': 'cctv_placeholder.jpg',
        'punto_de_venta': 'pos_placeholder.jpg',
        'electronica_consumo': 'elec_placeholder.jpg',
        'linea_blanca': 'lb_placeholder.jpg',
        'outlet_liquidaciones': 'outlet_placeholder.jpg'
    };
    return `./assets/img/placeholders/${map[cat] || 'acc_placeholder.jpg'}`;
}

function renderExactCatalogView() {
    const container = document.getElementById("products-grid-container");
    const resultsCountTxt = document.getElementById("results-count-display");
    if (!container) return;

    const filtered = getFilteredList();
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / productsPerPage) || 1;

    if (currentPageNumber > totalPages) currentPageNumber = 1;

    const startIndex = (currentPageNumber - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, totalCount);
    const currentBatch = filtered.slice(startIndex, endIndex);

    if (resultsCountTxt) {
        if (activeSearchQuery) {
            resultsCountTxt.innerHTML = `Búsqueda: "${activeSearchQuery}" <span class="text-slate-400 font-normal">(${totalCount} resultados)</span>`;
        } else if (activeSelectedCategory !== 'Todas') {
            resultsCountTxt.innerHTML = `${activeSelectedCategory.replace(/_/g, ' ').toUpperCase()} <span class="text-slate-400 font-normal">(${startIndex + 1}-${endIndex} de ${totalCount.toLocaleString('es-MX')})</span>`;
        } else {
            resultsCountTxt.innerHTML = `Aparador Principal <span class="text-slate-400 font-normal">(${startIndex + 1}-${endIndex} de ${totalCount.toLocaleString('es-MX')})</span>`;
        }
    }

    if (totalCount === 0) {
        container.innerHTML = `
            <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-300 space-y-4 my-8">
                <i class="fa-solid fa-box-open text-5xl text-cyan-400"></i>
                <h3 class="text-lg font-bold text-white">No se encontraron productos</h3>
                <p class="text-xs text-slate-400 max-w-md mx-auto">No hay artículos que coincidan con los filtros seleccionados.</p>
                <button onclick="window.resetFacets()" class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition shadow-lg cursor-pointer">
                    Ver Todos los Productos
                </button>
            </div>
        `;
        renderPaginationControls(1);
        renderBottomNavigation();
        return;
    }

    if (currentViewStyle === 'grid') {
        container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4";
        container.innerHTML = currentBatch.map((p) => {
            const sku = p.sku || p.clave;
            const cat = p.categoria_clasificada || 'accesorios_perifericos';
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;");
            const price = p.precio_mxn || p.precio || 0;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const placeholder = getPlaceholderForCat(cat);

            return `
                <article class="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-3.5 flex flex-col justify-between transition group shadow-lg hover:shadow-cyan-500/10">
                    <div>
                        <div class="relative w-full aspect-square bg-slate-950 rounded-xl p-2 mb-3 overflow-hidden flex items-center justify-center cursor-pointer" onclick="openProductDetailModal('${sku}')">
                            <span class="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase font-mono z-10">
                                OFERTA -25%
                            </span>
                            <img src="${localImg}" alt="${title}" width="300" height="300" loading="lazy" decoding="async" class="w-full h-full object-contain group-hover:scale-105 transition duration-300" onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }" />
                        </div>
                        
                        <div class="text-[10px] font-mono text-cyan-400 font-bold mb-1 uppercase tracking-wider truncate">
                            ${cat.replace(/_/g, ' ')}
                        </div>
                        <h3 onclick="openProductDetailModal('${sku}')" class="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition line-clamp-2 leading-snug cursor-pointer mb-2">
                            ${title}
                        </h3>
                    </div>

                    <div class="pt-2 border-t border-slate-800/80 space-y-2">
                        <div class="flex items-baseline justify-between">
                            <div>
                                <span class="text-[10px] text-slate-500 line-through font-mono block">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                <div class="text-sm font-black text-emerald-400 font-mono">
                                    $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                </div>
                            </div>
                            <span class="text-[9px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                                May: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div class="flex gap-1.5">
                            <button onclick="openProductDetailModal('${sku}')" aria-label="Ver detalles" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition text-xs flex items-center justify-center cursor-pointer">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button onclick="addToCartCT('${sku}')" aria-label="Agregar al carrito" class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow cursor-pointer">
                                <i class="fa-solid fa-cart-plus text-xs"></i> <span>Agregar</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    } else {
        container.className = "flex flex-col gap-3";
        container.innerHTML = currentBatch.map((p) => {
            const sku = p.sku || p.clave;
            const cat = p.categoria_clasificada || 'accesorios_perifericos';
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;");
            const price = p.precio_mxn || p.precio || 0;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const placeholder = getPlaceholderForCat(cat);

            return `
                <article class="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition shadow-lg">
                    <div class="w-24 h-24 sm:w-28 sm:h-28 bg-slate-950 rounded-xl p-2 shrink-0 flex items-center justify-center cursor-pointer" onclick="openProductDetailModal('${sku}')">
                        <img src="${localImg}" alt="${title}" width="120" height="120" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }" />
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                        <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">${cat.replace(/_/g, ' ')} • SKU: ${sku}</span>
                        <h3 onclick="openProductDetailModal('${sku}')" class="text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-300 transition line-clamp-2 cursor-pointer mb-1.5">${title}</h3>
                        <div class="text-[11px] font-mono text-slate-400">Entrega Inmediata en Pedro Moreno 501 A • Garantía 48h Directa</div>
                    </div>
                    <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 shrink-0">
                        <div class="text-right">
                            <span class="text-[10px] text-slate-500 line-through font-mono block">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-sm sm:text-base font-black text-emerald-400 font-mono">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</div>
                        </div>
                        <button onclick="addToCartCT('${sku}')" class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow cursor-pointer mt-2">
                            <i class="fa-solid fa-cart-plus"></i> <span>Agregar</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    renderPaginationControls(totalPages);
    renderBottomNavigation();
}

function renderPaginationControls(totalPages) {
    const bars = document.querySelectorAll(".pagination-target-bar");
    if (!bars.length) return;

    if (totalPages <= 1) {
        bars.forEach(b => b.innerHTML = '');
        return;
    }

    let html = `
        <div class="flex items-center gap-1 font-mono text-xs">
            <button onclick="goToPage(${currentPageNumber - 1})" ${currentPageNumber === 1 ? 'disabled class="p-1.5 rounded-lg text-slate-600 cursor-not-allowed"' : 'class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"'} aria-label="Página anterior">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold font-mono">
                ${currentPageNumber} / ${totalPages}
            </span>
            <button onclick="goToPage(${currentPageNumber + 1})" ${currentPageNumber === totalPages ? 'disabled class="p-1.5 rounded-lg text-slate-600 cursor-not-allowed"' : 'class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"'} aria-label="Página siguiente">
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

function renderBottomNavigation() {
    const root = document.getElementById("catalog-bottom-nav-root");
    if (!root) return;

    root.innerHTML = `
        <div class="mt-8 pt-6 border-t border-slate-800 space-y-4">
            
            <div class="flex flex-col sm:flex-row gap-3">
                <button 
                    onclick="window.scrollToDepartments()" 
                    type="button"
                    aria-label="Volver arriba a elegir otro departamento"
                    class="flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer active:scale-95 transition"
                >
                    <i class="fa-solid fa-arrow-up-from-bracket text-base"></i>
                    <span>⬆ Volver a Departamentos / Seleccionar Otro Producto</span>
                </button>
                
                <a 
                    href="checkout.html" 
                    aria-label="Ir a la pasarela de pago del carrito"
                    class="flex-1 bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 hover:text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 transition"
                >
                    <i class="fa-solid fa-cart-shopping text-emerald-400"></i>
                    <span>Ir a Pagar al Carrito</span>
                </a>
            </div>

            <div class="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <span class="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                    <i class="fa-solid fa-bolt text-cyan-400 mr-1"></i> Saltar Directamente a Otro Departamento:
                </span>
                <div class="flex flex-wrap gap-2">
                    <button onclick="window.selectCategoryFacet('memorias_ram')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-memory text-emerald-400"></i> Memorias RAM (403)
                    </button>
                    <button onclick="window.selectCategoryFacet('gabinetes')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-server text-cyan-400"></i> Gabinetes (134)
                    </button>
                    <button onclick="window.selectCategoryFacet('fuentes_energia')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-bolt text-yellow-400"></i> Fuentes de Poder (201)
                    </button>
                    <button onclick="window.selectCategoryFacet('tarjetas_de_video')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-vr-cardboard text-purple-400"></i> Tarjetas de Video (51)
                    </button>
                    <button onclick="window.selectCategoryFacet('discos_duros')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-hard-drive text-blue-400"></i> Almacenamiento SSD (347)
                    </button>
                    <button onclick="window.selectCategoryFacet('tarjetas_madre')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-chess-board text-pink-400"></i> Tarjetas Madre (105)
                    </button>
                    <button onclick="window.selectCategoryFacet('monitores')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-desktop text-indigo-400"></i> Monitores (840)
                    </button>
                    <button onclick="window.selectCategoryFacet('laptops')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-laptop text-cyan-400"></i> Laptops (1,189)
                    </button>
                    <button onclick="window.selectCategoryFacet('accesorios_perifericos')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-keyboard text-amber-400"></i> Periféricos (3,182)
                    </button>
                    <button onclick="window.selectCategoryFacet('consumibles')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-droplet text-rose-400"></i> Tóner & Tintas (2,151)
                    </button>
                </div>
            </div>

        </div>
    `;
}

function renderSidebarFacets() {
    const root = document.getElementById("sidebar-facets-root");
    if (!root) return;

    const block1 = [
        { id: 'procesadores', name: 'Procesadores (Intel/AMD)', icon: 'fa-microchip' },
        { id: 'tarjetas_madre', name: 'Tarjetas Madre (Motherboards)', icon: 'fa-chess-board' },
        { id: 'memorias_ram', name: 'Memorias RAM (DDR4 / DDR5)', icon: 'fa-memory' },
        { id: 'discos_duros', name: 'Almacenamiento (SSD & HDD)', icon: 'fa-hard-drive' },
        { id: 'tarjetas_de_video', name: 'Tarjetas de Video (GPUs)', icon: 'fa-vr-cardboard' },
        { id: 'gabinetes', name: 'Gabinetes & Chasis Gamer', icon: 'fa-server' },
        { id: 'fuentes_energia', name: 'Fuentes de Poder (PSU)', icon: 'fa-bolt' },
        { id: 'enfriamiento', name: 'Enfriamiento y Disipadores', icon: 'fa-fan' },
        { id: 'reguladores_ups', name: 'Reguladores & No-Breaks', icon: 'fa-car-battery' },
        { id: 'monitores', name: 'Monitores & Pantallas PC', icon: 'fa-desktop' }
    ];

    const block2 = [
        { id: 'mini_pcs_ia', name: 'Mini PCs & Servidores IA (NUC)', icon: 'fa-brain' },
        { id: 'laptops', name: 'Laptops y Portátiles', icon: 'fa-laptop' },
        { id: 'all_in_one', name: 'Equipos All-in-One e iMac', icon: 'fa-tv' }
    ];

    const block3 = [
        { id: 'consumibles', name: 'Tóners, Tintas y Consumibles', icon: 'fa-droplet' },
        { id: 'impresoras', name: 'Impresoras y Multifuncionales', icon: 'fa-print' },
        { id: 'accesorios_perifericos', name: 'Teclados, Mouse & Periféricos', icon: 'fa-keyboard' },
        { id: 'conectividad_redes', name: 'Redes & Conectividad WiFi', icon: 'fa-wifi' },
        { id: 'software', name: 'Software & Licencias', icon: 'fa-compact-disc' },
        { id: 'telefonia_seguridad', name: 'Telefonía & Videovigilancia', icon: 'fa-video' },
        { id: 'punto_de_venta', name: 'Punto de Venta (POS)', icon: 'fa-barcode' },
        { id: 'electronica_consumo', name: 'Audio, Video & Electrónica', icon: 'fa-headphones' },
        { id: 'linea_blanca', name: 'Línea Blanca & Hogar', icon: 'fa-blender' },
        { id: 'outlet_liquidaciones', name: 'Outlet & Liquidaciones', icon: 'fa-percent' }
    ];

    const all = window.CT_CATALOG_DATA || [];
    const getCount = (id) => all.filter(p => (p.categoria_clasificada || '').toLowerCase() === id.toLowerCase()).length;

    const renderBtn = (c) => `
        <button onclick="window.selectCategoryFacet('${c.id}')" type="button" aria-label="Filtrar por ${c.name}" class="w-full text-left px-3 py-2 rounded-xl ${activeSelectedCategory === c.id ? 'bg-cyan-500 text-slate-950 font-black shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800'} border border-transparent transition flex items-center justify-between text-xs font-mono cursor-pointer">
            <span class="flex items-center gap-2 truncate">
                <i class="fa-solid ${c.icon} ${activeSelectedCategory === c.id ? 'text-slate-950' : 'text-cyan-400'} w-4 text-center shrink-0"></i>
                <span class="truncate">${c.name}</span>
            </span>
            <span class="text-[10px] ${activeSelectedCategory === c.id ? 'bg-slate-950 text-cyan-300' : 'bg-slate-950 text-slate-400'} px-2 py-0.5 rounded-md font-bold shrink-0">(${getCount(c.id)})</span>
        </button>
    `;

    root.innerHTML = `
        <div class="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-4">
            
            <div class="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-layer-group"></i> Departamentos
                </span>
                <span class="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-md">${all.length.toLocaleString('es-MX')} Items</span>
            </div>

            <div class="space-y-1">
                <button onclick="window.selectCategoryFacet('Todas')" type="button" aria-label="Ver todas las categorías" class="w-full text-left px-3 py-2 rounded-xl ${activeSelectedCategory === 'Todas' ? 'bg-cyan-500 text-slate-950 font-black shadow-lg' : 'text-slate-300 hover:text-white hover:bg-slate-800'} border border-cyan-500/30 transition flex items-center justify-between text-xs font-mono cursor-pointer">
                    <span class="flex items-center gap-2">
                        <i class="fa-solid fa-boxes-stacked w-4 text-center"></i>
                        <span>Todas las Categorías</span>
                    </span>
                    <span class="text-[10px] bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-md font-bold">(${all.length.toLocaleString('es-MX')})</span>
                </button>
            </div>

            <div class="space-y-1 pt-2 border-t border-slate-800">
                <span class="text-[10.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider px-2 block">
                    1. Componentes de Ensamble
                </span>
                ${block1.map(renderBtn).join('')}
            </div>

            <div class="space-y-1 pt-2 border-t border-slate-800">
                <span class="text-[10.5px] font-mono font-bold text-purple-400 uppercase tracking-wider px-2 block">
                    2. Sistemas & Computadoras
                </span>
                ${block2.map(renderBtn).join('')}
            </div>

            <div class="space-y-1 pt-2 border-t border-slate-800">
                <span class="text-[10.5px] font-mono font-bold text-amber-400 uppercase tracking-wider px-2 block">
                    3. Consumibles & Soluciones
                </span>
                ${block3.map(renderBtn).join('')}
            </div>

        </div>
    `;
}

// Búsqueda Semántica Inteligente
const WORD_SYNONYMS = {
    "raton": ["mouse", "raton"], "ratones": ["mouse", "raton"], "mouse": ["mouse", "raton"], "mice": ["mouse", "raton"],
    "teclado": ["teclado", "keyboard"], "teclados": ["teclado", "keyboard"], "keyboard": ["teclado", "keyboard"],
    "combo": ["combo", "kit", "bundle"], "kit": ["combo", "kit", "bundle"],
    "pantalla": ["monitor", "pantalla", "display"], "pantallas": ["monitor", "pantalla", "display"], "monitor": ["monitor", "pantalla", "display"], "monitores": ["monitor", "pantalla", "display"],
    "grafica": ["video", "gpu", "rtx", "gtx", "radeon", "grafica", "geforce"], "gpu": ["video", "gpu", "rtx", "gtx", "radeon", "grafica", "geforce"], "video": ["video", "grafica", "gpu", "rtx", "gtx", "radeon"],
    "placa": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"], "madre": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"], "motherboard": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"],
    "disco": ["disco", "ssd", "hdd", "almacenamiento", "solido", "nvme", "m2"], "discos": ["disco", "ssd", "hdd", "almacenamiento", "solido", "nvme", "m2"], "solido": ["ssd", "solido", "nvme", "m2"], "ssd": ["ssd", "solido", "nvme", "m2", "disco"], "nvme": ["nvme", "ssd", "m2", "solido"], "m2": ["m2", "nvme", "ssd"],
    "fuente": ["fuente", "psu", "power supply", "fuentes"], "fuentes": ["fuente", "psu", "power supply", "fuentes"], "psu": ["fuente", "psu", "power supply"],
    "gabinete": ["gabinete", "chasis", "case", "torre", "chassis"], "gabinetes": ["gabinete", "chasis", "case", "torre", "chassis"], "chasis": ["gabinete", "chasis", "case", "torre"],
    "disipador": ["enfriamiento", "disipador", "cooler", "ventilador", "fan", "heatsink"], "enfriamiento": ["enfriamiento", "disipador", "cooler", "ventilador", "fan", "heatsink", "liquida", "water"],
    "ram": ["ram", "memoria", "ddr4", "ddr5", "dimm"], "memoria": ["ram", "memoria", "ddr4", "ddr5", "dimm"], "memorias": ["ram", "memoria", "ddr4", "ddr5", "dimm"],
    "regulador": ["regulador", "reguladores", "no-break", "nobreak", "ups", "koblenz", "sola basic", "complet"], "reguladores": ["regulador", "reguladores", "no-break", "nobreak", "ups", "koblenz", "sola basic", "complet"], "ups": ["no-break", "nobreak", "ups", "regulador"],
    "laptop": ["laptop", "laptops", "portatil", "portatiles", "notebook"], "laptops": ["laptop", "laptops", "portatil", "portatiles", "notebook"], "portatil": ["laptop", "laptops", "portatil", "portatiles", "notebook"], "computadora": ["computadora", "computadoras", "pc", "desktop", "cpu"],
    "procesador": ["procesador", "cpu", "core", "ultra", "ryzen"], "procesadores": ["procesador", "cpu", "core", "ultra", "ryzen"], "cpu": ["procesador", "cpu", "core", "ultra", "ryzen"],
    "i9": ["i9", "core i9", "ultra 9", "14900", "12900", "285k"], "i7": ["i7", "core i7", "ultra 7", "14700", "12700", "265k"], "i5": ["i5", "core i5", "ultra 5", "14600", "14400", "12600", "12400", "245k", "225"], "i3": ["i3", "core i3", "14100", "12100"]
};

const STOP_WORDS = new Set(["de", "con", "para", "y", "e", "o", "en", "un", "una", "unos", "unas", "el", "la", "los", "las", "del", "al", "a", "por", "que", "se", "es"]);

function normalizeText(str) {
    return (str || '').toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[®™©]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function searchCatalogMaster(query) {
    const rawTokens = normalizeText(query).split(' ').filter(t => t.length > 0 && !STOP_WORDS.has(t));
    if (rawTokens.length === 0) return window.CT_CATALOG_DATA || [];

    const tokenExpansions = rawTokens.map(token => {
        const syns = WORD_SYNONYMS[token] || [token];
        return syns.map(s => normalizeText(s));
    });

    const catalog = window.CT_CATALOG_DATA || [];
    const scored = [];

    for (let i = 0; i < catalog.length; i++) {
        const p = catalog[i];
        const normTitle = normalizeText(p.nombre || '');
        const normDesc = normalizeText(p.descripcion_completa || '');
        const normSku = normalizeText(p.sku || p.clave || '');
        const normBrand = normalizeText(p.marca || '');
        const normCat = normalizeText(p.categoria_clasificada || '');

        let matchesAll = true;
        let score = 0;

        for (const tokenGroup of tokenExpansions) {
            let matchedToken = false;
            for (const synonym of tokenGroup) {
                if (normSku.includes(synonym)) { score += 100; matchedToken = true; break; }
                if (normTitle.includes(synonym)) { score += 60; matchedToken = true; break; }
                if (normBrand.includes(synonym)) { score += 40; matchedToken = true; break; }
                if (normCat.includes(synonym)) { score += 30; matchedToken = true; break; }
                if (normDesc.includes(synonym)) { score += 10; matchedToken = true; break; }
            }
            if (!matchedToken) { matchesAll = false; break; }
        }

        if (matchesAll) {
            scored.push({ item: p, score: score });
        }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.item);
}

window.executeSearchQuery = function(q) {
    activeSearchQuery = q ? q.trim() : '';
    currentPageNumber = 1;
    renderExactCatalogView();
    const showcaseTarget = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (showcaseTarget) showcaseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Carrito y Notificaciones
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
    const catalog = window.CT_CATALOG_DATA || [];
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
            cdn_url: `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`,
            quantity: 1
        });
    }

    saveBoutiqueCart(cart);
    showAddToCartToast(p.nombre || p.descripcion_completa || "Producto");
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
    const catalog = window.CT_CATALOG_DATA || [];
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
    const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
    const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
    const placeholder = getPlaceholderForCat(cat);

    content.innerHTML = `
        <div class="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <i class="fa-solid fa-circle-info mr-1"></i> Ficha Técnica Oficial PC Custom Lab
            </span>
            <button onclick="closeProductDetailModal()" aria-label="Cerrar modal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="w-full aspect-square bg-slate-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800">
                <img src="${localImg}" alt="${title}" width="400" height="400" class="w-full h-full object-contain" onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }" />
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
                        <button onclick="addToCartCT('${sku}'); closeProductDetailModal();" class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition cursor-pointer">
                            <i class="fa-solid fa-cart-plus"></i> <span>Agregar al Carrito</span>
                        </button>
                        <a href="checkout.html" onclick="addToCartCT('${sku}');" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition cursor-pointer">
                            <i class="fa-solid fa-bolt"></i> <span>Comprar Ahora</span>
                        </a>
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

document.addEventListener("DOMContentLoaded", () => {
    initFullCatalog();
    syncBoutiqueCart();
});
