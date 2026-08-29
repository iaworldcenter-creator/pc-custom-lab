// Función global para seleccionar categoría y viajar directamente a la vitrina en celular y desktop
window.selectCategoryFacet = function(catId) {
    activeSelectedCategory = catId;
    activeSearchQuery = '';
    activeSelectedBrand = 'Todas';
    currentPageNumber = 1;
    
    // Limpiar input de búsqueda visualmente
    const searchInput = document.getElementById("boutiqueSearchInput");
    if (searchInput) searchInput.value = '';

    renderSidebarFacets();
    renderExactCatalogView();

    // En celular y desktop: Desplazamiento directo y suave a la vitrina de productos
    const showcaseTarget = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (showcaseTarget) {
        showcaseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Helper de priorización de tareas (scheduler.yield) para evitar bloqueos del hilo principal > 50ms
async function yieldControl() {
    if ('scheduler' in window && 'yield' in scheduler) {
        await scheduler.yield();
    } else {
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

// =========================================================================
// MOTOR OFICIAL PC CUSTOM LAB (INDEXACIÓN TOTAL DE 16,139 PRODUCTOS)
// =========================================================================

let currentViewStyle = 'grid'; // 'grid' (5x4) o 'list'
let currentPageNumber = 1;
const productsPerPage = 20; // 5 filas x 4 columnas

let activeSelectedCategory = 'Todas';
let activeSelectedBrand = 'Todas';
let currentSortCriterion = 'existencia';
let isFullCatalogLoaded = false;

// Inicialización instantánea y resiliente (Cero fallos de red en Lighthouse)
function initFullCatalog() {
    // 1. Usar inmediatamente los datos precargados locales (0ms, 0 network error)
    if (window.CT_CATALOG_DATA_INITIAL && Array.isArray(window.CT_CATALOG_DATA_INITIAL)) {
        window.CT_CATALOG_DATA = window.CT_CATALOG_DATA_INITIAL;
        isFullCatalogLoaded = true;
    }

    // 2. Si se requiere catálogo extendido, cargarlo en segundo plano cuando el navegador esté ocioso
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            fetch('./data/catalogo_maestro_ct.json')
                .then(res => res.ok ? res.json() : null)
                .then(fullData => {
                    if (Array.isArray(fullData) && fullData.length > 0) {
                        window.CT_CATALOG_DATA = fullData;
                        isFullCatalogLoaded = true;
                    }
                })
                .catch(() => {
                    // Fallback silencioso sin manchar la consola de Lighthouse
                });
        }, { timeout: 3000 });
    }
}

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
            btnList.className = "btn-action p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer text-xs flex items-center justify-center min-h-[48px] min-w-[48px]";
            btnList.setAttribute("aria-pressed", "true");
            btnGrid.className = "btn-action p-2 rounded-lg text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center justify-center min-h-[48px] min-w-[48px]";
            btnGrid.setAttribute("aria-pressed", "false");
        } else {
            btnGrid.className = "btn-action p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer text-xs flex items-center justify-center min-h-[48px] min-w-[48px]";
            btnGrid.setAttribute("aria-pressed", "true");
            btnList.className = "btn-action p-2 rounded-lg text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center justify-center min-h-[48px] min-w-[48px]";
            btnList.setAttribute("aria-pressed", "false");
        }
    }
    renderExactCatalogView();
}

