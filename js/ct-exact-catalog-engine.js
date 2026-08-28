// =========================================================================
// MOTOR OFICIAL PC CUSTOM LAB (MAQUETACIÓN PERFECTA DE 2 COLUMNAS Y 5X4)
// =========================================================================

let currentViewStyle = 'grid'; // 'grid' (5x4) o 'list'
let currentPageNumber = 1;
const productsPerPage = 20; // 5 filas x 4 columnas

let activeSelectedCategory = 'Todas';
let activeSelectedBrand = 'Todas';
let currentSortCriterion = 'existencia';

document.addEventListener("DOMContentLoaded", () => {
    renderSidebarFacets();
    renderExactCatalogView();
    initLongTailSearchEngine();
});

function setViewStyle(style) {
    currentViewStyle = style;
    const btnList = document.getElementById("btn-view-list");
    const btnGrid = document.getElementById("btn-view-grid");
    
    if (btnList && btnGrid) {
        if (style === 'list') {
            btnList.className = "p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer text-xs";
            btnGrid.className = "p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs";
        } else {
            btnGrid.className = "p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer text-xs";
            btnList.className = "p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs";
        }
    }
    renderExactCatalogView();
}

function getFilteredList() {
    let items = [...(window.PC_COMBOS_DATA || []), ...(window.CT_CATALOG_DATA || [])];

    if (activeSelectedCategory !== 'Todas') {
        items = items.filter(p => {
            const catClasif = (p.categoria_clasificada || '').toLowerCase();
            return catClasif === activeSelectedCategory.toLowerCase();
        });
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
        resultsCountTxt.innerText = `Aparador Principal (${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount})`;
    }

    renderPaginationBar(totalPages);

    if (pageItems.length === 0) {
        container.className = "w-full py-16 text-center text-slate-400 font-mono text-sm bg-slate-900/90 border border-slate-800 rounded-2xl";
        container.innerHTML = `
            <i class="fa-solid fa-box-open text-4xl text-cyan-400 mb-3 block"></i>
            No se encontraron productos con los filtros seleccionados.
            <br><button onclick="resetFacets()" class="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-5 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-lg hover:shadow-cyan-500/30">Limpiar Filtros</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        // CUADRÍCULA DESPEJADA 5 FILAS X 4 COLUMNAS (20 ARTÍCULOS)
        container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const localImg = p.img || `assets/img/catalog/${p.categoria_clasificada}/${sku}.jpg`;

            return `
                <div class="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-3.5 flex flex-col justify-between transition group shadow-xl hover:shadow-cyan-500/10 relative overflow-hidden text-slate-100">
                    <!-- Badge Promoción -->
                    <div class="absolute -top-7 -left-7 w-16 h-16 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow-md z-10">
                        <span class="text-[7.5px] font-black text-white uppercase tracking-tighter">-25% DTO</span>
                    </div>

                    <button class="absolute top-2.5 right-2.5 text-slate-500 hover:text-pink-400 transition text-sm z-10 cursor-pointer" title="Favoritos">
                        <i class="fa-regular fa-heart"></i>
                    </button>

                    <div>
                        <!-- Fotografía Real con Clic a PDP -->
                        <div onclick="openProductDetailModal('${sku}')" class="w-full h-36 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-center p-2 mb-2.5 relative group-hover:border-cyan-500/40 transition cursor-pointer">
                            <img 
                                src="${localImg}" 
                                alt="${title}" 
                                width="150" 
                                height="150" 
                                loading="lazy" 
                                class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                                onerror="this.onerror=null; this.src='https://static.ctonline.mx/imagenes/' + (p.sku || '') + '/' + (p.sku || '') + '_400.jpg';"
                            />
                        </div>

                        <!-- Precios de Contado y Mayoreo -->
                        <div class="text-center mb-1.5">
                            <span class="text-sm font-black text-emerald-400 block font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <div class="flex items-center justify-center gap-1.5 text-[9.5px] font-mono">
                                <span class="text-slate-500 line-through">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                <span class="text-amber-400 font-bold">Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div class="text-center text-[9px] text-cyan-400 font-mono font-bold mb-1 flex items-center justify-center gap-1">
                            <i class="fa-solid fa-truck-bolt text-[10px]"></i> Disponible Mostrador GDL
                        </div>

                        <!-- Título con Clic a PDP -->
                        <h4 onclick="openProductDetailModal('${sku}')" class="text-slate-200 text-xs font-semibold text-center line-clamp-2 leading-tight hover:text-cyan-300 transition mb-1 cursor-pointer" title="${title}">
                            ${title}
                        </h4>

                        <div class="text-center text-[9px] font-mono text-slate-400 mb-2">
                            <span>SKU: ${sku}</span>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="pt-1 flex gap-1.5">
                        <button 
                            onclick="openProductDetailModal('${sku}')" 
                            class="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold py-1.5 rounded-xl text-[11px] uppercase transition cursor-pointer border border-slate-700"
                        >
                            <span>Ficha</span>
                        </button>
                        <button 
                            onclick="buyNowCT('${sku}', '${title}', ${price}, '${localImg}')" 
                            class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-1.5 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition active:scale-95 shadow-md cursor-pointer"
                        >
                            <span>Comprar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        container.className = "flex flex-col gap-3.5 pb-2";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.33);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const usdPrice = (price / 19.50).toFixed(2);
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const localImg = p.img || `assets/img/catalog/${p.categoria_clasificada}/${sku}.jpg`;
            const desc = p.descripcion_completa || p.desc || '';

            return `
                <div class="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-xl relative overflow-hidden text-slate-100">
                    <div class="absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow z-10">
                        <span class="text-[7px] font-black text-white uppercase">-25%</span>
                    </div>

                    <div onclick="openProductDetailModal('${sku}')" class="w-full md:w-32 h-28 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-center p-2 shrink-0 relative cursor-pointer">
                        <img 
                            src="${localImg}" 
                            alt="${title}" 
                            width="110" 
                            height="110" 
                            loading="lazy" 
                            class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                            onerror="this.onerror=null; this.src='https://static.ctonline.mx/imagenes/' + (p.sku || '') + '/' + (p.sku || '') + '_400.jpg';"
                        />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 onclick="openProductDetailModal('${sku}')" class="text-cyan-300 font-bold text-sm mb-1 hover:text-cyan-200 transition leading-snug cursor-pointer">
                            ${title}
                        </h4>
                        <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1">
                            <span>SKU: ${sku}</span>
                            <span>•</span>
                            <span class="text-emerald-400 font-bold">20% Neto Libre Garantizado</span>
                        </div>
                        <p class="text-slate-400 text-xs leading-relaxed line-clamp-2">${desc}</p>
                    </div>

                    <div class="w-full md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0 text-right">
                        <div class="w-full mb-1.5">
                            <span class="text-[10px] text-slate-500 line-through block font-mono">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-base font-black text-emerald-400 leading-tight font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </div>
                            <span class="text-[9.5px] text-slate-400 block font-mono">$${usdPrice} USD • Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div class="flex items-center gap-2 w-full">
                            <button onclick="openProductDetailModal('${sku}')" class="p-2.5 rounded-xl border border-slate-800 bg-slate-800 hover:bg-slate-700 text-cyan-300 transition text-xs font-bold" title="Ficha Técnica">
                                <i class="fa-solid fa-file-lines"></i>
                            </button>
                            <button 
                                onclick="addToCartCT('${sku}', '${title}', ${price}, '${localImg}')" 
                                class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer uppercase"
                            >
                                <span>Agregar</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// =========================================================================
// BARRA LATERAL IZQUIERDA: 2 BLOQUES + BESTSELLERS INTEGRADOS + VER TODO
// =========================================================================
function renderSidebarFacets() {
    const root = document.getElementById("sidebar-facets-root");
    if (!root) return;

    // Bloque 1: Componentes Clave de Ensamble
    const assemblyCategories = [
        { id: 'Todas', name: 'Todas las Categorías', count: 16122, icon: 'fa-layer-group' },
        { id: 'tarjetas_madre', name: 'Tarjetas Madre (Motherboards)', count: 111, icon: 'fa-chess-board' },
        { id: 'procesadores', name: 'Procesadores (CPUs Intel/AMD)', count: 691, icon: 'fa-microchip' },
        { id: 'memorias_ram', name: 'Memorias RAM (DDR4/DDR5)', count: 597, icon: 'fa-memory' },
        { id: 'discos_duros', name: 'Discos Duros & SSD NVMe', count: 484, icon: 'fa-hard-drive' },
        { id: 'gabinetes', name: 'Gabinetes & Chasis Gamer', count: 402, icon: 'fa-server' },
        { id: 'fuentes_energia', name: 'Fuentes de Poder & UPS', count: 80, icon: 'fa-plug-circle-bolt' },
        { id: 'tarjetas_de_video', name: 'Tarjetas de Video (GPUs)', count: 61, icon: 'fa-gamepad' },
        { id: 'enfriamiento', name: 'Enfriamiento Líquido/Aire', count: 228, icon: 'fa-snowflake' },
        { id: 'monitores', name: 'Monitores & Pantallas PC', count: 623, icon: 'fa-desktop' }
    ];

    // Bloque 2: Complementos, Periféricos y Software
    const complementCategories = [
        { id: 'accesorios_perifericos', name: 'Teclados, Mouse & Periféricos', count: 4593, icon: 'fa-keyboard' },
        { id: 'conectividad_redes', name: 'Conectividad & Routers WiFi', count: 584, icon: 'fa-network-wired' },
        { id: 'software', name: 'Software & Licencias Windows/Office', count: 580, icon: 'fa-compact-disc' },
        { id: 'telefonia_seguridad', name: 'Videovigilancia CCTV & Alarmas', count: 849, icon: 'fa-video' },
        { id: 'impresoras', name: 'Impresoras & Multifuncionales', count: 416, icon: 'fa-print' },
        { id: 'consumibles', name: 'Tintas, Tóner & Consumibles', count: 592, icon: 'fa-fill-drip' },
        { id: 'equipos_de_marca', name: 'Laptops & Equipos de Marca', count: 27, icon: 'fa-laptop' },
        { id: 'punto_de_venta', name: 'Punto de Venta (POS)', count: 156, icon: 'fa-barcode' },
        { id: 'electronica_consumo', name: 'Smart TVs & Audio', count: 728, icon: 'fa-tv' },
        { id: 'linea_blanca', name: 'Climatización & Línea Blanca', count: 56, icon: 'fa-fan' }
    ];

    // Obtener los 3 más vendidos dinámicos según la categoría activa
    const all = [...(window.PC_COMBOS_DATA || []), ...(window.CT_CATALOG_DATA || [])];
    let topItems = all.filter(p => {
        if (activeSelectedCategory === 'Todas') return true;
        return (p.categoria_clasificada || '').toLowerCase() === activeSelectedCategory.toLowerCase();
    }).slice(0, 3);

    root.innerHTML = `
        <div class="bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 text-white p-3 rounded-t-2xl font-bold text-xs uppercase flex items-center justify-between shadow-lg">
            <span class="flex items-center gap-2 text-cyan-300 font-mono"><i class="fa-solid fa-sliders text-cyan-400"></i> Filtros de Ensamble</span>
            <span class="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">16,122 Items</span>
        </div>

        <div class="p-3.5 bg-slate-900/95 border-x border-b border-slate-800 rounded-b-2xl text-slate-300 text-xs space-y-4 shadow-2xl flex flex-col justify-between">
            
            <div class="flex gap-2">
                <button onclick="renderExactCatalogView()" class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 rounded-xl text-[11px] uppercase transition cursor-pointer shadow">
                    Aplicar
                </button>
                <button onclick="resetFacets()" class="flex-1 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 font-bold py-2 rounded-xl text-[11px] uppercase transition cursor-pointer">
                    Limpiar
                </button>
            </div>

            <!-- BLOQUE 1: COMPONENTES CLAVE DE ENSAMBLE -->
            <div class="border-b border-slate-800 pb-3">
                <h4 class="font-bold text-cyan-300 mb-2 text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <i class="fa-solid fa-microchip text-cyan-400"></i> 1. Componentes Clave
                </h4>
                <div class="space-y-1 text-slate-400">
                    ${assemblyCategories.map(c => `
                        <label class="flex items-center justify-between cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60 transition">
                            <span class="flex items-center gap-2 truncate">
                                <input type="radio" name="cat_facet" ${activeSelectedCategory === c.id ? 'checked' : ''} onchange="activeSelectedCategory='${c.id}'; currentPageNumber=1; renderSidebarFacets(); renderExactCatalogView();" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer shrink-0" />
                                <i class="fa-solid ${c.icon} text-[11px] text-slate-400 w-3 text-center shrink-0"></i>
                                <span class="truncate text-xs ${activeSelectedCategory === c.id ? 'font-bold text-cyan-300' : ''}">${c.name}</span>
                            </span>
                            <span class="text-[10px] text-slate-400 font-mono">(${c.count})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- BLOQUE 2: COMPLEMENTOS, PERIFÉRICOS Y SOFTWARE -->
            <div class="border-b border-slate-800 pb-3">
                <h4 class="font-bold text-amber-300 mb-2 text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <i class="fa-solid fa-puzzle-piece text-amber-400"></i> 2. Complementos & Redes
                </h4>
                <div class="space-y-1 text-slate-400 max-h-56 overflow-y-auto pr-1">
                    ${complementCategories.map(c => `
                        <label class="flex items-center justify-between cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60 transition">
                            <span class="flex items-center gap-2 truncate">
                                <input type="radio" name="cat_facet" ${activeSelectedCategory === c.id ? 'checked' : ''} onchange="activeSelectedCategory='${c.id}'; currentPageNumber=1; renderSidebarFacets(); renderExactCatalogView();" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer shrink-0" />
                                <i class="fa-solid ${c.icon} text-[11px] text-slate-400 w-3 text-center shrink-0"></i>
                                <span class="truncate text-xs ${activeSelectedCategory === c.id ? 'font-bold text-cyan-300' : ''}">${c.name}</span>
                            </span>
                            <span class="text-[10px] text-slate-400 font-mono">(${c.count})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- BLOQUE 3: LOS 3 MÁS VENDIDOS DE ESTA CATEGORÍA + ENLACE 'VER TODO' -->
            <div class="pt-1 space-y-2.5">
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-amber-400 text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
                        <i class="fa-solid fa-fire text-amber-400"></i> Top 3 Más Vendidos
                    </h4>
                    <span class="text-[9px] text-cyan-400 font-mono font-bold">${activeSelectedCategory.toUpperCase()}</span>
                </div>

                <div class="space-y-2">
                    ${topItems.map((b, idx) => {
                        const sku = b.sku;
                        const title = (b.nombre || b.descripcion_completa || '').replace(/'/g, "&#39;");
                        const price = b.precio_mxn || b.precio;
                        const mayoreo = b.precio_mayoreo_10pzs || (price * 0.93);
                        const img = b.img || `assets/img/catalog/${b.categoria_clasificada}/${sku}.jpg`;
                        const cdn = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;

                        return `
                            <div class="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-2 rounded-xl flex items-center gap-2.5 transition group cursor-pointer" onclick="openProductDetailModal('${sku}')">
                                <div class="w-11 h-11 bg-slate-900 rounded-lg p-1 shrink-0 flex items-center justify-center">
                                    <img src="${img}" alt="${title}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='${cdn}';" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-[11px] font-bold text-slate-200 truncate group-hover:text-cyan-300 transition">${title}</div>
                                    <div class="flex items-center justify-between text-[10px] font-mono">
                                        <span class="text-emerald-400 font-black">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                        <span class="text-amber-400">May: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Enlace Destacado 'Ver Todo' -->
                <button 
                    onclick="activeSelectedCategory='Todas'; currentPageNumber=1; renderSidebarFacets(); renderExactCatalogView(); document.getElementById('catalog-main-content-root').scrollIntoView({behavior:'smooth'});" 
                    class="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-mono font-bold py-2 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow mt-2"
                >
                    <i class="fa-solid fa-layer-group text-xs"></i> <span>Ver Todo el Catálogo</span>
                </button>
            </div>

        </div>
    `;
}

// =========================================================================
// MOTOR DE BÚSQUEDA LONG-TAIL PARA TODO EL CATÁLOGO (16,122 ARTÍCULOS)
// =========================================================================
function initLongTailSearchEngine() {
    const input = document.getElementById("boutiqueSearchInput");
    const box = document.getElementById("boutique-autocomplete-box");
    if (!input || !box) return;

    input.addEventListener("input", (e) => {
        const query = (e.target.value || '').trim().toLowerCase();
        if (query.length < 2) {
            box.classList.add("hidden");
            box.innerHTML = "";
            return;
        }

        const all = [...(window.PC_COMBOS_DATA || []), ...(window.CT_CATALOG_DATA || [])];
        const matches = all.filter(p => {
            const sku = (p.sku || '').toLowerCase();
            const name = (p.nombre || p.descripcion_completa || '').toLowerCase();
            const marca = (p.marca || '').toLowerCase();
            return sku.includes(query) || name.includes(query) || marca.includes(query);
        }).slice(0, 8);

        if (matches.length === 0) {
            box.innerHTML = `
                <div class="p-3 text-center text-slate-400 font-mono text-xs">
                    No se encontraron coincidencias directas para "${query}".
                </div>
            `;
            box.classList.remove("hidden");
            return;
        }

        box.innerHTML = matches.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const img = p.img || `assets/img/catalog/${p.categoria_clasificada}/${sku}.jpg`;
            const cdn = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;

            return `
                <div class="flex items-center justify-between gap-3 p-2 hover:bg-slate-800/80 rounded-xl transition cursor-pointer border-b border-slate-800 last:border-0" onclick="openProductDetailModal('${sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');">
                    <div class="w-10 h-10 bg-slate-950 rounded-lg p-1 shrink-0 flex items-center justify-center">
                        <img src="${img}" alt="${title}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='${cdn}';" />
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                        <div class="text-xs font-bold text-white truncate">${title}</div>
                        <div class="text-[10px] font-mono text-slate-400">SKU: ${sku} • <span class="text-cyan-400">${p.marca || 'CT'}</span></div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-xs font-mono font-black text-emerald-400">$${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                        <span class="text-[9px] font-mono text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded">Ficha</span>
                    </div>
                </div>
            `;
        }).join('');

        box.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !box.contains(e.target)) {
            box.classList.add("hidden");
        }
    });
}

// =========================================================================
// FICHA DE PRODUCTO EN 3 COLUMNAS (PDP - PRODUCT DETAIL PAGE)
// =========================================================================
window.openProductDetailModal = function(sku) {
    const all = [...(window.PC_COMBOS_DATA || []), ...(window.CT_CATALOG_DATA || [])];
    const prod = all.find(p => p.sku === sku);
    if (!prod) return;

    const modal = document.getElementById("productDetailModal");
    const modalContent = document.getElementById("productDetailModalContent");
    if (!modal || !modalContent) return;

    const title = prod.nombre || prod.descripcion_completa;
    const price = prod.precio_mxn || prod.precio;
    const original = prod.precio_original || (price * 1.33);
    const mayoreo = prod.precio_mayoreo_10pzs || (price * 0.93);
    const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
    const localImg = prod.img || `assets/img/catalog/${prod.categoria_clasificada}/${sku}.jpg`;
    const desc = prod.descripcion_completa || '';
    const marca = prod.marca || 'CT';
    const cat = prod.categoria_clasificada || 'Hardware';

    modalContent.innerHTML = `
        <div class="w-full flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-full uppercase">
                    Ficha Técnica Oficial CT
                </span>
                <span class="text-xs font-mono text-slate-400">SKU: <strong>${sku}</strong></span>
            </div>
            <button onclick="closeProductDetailModal()" class="text-slate-400 hover:text-white text-lg p-1 transition cursor-pointer">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- COLUMNA 1 (IZQUIERDA - GALERÍA VISUAL Y FOTOGRAFÍAS REALES) -->
            <div class="lg:col-span-4 flex flex-col gap-3">
                <div class="w-full h-72 sm:h-80 bg-slate-950 border-2 border-cyan-500/40 rounded-2xl flex items-center justify-center p-4 relative shadow-2xl overflow-hidden group">
                    <img 
                        id="pdp-main-image"
                        src="${localImg}" 
                        alt="${title}" 
                        class="w-full h-full object-contain group-hover:scale-110 transition duration-300"
                        onerror="this.onerror=null; this.src='https://static.ctonline.mx/imagenes/' + (p.sku || '') + '/' + (p.sku || '') + '_400.jpg';"
                    />
                    <div class="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-md shadow">
                        -25% Oferta
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2">
                    <button onclick="document.getElementById('pdp-main-image').src='${localImg}'" class="h-16 bg-slate-950 border border-cyan-400 rounded-xl p-1 flex items-center justify-center hover:opacity-80 transition cursor-pointer">
                        <img src="${localImg}" alt="Vista 1" class="w-full h-full object-contain" />
                    </button>
                    <button onclick="document.getElementById('pdp-main-image').src='${cdnImg}'" class="h-16 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center hover:border-cyan-400 transition cursor-pointer">
                        <img src="${cdnImg}" alt="Vista CDN" class="w-full h-full object-contain" />
                    </button>
                    <button onclick="document.getElementById('pdp-main-image').src='assets/img/catalog/gabinete_negro.webp'" class="h-16 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center hover:border-cyan-400 transition cursor-pointer">
                        <img src="assets/img/catalog/gabinete_negro.webp" alt="Gabinete" class="w-full h-full object-contain" />
                    </button>
                    <button onclick="document.getElementById('pdp-main-image').src='assets/img/Female_technician_assembling_gam_202608041518_thumb.webp'" class="h-16 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center hover:border-cyan-400 transition cursor-pointer">
                        <img src="assets/img/Female_technician_assembling_gam_202608041518_thumb.webp" alt="Ensamble" class="w-full h-full object-contain" />
                    </button>
                </div>
            </div>

            <!-- COLUMNA 2 (CENTRO - ESPECIFICACIONES TÉCNICAS Y COMPATIBILIDAD) -->
            <div class="lg:col-span-5 flex flex-col gap-4 text-slate-200">
                <div>
                    <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">Marca Oficial: ${marca}</span>
                    <h2 class="text-base sm:text-xl font-bold text-white leading-snug mb-2">${title}</h2>
                    
                    <div class="flex items-center gap-2 text-xs font-mono text-slate-400 pb-3 border-b border-slate-800">
                        <div class="flex items-center text-amber-400">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </div>
                        <span>(5.0 Calificación Oficial)</span>
                        <span>•</span>
                        <span class="text-emerald-400 font-bold">100% Original Nuevo</span>
                    </div>
                </div>

                <div class="bg-emerald-950/60 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-3">
                    <i class="fa-solid fa-circle-check text-emerald-400 text-xl shrink-0"></i>
                    <div class="text-xs">
                        <strong class="text-emerald-300 block">Disponible en Sucursal Guadalajara</strong>
                        <span class="text-slate-300">Pedro Moreno 501 A, Zona Centro. Retiro en 15 minutos o entrega express.</span>
                    </div>
                </div>

                <div class="space-y-2 text-xs">
                    <h3 class="font-bold text-white uppercase text-xs font-mono flex items-center gap-2">
                        <i class="fa-solid fa-list-check text-cyan-400"></i> Características & Especificaciones
                    </h3>
                    <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-slate-300 leading-relaxed font-sans">
                        <p><strong>Descripción:</strong> ${desc}</p>
                        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                            <div><span class="text-slate-500">Categoría:</span> <strong class="text-cyan-300">${cat.toUpperCase()}</strong></div>
                            <div><span class="text-slate-500">Garantía:</span> <strong class="text-white">48h Directa / 1 Año</strong></div>
                            <div><span class="text-slate-500">Clave CT:</span> <strong class="text-white">${sku}</strong></div>
                            <div><span class="text-slate-500">Embalaje:</span> <strong class="text-white">Caja Sellada Fábrica</strong></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- COLUMNA 3 (DERECHA - PASARELA DE CONVERSIÓN & PRECIOS DINÁMICOS) -->
            <div class="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-2xl">
                
                <div>
                    <div class="border-b border-slate-800 pb-3 space-y-1">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] text-slate-400 font-mono line-through" id="pdp-original-price">
                                Lista: $${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <span id="pdp-wholesale-badge" class="hidden text-[8.5px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                                Mayoreo Activado
                            </span>
                        </div>

                        <div class="text-2xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" id="pdp-unit-price-display">
                            $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span class="text-xs font-normal text-slate-400">MXN c/u</span>
                        </div>

                        <div class="flex justify-between items-center text-[10px] font-mono text-cyan-300 font-bold">
                            <span>Ahorro: -25% Vigente</span>
                            <span class="text-slate-400" id="pdp-subtotal-display">Subtotal: $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <!-- SELECTOR DINÁMICO (+ / -) Y PAPELERA -->
                    <div class="pt-3 space-y-2.5">
                        
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-mono text-slate-300 font-bold">Cantidad:</span>
                            
                            <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl p-1">
                                <button 
                                    type="button" 
                                    onclick="updatePDPQuantity(-1, ${price}, ${mayoreo}, ${original})" 
                                    class="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-90 text-cyan-300 rounded-lg font-mono font-bold flex items-center justify-center transition cursor-pointer text-sm"
                                    title="Disminuir cantidad"
                                >
                                    -
                                </button>
                                
                                <input 
                                    id="pdp-qty-input" 
                                    type="number" 
                                    value="1" 
                                    min="1" 
                                    max="999" 
                                    onchange="updatePDPQuantity(0, ${price}, ${mayoreo}, ${original})" 
                                    class="w-10 bg-transparent text-center text-white font-mono font-bold text-xs outline-none no-arrows"
                                />

                                <button 
                                    type="button" 
                                    onclick="updatePDPQuantity(1, ${price}, ${mayoreo}, ${original})" 
                                    class="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-90 text-cyan-300 rounded-lg font-mono font-bold flex items-center justify-center transition cursor-pointer text-sm"
                                    title="Aumentar cantidad"
                                >
                                    +
                                </button>
                            </div>

                            <button 
                                type="button" 
                                onclick="removeProductFromCart('${sku}'); closeProductDetailModal();" 
                                class="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 hover:bg-red-950/60 text-slate-400 hover:text-red-400 flex items-center justify-center transition cursor-pointer shrink-0" 
                                title="Remover de la selección"
                            >
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>

                        <div class="space-y-2 pt-1">
                            <button 
                                onclick="executeAddToCartPDP('${sku}', '${title}', '${localImg}', ${price}, ${mayoreo})" 
                                class="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow hover:shadow-cyan-500/20"
                            >
                                <i class="fa-solid fa-cart-plus"></i> <span>Agregar al Carrito</span>
                            </button>

                            <button 
                                onclick="executeBuyNowPDP('${sku}', '${title}', '${localImg}', ${price}, ${mayoreo})" 
                                class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-lg cursor-pointer"
                            >
                                <i class="fa-solid fa-bolt"></i> <span>Pagar Ahora (SPEI / MP)</span>
                            </button>
                        </div>

                    </div>

                    <div class="mt-3.5 pt-3 border-t border-slate-800 space-y-2 text-[11px]">
                        <div class="bg-slate-900/90 border border-emerald-500/40 p-2.5 rounded-xl space-y-1">
                            <div class="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                                <i class="fa-solid fa-coins"></i> <span>5% DE CASHBACK</span>
                            </div>
                            <p class="text-slate-300 text-[10px] leading-tight">Acumula saldo en tu monedero con tu teléfono registrado.</p>
                        </div>

                        <div class="bg-slate-900/90 border border-amber-500/40 p-2.5 rounded-xl space-y-1">
                            <div class="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                                <i class="fa-solid fa-boxes-stacked"></i> <span>PRECIO DE MAYOREO</span>
                            </div>
                            <p class="text-slate-300 text-[10px] leading-tight">A partir de 10 piezas aplica automáticamente <strong>$${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>.</p>
                        </div>
                    </div>
                </div>

                <div class="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-slate-900">
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
            return `<span class="px-1 text-slate-500 font-mono text-xs">...</span>`;
        }
        const isAct = (p === currentPageNumber);
        const cls = isAct 
            ? "bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
            : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white";
        return `<button onclick="goToPageNumber(${p})" class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-xs font-mono transition flex items-center justify-center cursor-pointer ${cls}">${p}</button>`;
    }).join('');

    containers.forEach(box => {
        box.innerHTML = `
            <div class="flex items-center gap-1">
                <button onclick="goToPageNumber(${currentPageNumber - 1})" ${currentPageNumber <= 1 ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-800"'} class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-left text-[9px]"></i>
                </button>
                ${htmlPages}
                <button onclick="goToPageNumber(${currentPageNumber + 1})" ${currentPageNumber >= totalPages ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-800"'} class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-right text-[9px]"></i>
                </button>
            </div>
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
        unitPriceDisplay.innerHTML = `$${activePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span class="text-xs font-normal text-slate-400">MXN c/u</span>`;
    }

    if (subtotalDisplay) {
        subtotalDisplay.innerText = `Subtotal: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
    }
};

window.executeAddToCartPDP = function(sku, title, img, regularPrice, wholesalePrice) {
    const input = document.getElementById("pdp-qty-input");
    const qty = parseInt(input ? input.value : 1) || 1;
    const activePrice = (qty >= 10) ? wholesalePrice : regularPrice;
    
    addToCartCT(sku, title, activePrice, img, qty);
    closeProductDetailModal();
};

window.executeBuyNowPDP = function(sku, title, img, regularPrice, wholesalePrice) {
    const input = document.getElementById("pdp-qty-input");
    const qty = parseInt(input ? input.value : 1) || 1;
    const activePrice = (qty >= 10) ? wholesalePrice : regularPrice;
    
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

window.addToCartCT = function(sku, title, price, img, qty = 1) {
    let cart = JSON.parse(localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items') || '[]');
    const existing = cart.find(i => i.sku === sku);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + qty;
        existing.qty = existing.quantity;
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
            image: img
        });
    }
    localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
    localStorage.setItem('cart_items', JSON.stringify(cart));
    syncBoutiqueCart();
    alert(`🛒 ¡(${qty}) ${title} agregado al carrito!`);
};

window.buyNowCT = function(sku, title, price, img) {
    window.addToCartCT(sku, title, price, img, 1);
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