function getFilteredList() {
    let items = (activeSearchQuery && activeSearchQuery.trim() !== '')
        ? searchCatalogMaster(activeSearchQuery)
        : [...(window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [])];

    if (activeSelectedCategory !== 'Todas') {
        items = items.filter(p => {
            const catClasif = (p.categoria_clasificada || '').toLowerCase();
            return catClasif === activeSelectedCategory.toLowerCase();
        });

        // Ordenar por sort_priority (Reguladores primero en reguladores_ups, Fuentes puras primero en fuentes_energia)
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

    if (currentPageNumber > totalPages) currentPageNumber = totalPages;
    const startIdx = (currentPageNumber - 1) * productsPerPage;
    const pageItems = filtered.slice(startIdx, startIdx + productsPerPage);

    if (resultsCountTxt) {
        resultsCountTxt.innerText = `Aparador Principal (${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount.toLocaleString('es-MX')})`;
    }

    renderPaginationBar(totalPages);

    if (pageItems.length === 0) {
        container.className = "w-full py-16 text-center text-slate-300 font-mono text-sm bg-slate-900/90 border border-slate-800 rounded-2xl";
        container.innerHTML = `
            <i class="fa-solid fa-box-open text-4xl text-cyan-400 mb-3 block" aria-hidden="true"></i>
            No se encontraron productos con los filtros seleccionados.
            <br><button onclick="resetFacets()" aria-label="Ver todo el catálogo" class="btn-action mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-lg hover:shadow-cyan-500/30 min-h-[48px]">Ver Todo el Catálogo</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2";
        container.innerHTML = pageItems.map((p, idx) => {
            const sku = p.sku;
            const cat = p.categoria_clasificada || 'accesorios_perifericos';
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const placeholder = getPlaceholderForCat(cat);
            const isAboveFold = idx < 4;

            return `
                <article class="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-3.5 flex flex-col justify-between transition group shadow-xl hover:shadow-cyan-500/10 relative overflow-hidden text-slate-100">
                    <div class="absolute -top-7 -left-7 w-16 h-16 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow-md z-10">
                        <span class="text-[7.5px] font-black text-white uppercase tracking-tighter">-25% DTO</span>
                    </div>

                    <button class="btn-action absolute top-2.5 right-2.5 text-slate-400 hover:text-pink-400 transition text-base z-10 cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center" title="Favoritos" aria-label="Agregar ${title} a favoritos">
                        <i class="fa-regular fa-heart" aria-hidden="true"></i>
                    </button>

                    <div>
                        <!-- Contenedor Geométrico Predictivo Estricto (CLS = 0) -->
                        <div onclick="openProductDetailModal('${sku}')" class="product-img-wrapper bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 mb-2.5 group-hover:border-cyan-500/40 transition cursor-pointer">
                            <img 
                                src="${localImg}" 
                                alt="${title}" 
                                width="300" 
                                height="300" 
                                ${isAboveFold ? 'fetchpriority="high"' : 'loading="lazy"'} 
                                decoding="async"
                                class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                                onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }"
                            />
                        </div>

                        <!-- Precios con Ratio de Contraste Superior a 7:1 -->
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
                            <i class="fa-solid fa-truck-bolt text-[10px]" aria-hidden="true"></i> Disponible Mostrador GDL
                        </div>

                        <!-- H3 Semántico para Jerarquía Descendente -->
                        <h3 onclick="openProductDetailModal('${sku}')" class="text-slate-100 text-xs font-semibold text-center line-clamp-2 leading-tight hover:text-cyan-300 transition mb-1 cursor-pointer" title="${title}">
                            ${title}
                        </h3>

                        <div class="text-center text-[9.5px] font-mono text-slate-300 mb-2">
                            <span>SKU: <strong>${sku}</strong></span>
                        </div>
                    </div>

                    <!-- Botones de Acción con Tap Targets >= 48px -->
                    <div class="pt-1 flex gap-2">
                        <button 
                            onclick="openProductDetailModal('${sku}')" 
                            aria-label="Ver ficha técnica de ${title}" 
                            class="btn-action flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-[11px] uppercase transition cursor-pointer border border-slate-700 min-h-[48px]"
                        >
                            <span>Ficha Técnica</span>
                        </button>
                        <button 
                            onclick="buyNowCT(\'${sku}\')" 
                            aria-label="Comprar ${title}" 
                            class="btn-action flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition active:scale-95 shadow-md cursor-pointer min-h-[48px]"
                        >
                            <span>Comprar</span>
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
            const usdPrice = (price / 19.50).toFixed(2);
            const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const placeholder = getPlaceholderForCat(cat);
            const desc = p.descripcion_completa || p.desc || '';

            return `
                <article class="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-xl relative overflow-hidden text-slate-100">
                    <div class="absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow z-10">
                        <span class="text-[7px] font-black text-white uppercase">-25%</span>
                    </div>

                    <div onclick="openProductDetailModal('${sku}')" class="product-img-wrapper w-full md:w-32 h-28 bg-slate-950/90 border border-slate-800 rounded-xl p-2 shrink-0 cursor-pointer">
                        <img 
                            src="${localImg}" 
                            alt="${title}" 
                            width="140" 
                            height="140" 
                            loading="lazy" 
                            decoding="async" 
                            class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                            onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }"
                        />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h3 onclick="openProductDetailModal('${sku}')" class="text-cyan-300 font-bold text-sm mb-1 hover:text-cyan-200 transition leading-snug cursor-pointer">
                            ${title}
                        </h3>
                        <div class="flex items-center gap-2 text-[10.5px] font-mono text-slate-300 mb-1">
                            <span>SKU: <strong>${sku}</strong></span>
                            <span>•</span>
                            <span class="text-emerald-300 font-bold">20% Neto Libre Garantizado</span>
                        </div>
                        <p class="text-slate-300 text-xs leading-relaxed line-clamp-2">${desc}</p>
                    </div>

                    <div class="w-full md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0 text-right">
                        <div class="w-full mb-1.5">
                            <span class="text-[10.5px] text-slate-400 line-through block font-mono">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-base font-black text-emerald-300 leading-tight font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </div>
                            <span class="text-[10px] text-slate-300 block font-mono">$${usdPrice} USD • Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div class="flex items-center gap-2 w-full">
                            <button onclick="openProductDetailModal('${sku}')" aria-label="Ver ficha técnica de ${title}" class="btn-action p-2.5 rounded-xl border border-slate-800 bg-slate-800 hover:bg-slate-700 text-cyan-300 transition text-xs font-bold min-h-[48px] min-w-[48px] flex items-center justify-center">
                                <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
                            </button>
                            <button 
                                onclick="addToCartCT(\'${sku}\')" 
                                aria-label="Agregar ${title} al carrito"
                                class="btn-action flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer uppercase min-h-[48px]"
                            >
                                <span>Agregar</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }
}

// =========================================================================
// BARRA LATERAL IZQUIERDA: 24 DEPARTAMENTOS Y 3 TARJETAS INTEGRADAS
// =========================================================================
function renderSidebarFacets() {
    const root = document.getElementById("sidebar-facets-root");
    if (!root) return;

    const block1 = [
        { id: 'procesadores', name: 'Procesadores (CPUs Intel/AMD)', icon: 'fa-microchip' },
        { id: 'tarjetas_madre', name: 'Tarjetas Madre (Motherboards)', icon: 'fa-chess-board' },
        { id: 'memorias_ram', name: 'Memorias RAM (DDR4 / DDR5)', icon: 'fa-memory' },
        { id: 'discos_duros', name: 'Almacenamiento (SSD & HDD)', icon: 'fa-hard-drive' },
        { id: 'tarjetas_de_video', name: 'Tarjetas de Video (GPUs)', icon: 'fa-vr-cardboard' },
        { id: 'gabinetes', name: 'Gabinetes & Chasis Gamer', icon: 'fa-server' },
        { id: 'fuentes_energia', name: 'Fuentes de Poder (PSU)', icon: 'fa-bolt' },
        { id: 'enfriamiento', name: 'Enfriamiento y Disipadores', icon: 'fa-fan' },
        { id: 'reguladores_ups', name: 'Reguladores, No-Breaks & UPS', icon: 'fa-car-battery' },
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
        { id: 'software', name: 'Software & Licencias Originales', icon: 'fa-compact-disc' },
        { id: 'telefonia_seguridad', name: 'Telefonía & Videovigilancia (CCTV)', icon: 'fa-video' },
        { id: 'punto_de_venta', name: 'Punto de Venta (POS)', icon: 'fa-barcode' },
        { id: 'electronica_consumo', name: 'Audio, Video & Electrónica', icon: 'fa-headphones' },
        { id: 'linea_blanca', name: 'Línea Blanca & Electrodomésticos', icon: 'fa-blender' },
        { id: 'outlet_liquidaciones', name: 'Outlet & Liquidaciones', icon: 'fa-percent' }
    ];

    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const getCount = (id) => all.filter(p => (p.categoria_clasificada || '').toLowerCase() === id.toLowerCase()).length;

    const renderBtn = (c) => `
        <button onclick="window.selectCategoryFacet('${c.id}')" type="button" aria-label="Filtrar por categoría ${c.name}" class="w-full text-left px-3 py-2.5 rounded-xl ${activeSelectedCategory === c.id ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'} border border-transparent hover:border-slate-800 transition flex items-center justify-between text-xs font-mono group cursor-pointer min-h-[48px]">
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
                <button onclick="window.selectCategoryFacet('Todas')" type="button" aria-label="Ver todas las categorías" class="w-full text-left px-3 py-2.5 rounded-xl ${activeSelectedCategory === 'Todas' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white hover:bg-slate-900'} border border-cyan-400 transition flex items-center justify-between text-xs font-mono cursor-pointer min-h-[48px]">
                    <span class="flex items-center gap-2">
                        <i class="fa-solid fa-boxes-stacked w-4 text-center"></i>
                        <span>Todas las Categorías</span>
                    </span>
                    <span class="text-[10px] bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-md font-bold">(${all.length.toLocaleString('es-MX')})</span>
                </button>
            </div>

            <!-- BLOQUE 1: COMPONENTES DE ENSAMBLE -->
            <div class="space-y-1 pt-2 border-t border-slate-800">
                <span class="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    1. Componentes de Ensamble
                </span>
                ${block1.map(renderBtn).join('')}
            </div>

            <!-- BLOQUE 2: SISTEMAS & COMPUTADORAS -->
            <div class="space-y-1 pt-2 border-t border-slate-800">
                <span class="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    2. Sistemas & Computadoras
                </span>
                ${block2.map(renderBtn).join('')}
            </div>

            <!-- BLOQUE 3: CONSUMIBLES & SOLUCIONES -->
            <div class="space-y-1 pt-2 border-t border-slate-800">
                <span class="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    3. Consumibles & Soluciones
                </span>
                ${block3.map(renderBtn).join('')}
            </div>

        </div>
    `;
}

// =========================================================================
// MOTOR DE BÚSQUEDA SEMÁNTICA INTELIGENTE & TOLERANCIA HUMANA (16,139 ITEMS)
// =========================================================================

const WORD_SYNONYMS = {
    // Periféricos y accesorios
    "raton": ["mouse", "raton"],
    "ratones": ["mouse", "raton"],
    "mouse": ["mouse", "raton"],
    "mice": ["mouse", "raton"],
    "teclado": ["teclado", "keyboard"],
    "teclados": ["teclado", "keyboard"],
    "keyboard": ["teclado", "keyboard"],
    "combo": ["combo", "kit", "bundle"],
    "kit": ["combo", "kit", "bundle"],
    
    // Monitores y Pantallas
    "pantalla": ["monitor", "pantalla", "display"],
    "pantallas": ["monitor", "pantalla", "display"],
    "monitor": ["monitor", "pantalla", "display"],
    "monitores": ["monitor", "pantalla", "display"],
    "display": ["monitor", "pantalla", "display"],
    
    // Tarjetas de Video / Gráficas
    "grafica": ["video", "gpu", "rtx", "gtx", "radeon", "grafica", "geforce"],
    "graficas": ["video", "gpu", "rtx", "gtx", "radeon", "grafica", "geforce"],
    "gpu": ["video", "gpu", "rtx", "gtx", "radeon", "grafica", "geforce"],
    "video": ["video", "grafica", "gpu", "rtx", "gtx", "radeon"],
    
    // Tarjetas Madre / Motherboards
    "placa": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"],
    "placas": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"],
    "madre": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"],
    "motherboard": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"],
    "motherboards": ["motherboard", "tarjeta madre", "placa madre", "mainboard", "mbd"],
    "mobo": ["motherboard", "tarjeta madre", "placa madre", "mbd"],
    
    // Almacenamiento / Discos
    "disco": ["disco", "ssd", "hdd", "almacenamiento", "solido", "nvme", "m2"],
    "discos": ["disco", "ssd", "hdd", "almacenamiento", "solido", "nvme", "m2"],
    "solido": ["ssd", "solido", "nvme", "m2"],
    "ssd": ["ssd", "solido", "nvme", "m2", "disco"],
    "nvme": ["nvme", "ssd", "m2", "solido"],
    "m2": ["m2", "nvme", "ssd"],
    
    // Fuentes de Poder y Gabinetes
    "fuente": ["fuente", "psu", "power supply", "fuentes"],
    "fuentes": ["fuente", "psu", "power supply", "fuentes"],
    "psu": ["fuente", "psu", "power supply"],
    "gabinete": ["gabinete", "chasis", "case", "torre", "chassis"],
    "gabinetes": ["gabinete", "chasis", "case", "torre", "chassis"],
    "chasis": ["gabinete", "chasis", "case", "torre"],
    "case": ["gabinete", "chasis", "case", "torre"],
    
    // Enfriamiento y Disipadores
    "disipador": ["enfriamiento", "disipador", "cooler", "ventilador", "fan", "heatsink"],
    "disipadores": ["enfriamiento", "disipador", "cooler", "ventilador", "fan", "heatsink"],
    "enfriamiento": ["enfriamiento", "disipador", "cooler", "ventilador", "fan", "heatsink", "liquida", "water"],
    "ventilador": ["ventilador", "fan", "cooler", "disipador"],
    "ventiladores": ["ventilador", "fan", "cooler", "disipador"],
    "cooler": ["cooler", "disipador", "enfriamiento", "fan"],
    
    // Memorias RAM
    "ram": ["ram", "memoria", "ddr4", "ddr5", "dimm"],
    "memoria": ["ram", "memoria", "ddr4", "ddr5", "dimm"],
    "memorias": ["ram", "memoria", "ddr4", "ddr5", "dimm"],
    
    // Reguladores y No-Breaks
    "regulador": ["regulador", "reguladores", "no-break", "nobreak", "ups", "koblenz", "sola basic", "complet"],
    "reguladores": ["regulador", "reguladores", "no-break", "nobreak", "ups", "koblenz", "sola basic", "complet"],
    "nobreak": ["no-break", "nobreak", "ups", "regulador"],
    "ups": ["no-break", "nobreak", "ups", "regulador"],
    
    // Audio y Auriculares
    "bocina": ["bocina", "bocinas", "parlante", "speaker", "speakers", "audio"],
    "bocinas": ["bocina", "bocinas", "parlante", "speaker", "speakers", "audio"],
    "audifono": ["audifono", "audifonos", "auricular", "auriculares", "headset", "headphones", "diadema"],
    "audifonos": ["audifono", "audifonos", "auricular", "auriculares", "headset", "headphones", "diadema"],
    "diadema": ["audifono", "audifonos", "auricular", "auriculares", "headset", "headphones", "diadema"],
    
    // Equipos y Laptops
    "impresora": ["impresora", "impresoras", "multifuncional", "printer"],
    "laptop": ["laptop", "laptops", "portatil", "portatiles", "notebook"],
    "laptops": ["laptop", "laptops", "portatil", "portatiles", "notebook"],
    "portatil": ["laptop", "laptops", "portatil", "portatiles", "notebook"],
    "computadora": ["computadora", "computadoras", "pc", "desktop", "cpu"],
    
    // Procesadores y Generaciones
    "procesador": ["procesador", "cpu", "core", "ultra", "ryzen"],
    "procesadores": ["procesador", "cpu", "core", "ultra", "ryzen"],
    "cpu": ["procesador", "cpu", "core", "ultra", "ryzen"],
    "i9": ["i9", "core i9", "ultra 9", "14900", "12900", "285k"],
    "i7": ["i7", "core i7", "ultra 7", "14700", "12700", "265k"],
    "i5": ["i5", "core i5", "ultra 5", "14600", "14400", "12600", "12400", "245k", "225"],
    "i3": ["i3", "core i3", "14100", "12100"]
};

const STOP_WORDS_SET = new Set([
    "de", "con", "para", "y", "e", "o", "en", "un", "una", "unos", "unas",
    "el", "la", "los", "las", "del", "al", "a", "por", "que", "se", "es",
    "su", "sus", "with", "and", "for", "the"
]);

function normalizeText(str) {
    return (str || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[®™©]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function searchCatalogMaster(query) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const qNorm = normalizeText(query);
    if (!qNorm) return all;

    const rawTokens = qNorm.split(' ').filter(t => t.length > 0);
    const tokens = (rawTokens.length > 1) 
        ? rawTokens.filter(t => !STOP_WORDS_SET.has(t)) 
        : rawTokens;
    
    const activeTokens = tokens.length > 0 ? tokens : rawTokens;
    const scoredResults = [];

    for (let i = 0; i < all.length; i++) {
        const p = all[i];
        const skuNorm = normalizeText(p.sku);
        const nameNorm = normalizeText(p.nombre);
        const descNorm = normalizeText(p.descripcion_completa);
        const brandNorm = normalizeText(p.marca);
        const catNorm = normalizeText(p.categoria_clasificada);

        let matchAll = true;
        let score = 0;

        for (let j = 0; j < activeTokens.length; j++) {
            const token = activeTokens[j];
            const synList = WORD_SYNONYMS[token] || [token];
            let tokenFound = false;

            for (let k = 0; k < synList.length; k++) {
                const syn = synList[k];
                if (nameNorm.includes(syn)) {
                    score += 120;
                    tokenFound = true;
                } else if (skuNorm.includes(syn)) {
                    score += 100;
                    tokenFound = true;
                } else if (brandNorm.includes(syn)) {
                    score += 60;
                    tokenFound = true;
                } else if (catNorm.includes(syn)) {
                    score += 40;
                    tokenFound = true;
                } else if (descNorm.includes(syn)) {
                    score += 20;
                    tokenFound = true;
                }
            }

            if (!tokenFound) {
                matchAll = false;
                break;
            }
        }

        if (matchAll) {
            // Bonificaciones por coincidencia exacta
            if (nameNorm.includes(qNorm)) score += 500;
            if (skuNorm.includes(qNorm)) score += 800;
            scoredResults.push({ score, product: p });
        }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.map(r => r.product);
}

let activeSearchQuery = '';

window.executeSearchQuery = function(query) {
    activeSearchQuery = (query || '').trim();
    activeSelectedCategory = 'Todas';
    activeSelectedBrand = 'Todas';
    currentPageNumber = 1;
    renderSidebarFacets();
    renderExactCatalogView();
    
    const box = document.getElementById("boutique-autocomplete-box");
    if (box) box.classList.add("hidden");
    
    const target = document.getElementById("catalog-main-content-root");
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

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
                        <br><span class="text-[10px] text-slate-400">Prueba con: i9, teclado y mouse, 27 pulgadas, RTX 4070, DDR5, regulador...</span>
                    </div>
                `;
                box.classList.remove("hidden");
                return;
            }

            const topMatches = matches.slice(0, 10);

            box.innerHTML = `
                <div class="p-2.5 border-b border-slate-800 flex justify-between items-center text-[10.5px] font-mono text-slate-300 bg-slate-950/90">
                    <span>${matches.length} coincidencias encontradas para: "<strong>${rawQuery}</strong>"</span>
                    <button type="button" onclick="window.executeSearchQuery(document.getElementById('boutiqueSearchInput').value);" class="text-cyan-300 font-bold hover:underline cursor-pointer">
                        Ver todas en aparador »
                    </button>
                </div>
                <div class="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                    ${topMatches.map(p => {
                        const sku = p.sku;
                        const cat = p.categoria_clasificada || 'accesorios_perifericos';
                        const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
                        const price = p.precio_mxn || p.precio;
                        const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
                        const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
                        const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
                        const placeholder = getPlaceholderForCat(cat);

                        return `
                            <div class="flex items-center justify-between gap-3 p-3 hover:bg-slate-850 transition cursor-pointer group min-h-[48px]" onclick="openProductDetailModal('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" role="button" tabindex="0" aria-label="Ver detalle de ${title}">
                                <div class="product-img-wrapper w-12 h-12 bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-800 group-hover:border-cyan-400/50">
                                    <img src="${localImg}" alt="${title}" width="48" height="48" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }" />
                                </div>
                                <div class="flex-1 min-w-0 text-left">
                                    <div class="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate">${title}</div>
                                    <div class="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                                        <span class="text-cyan-300 font-bold">SKU: ${sku}</span>
                                        <span>•</span>
                                        <span>${p.marca || 'PC CUSTOM'}</span>
                                        <span>•</span>
                                        <span class="text-amber-300">May: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div class="text-right shrink-0 flex items-center gap-2">
                                    <div class="text-xs font-mono font-black text-emerald-300">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                                    <button type="button" onclick="event.stopPropagation(); openProductDetailModal('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" aria-label="Ver ficha técnica de ${title}" class="btn-action bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 uppercase min-h-[44px]">
                                        Ficha
                                    </button>
                                    <button type="button" onclick="event.stopPropagation(); addToCartCT('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" aria-label="Agregar ${title} al carrito" class="btn-action bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase min-h-[44px]">
                                        + Carrito
                                    </button>
                                    <button type="button" onclick="event.stopPropagation(); buyNowCT('${sku}');" aria-label="Comprar ${title} ahora" class="btn-action bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow min-h-[44px]">
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

// =========================================================================
// FICHA DE PRODUCTO EN 3 COLUMNAS (PDP)
// =========================================================================
window.openProductDetailModal = function(sku) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const prod = all.find(p => p.sku === sku);
    if (!prod) return;

    const modal = document.getElementById("productDetailModal");
    const modalContent = document.getElementById("productDetailModalContent");
    if (!modal || !modalContent) return;

    const cat = prod.categoria_clasificada || 'accesorios_perifericos';
    const title = prod.nombre || prod.descripcion_completa;
    const price = prod.precio_mxn || prod.precio;
    const original = prod.precio_original || (price * 1.33);
    const mayoreo = prod.precio_mayoreo_10pzs || (price * 0.93);
    const localImg = `./assets/img/catalog/${cat}/${sku}.jpg`;
    const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
    const placeholder = getPlaceholderForCat(cat);
    const desc = prod.descripcion_completa || '';
    const marca = prod.marca || 'PC CUSTOM';

    modalContent.innerHTML = `
        <div class="w-full flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full uppercase">
                    Ficha Técnica Oficial PC Custom Lab
                </span>
                <span class="text-xs font-mono text-slate-300">SKU: <strong>${sku}</strong></span>
            </div>
            <button onclick="closeProductDetailModal()" aria-label="Cerrar ficha técnica" class="btn-action text-slate-300 hover:text-white text-xl p-2 transition cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center">
                <i class="fa-solid fa-xmark text-2xl" aria-hidden="true"></i>
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- COLUMNA 1 (IZQUIERDA - GALERÍA VISUAL) -->
            <div class="lg:col-span-4 flex flex-col gap-3">
                <div class="product-img-wrapper w-full h-72 sm:h-80 bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-4 shadow-2xl group">
                    <img 
                        id="pdp-main-image"
                        src="${localImg}" 
                        alt="${title}" 
                        width="300" 
                        height="300" 
                        class="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                        onerror="this.onerror=null; if (this.src.indexOf('static.ctonline.mx') === -1) { this.src='${cdnImg}'; } else { this.src='${placeholder}'; }"
                    />
                    <div class="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-md shadow">
                        -25% Apertura
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2">
                    <button onclick="document.getElementById('pdp-main-image').src='${localImg}'" aria-label="Ver imagen local" class="btn-action h-16 bg-slate-950 border border-cyan-400 rounded-xl p-1 flex items-center justify-center hover:opacity-80 transition cursor-pointer overflow-hidden min-h-[48px]">
                        <img src="${localImg}" alt="Vista Local" width="60" height="60" class="w-full h-full object-contain" onerror="this.src='${placeholder}';" />
                    </button>
                    <button onclick="document.getElementById('pdp-main-image').src='${cdnImg}'" aria-label="Ver imagen CDN" class="btn-action h-16 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center hover:border-cyan-400 transition cursor-pointer overflow-hidden min-h-[48px]">
                        <img src="${cdnImg}" alt="Vista CDN" width="60" height="60" class="w-full h-full object-contain" onerror="this.src='${placeholder}';" />
                    </button>
                </div>
            </div>

            <!-- COLUMNA 2 (CENTRO - ESPECIFICACIONES) -->
            <div class="lg:col-span-5 flex flex-col gap-4 text-slate-100">
                <div>
                    <span class="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider block mb-1">Marca Oficial: ${marca}</span>
                    <h3 id="pdp-modal-title" class="text-base sm:text-xl font-bold text-white leading-snug mb-2">${title}</h3>
                    
                    <div class="flex items-center gap-2 text-xs font-mono text-slate-300 pb-3 border-b border-slate-800">
                        <div class="flex items-center text-amber-400" aria-label="Calificación 5 estrellas">
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                        </div>
                        <span>(5.0 Calificación Oficial)</span>
                        <span>•</span>
                        <span class="text-emerald-300 font-bold">100% Original Nuevo</span>
                    </div>
                </div>

                <div class="bg-emerald-950/60 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-3">
                    <i class="fa-solid fa-circle-check text-emerald-400 text-xl shrink-0" aria-hidden="true"></i>
                    <div class="text-xs">
                        <strong class="text-emerald-300 block">Disponible en Sucursal Guadalajara</strong>
                        <span class="text-slate-200">Pedro Moreno 501 A, Zona Centro. Retiro en 15 minutos o entrega express.</span>
                    </div>
                </div>

                <div class="space-y-2 text-xs">
                    <h4 class="font-bold text-white uppercase text-xs font-mono flex items-center gap-2">
                        <i class="fa-solid fa-list-check text-cyan-400" aria-hidden="true"></i> Características & Especificaciones
                    </h4>
                    <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-slate-200 leading-relaxed font-sans">
                        <p><strong>Descripción:</strong> ${desc}</p>
                        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                            <div><span class="text-slate-400">Categoría:</span> <strong class="text-cyan-300">${cat.toUpperCase()}</strong></div>
                            <div><span class="text-slate-400">Garantía:</span> <strong class="text-white">48h Directa / 1 Año</strong></div>
                            <div><span class="text-slate-400">Clave Interna:</span> <strong class="text-white">${sku}</strong></div>
                            <div><span class="text-slate-400">Embalaje:</span> <strong class="text-white">Caja Sellada Fábrica</strong></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- COLUMNA 3 (DERECHA - CONVERSIÓN & PRECIOS) -->
            <div class="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-2xl">
                
                <div>
                    <div class="border-b border-slate-800 pb-3 space-y-1">
                        <div class="flex justify-between items-center">
                            <span class="text-[10.5px] text-slate-400 font-mono line-through" id="pdp-original-price">
                                Lista: $${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <span id="pdp-wholesale-badge" class="hidden text-[8.5px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                                Mayoreo Activado
                            </span>
                        </div>

                        <div class="text-2xl font-black text-emerald-300 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" id="pdp-unit-price-display">
                            $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span class="text-xs font-normal text-slate-300">MXN c/u</span>
                        </div>

                        <div class="flex justify-between items-center text-[10.5px] font-mono text-cyan-300 font-bold">
                            <span>Ahorro: -25% Apertura</span>
                            <span class="text-slate-300" id="pdp-subtotal-display">Subtotal: $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <!-- SELECTOR DINÁMICO (+ / -) Y PAPELERA -->
                    <div class="pt-3 space-y-2.5">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-mono text-slate-200 font-bold">Cantidad:</span>
                            
                            <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl p-1">
                                <button 
                                    type="button" 
                                    onclick="updatePDPQuantity(-1, ${price}, ${mayoreo}, ${original})" 
                                    aria-label="Disminuir cantidad de compra"
                                    class="qty-btn w-10 h-10 bg-slate-800 hover:bg-slate-700 active:scale-90 text-cyan-300 rounded-lg font-mono font-bold flex items-center justify-center transition cursor-pointer text-base min-h-[44px] min-w-[44px]"
                                >
                                    -
                                </button>
                                
                                <input 
                                    id="pdp-qty-input" 
                                    type="number" 
                                    value="1" 
                                    min="1" 
                                    max="999" 
                                    aria-label="Cantidad seleccionada"
                                    onchange="updatePDPQuantity(0, ${price}, ${mayoreo}, ${original})" 
                                    class="w-12 bg-transparent text-center text-white font-mono font-bold text-sm outline-none no-arrows min-h-[44px]"
                                />

                                <button 
                                    type="button" 
                                    onclick="updatePDPQuantity(1, ${price}, ${mayoreo}, ${original})" 
                                    aria-label="Aumentar cantidad de compra"
                                    class="qty-btn w-10 h-10 bg-slate-800 hover:bg-slate-700 active:scale-90 text-cyan-300 rounded-lg font-mono font-bold flex items-center justify-center transition cursor-pointer text-base min-h-[44px] min-w-[44px]"
                                >
                                    +
                                </button>
                            </div>

                            <button 
                                type="button" 
                                onclick="removeProductFromCart('${sku}'); closeProductDetailModal();" 
                                aria-label="Remover este producto de la selección"
                                class="btn-action w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 hover:bg-red-950/60 text-slate-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer shrink-0 min-h-[44px] min-w-[44px]" 
                                title="Remover de la selección"
                            >
                                <i class="fa-solid fa-trash-can text-sm" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div class="space-y-2 pt-1">
                            <button 
                                type="button"
                                onclick="executeAddToCartPDP('${sku}')" 
                                aria-label="Agregar producto al carrito"
                                class="btn-action w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow hover:shadow-cyan-500/20 min-h-[48px]"
                            >
                                <i class="fa-solid fa-cart-plus" aria-hidden="true"></i> <span>Agregar al Carrito</span>
                            </button>

                            <button 
                                type="button"
                                onclick="executeBuyNowPDP('${sku}')" 
                                aria-label="Pagar producto ahora"
                                class="btn-action w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-lg cursor-pointer min-h-[48px]"
                            >
                                <i class="fa-solid fa-bolt" aria-hidden="true"></i> <span>Pagar Ahora (SPEI / MP)</span>
                            </button>
                        </div>
                    </div>

                    <div class="mt-3.5 pt-3 border-t border-slate-800 space-y-2 text-[11px]">
                        <div class="bg-slate-900/90 border border-emerald-500/40 p-2.5 rounded-xl space-y-1">
                            <div class="flex items-center gap-1.5 text-emerald-300 font-mono font-bold">
                                <i class="fa-solid fa-coins" aria-hidden="true"></i> <span>5% DE CASHBACK</span>
                            </div>
                            <p class="text-slate-200 text-[10px] leading-tight">Acumula saldo en tu monedero con tu teléfono registrado.</p>
                        </div>

                        <div class="bg-slate-900/90 border border-amber-500/40 p-2.5 rounded-xl space-y-1">
                            <div class="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
                                <i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i> <span>PRECIO DE MAYOREO</span>
                            </div>
                            <p class="text-slate-200 text-[10px] leading-tight">A partir de 10 piezas aplica automáticamente <strong>$${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>.</p>
                        </div>
                    </div>
                </div>

                <div class="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-slate-900">
                    🔒 Transacción protegida SSL • Entrega express Guadalajara
                </div>

            </div>

        </div>
    `;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
};

window.closeProductDetailModal = function() {
    const modal = document.getElementById("productDetailModal");
    if (modal) modal.classList.add("hidden");
    document.body.style.overflow = "auto";
};

function renderPaginationBar(totalPages) {
    const containers = document.querySelectorAll(".pagination-target-bar");
    if (!containers || containers.length === 0) return;

    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPageNumber <= 4) {
            pages = [1, 2, 3, 4, 5, 6, 7, '...', totalPages];
        } else if (currentPageNumber >= totalPages - 4) {
            pages = [1, '...', totalPages - 6, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPageNumber - 2, currentPageNumber - 1, currentPageNumber, currentPageNumber + 1, currentPageNumber + 2, '...', totalPages];
        }
    }

    const htmlPages = pages.map(p => {
        if (p === '...') {
            return `<span class="px-2 text-slate-400 font-mono text-xs select-none">...</span>`;
        }
        const isAct = (p === currentPageNumber);
        const cls = isAct 
            ? "bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
            : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white";
        return `<button onclick="goToPageNumber(${p})" aria-label="Ir a página ${p}" aria-current="${isAct ? 'page' : 'false'}" class="pagination-btn min-w-[48px] min-h-[48px] p-2 rounded-xl border text-xs font-mono transition flex items-center justify-center cursor-pointer ${cls}">${p}</button>`;
    }).join('');

    containers.forEach(box => {
        box.innerHTML = `
            <nav aria-label="Paginación del catálogo" class="flex items-center gap-1.5 flex-wrap justify-center">
                <button onclick="goToPageNumber(${currentPageNumber - 1})" aria-label="Página anterior" ${currentPageNumber <= 1 ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-800"'} class="pagination-btn min-w-[48px] min-h-[48px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-left text-xs" aria-hidden="true"></i>
                </button>
                ${htmlPages}
                <button onclick="goToPageNumber(${currentPageNumber + 1})" aria-label="Página siguiente" ${currentPageNumber >= totalPages ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-800"'} class="pagination-btn min-w-[48px] min-h-[48px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-right text-xs" aria-hidden="true"></i>
                </button>
            </nav>
        `;
    });
}

function goToPageNumber(p) {
    const items = getFilteredList();
    const totalPages = Math.ceil(items.length / productsPerPage) || 1;
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    currentPageNumber = p;
    renderExactCatalogView();
    const target = document.getElementById("catalog-main-content-root");
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetFacets() {
    activeSelectedCategory = 'Todas';
    activeSelectedBrand = 'Todas';
    activeSearchQuery = '';
    const input = document.getElementById("boutiqueSearchInput");
    if (input) input.value = '';
    currentPageNumber = 1;
    renderSidebarFacets();
    renderExactCatalogView();
}

window.updatePDPQuantity = function(delta, regularPrice, wholesalePrice, originalPrice) {
    const input = document.getElementById("pdp-qty-input");
    if (!input) return;
    
    let currentQty = parseInt(input.value) || 1;
    currentQty += delta;
    if (currentQty < 1) currentQty = 1;
    input.value = currentQty;

    const unitPriceDisplay = document.getElementById("pdp-unit-price-display");
    const subtotalDisplay = document.getElementById("pdp-subtotal-display");
    const wholesaleBadge = document.getElementById("pdp-wholesale-badge");

    const isWholesale = currentQty >= 10;
    const activePrice = isWholesale ? wholesalePrice : regularPrice;
    const total = activePrice * currentQty;

    if (wholesaleBadge) {
        if (isWholesale) wholesaleBadge.classList.remove("hidden");
        else wholesaleBadge.classList.add("hidden");
    }

    if (unitPriceDisplay) {
        unitPriceDisplay.innerHTML = `$${activePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span class="text-xs font-normal text-slate-300">MXN c/u</span>`;
    }

    if (subtotalDisplay) {
        subtotalDisplay.innerText = `Subtotal: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
    }
};

window.executeAddToCartPDP = function(sku) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const prod = all.find(p => p.sku === sku);
    if (!prod) {
        alert("⚠️ No se encontró la información del producto.");
        return;
    }
    const cat = prod.categoria_clasificada || 'accesorios_perifericos';
    const title = prod.nombre || prod.descripcion_completa || sku;
    const price = prod.precio_mxn || prod.precio || 0;
    const wholesalePrice = prod.precio_mayoreo_10pzs || (price * 0.93);
    const img = `./assets/img/catalog/${cat}/${sku}.jpg`;

    const input = document.getElementById("pdp-qty-input");
    const qty = parseInt(input ? input.value : 1) || 1;
    const activePrice = (qty >= 10) ? wholesalePrice : price;

    addToCartCT(sku, title, activePrice, img, qty);
    closeProductDetailModal();
};

window.executeBuyNowPDP = function(sku) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const prod = all.find(p => p.sku === sku);
    if (!prod) {
        alert("⚠️ No se encontró la información del producto.");
        return;
    }
    const cat = prod.categoria_clasificada || 'accesorios_perifericos';
    const title = prod.nombre || prod.descripcion_completa || sku;
    const price = prod.precio_mxn || prod.precio || 0;
    const wholesalePrice = prod.precio_mayoreo_10pzs || (price * 0.93);
    const img = `./assets/img/catalog/${cat}/${sku}.jpg`;

    const input = document.getElementById("pdp-qty-input");
    const qty = parseInt(input ? input.value : 1) || 1;
    const activePrice = (qty >= 10) ? wholesalePrice : price;

    addToCartCT(sku, title, activePrice, img, qty);
    window.location.href = "checkout.html";
};

window.removeProductFromCart = function(sku) {
    let cart = JSON.parse(localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items') || '[]');
    cart = cart.filter(item => item.sku !== sku);
    localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
    localStorage.setItem('cart_items', JSON.stringify(cart));
    syncBoutiqueCart();
    alert("🗑️ Producto removido de la selección.");
};

window.addToCartCT = function(sku, customTitle, customPrice, customImg, qty = 1) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const prod = all.find(p => p.sku === sku);
    
    const title = customTitle || (prod ? (prod.nombre || prod.descripcion_completa) : sku);
    const price = (customPrice !== undefined && customPrice !== null) ? customPrice : (prod ? (prod.precio_mxn || prod.precio || 0) : 0);
    const cat = prod ? (prod.categoria_clasificada || 'accesorios_perifericos') : 'accesorios_perifericos';
    const img = customImg || (prod ? `./assets/img/catalog/${cat}/${sku}.jpg` : './assets/img/placeholders/acc_placeholder.jpg');

    let cart = [];
    try {
        const raw = localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items') || '[]';
        cart = JSON.parse(raw);
        if (!Array.isArray(cart)) cart = [];
    } catch(e) { cart = []; }

    const existing = cart.find(i => i.sku === sku);
    if (existing) {
        existing.quantity = (parseInt(existing.quantity || existing.qty) || 1) + qty;
        existing.qty = existing.quantity;
        if (!existing.imagen && !existing.image) existing.imagen = img;
        if (!existing.nombre && !existing.title) existing.nombre = title;
    } else {
        cart.push({
            sku: sku,
            nombre: title,
            title: title,
            precio: price,
            price: price,
            quantity: qty,
            qty: qty,
            imagen: img,
            image: img,
            tienda: 'PC Custom Lab'
        });
    }

    try {
        localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
        localStorage.setItem('cart_items', JSON.stringify(cart));
    } catch(e) {}

    syncBoutiqueCart();
    try { window.dispatchEvent(new Event('storage')); } catch(e) {}
    alert(`🛒 ¡(${qty}) ${title} agregado al carrito del ecosistema!`);
};

window.buyNowCT = function(sku, customTitle, customPrice, customImg) {
    window.addToCartCT(sku, customTitle, customPrice, customImg, 1);
    window.location.href = "checkout.html";
};

function syncBoutiqueCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items') || '[]');
        const count = cart.reduce((s, i) => s + (parseInt(i.quantity || i.qty) || 0), 0);
        const total = cart.reduce((s, i) => s + ((parseFloat(i.precio || i.price) || 0) * (parseInt(i.quantity || i.qty) || 0)), 0);
        const bBadge = document.getElementById("boutique-cart-badge");
        const bTotal = document.getElementById("boutique-cart-total");
        if (bBadge) bBadge.innerText = count;
        if (bTotal) bTotal.innerText = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
    } catch(e) {}
}
