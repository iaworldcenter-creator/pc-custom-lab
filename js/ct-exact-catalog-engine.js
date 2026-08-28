// =========================================================================
// MOTOR OFICIAL PC CUSTOM LAB (CONCORDANCIA ESTRICTA DE CATEGORÍAS E IMÁGENES)
// =========================================================================

let currentViewStyle = 'grid'; // 'grid' o 'list'
let currentPageNumber = 1;
const productsPerPage = 20;

let activeSelectedCategory = 'Todas';
let activeSelectedBrand = 'Todas';
let currentSortCriterion = 'existencia';

document.addEventListener("DOMContentLoaded", () => {
    renderSidebarFacets();
    renderExactCatalogView();
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
        resultsCountTxt.innerText = `Resultados de búsqueda (${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount})`;
    }

    renderPaginationBar(totalPages);

    if (pageItems.length === 0) {
        container.className = "w-full py-16 text-center text-slate-400 font-mono text-sm";
        container.innerHTML = `
            <i class="fa-solid fa-box-open text-4xl text-cyan-400 mb-3 block"></i>
            No se encontraron productos con los filtros seleccionados.
            <br><button onclick="resetFacets()" class="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-lg hover:shadow-cyan-500/30">Limpiar Filtros</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        container.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 pb-4";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.25);
            const mayoreo = p.precio_mayoreo_10pzs || (price * 0.93);
            const cdnImg = `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const localImg = p.img || `assets/img/catalog/${p.categoria_clasificada}/${sku}.jpg`;

            return `
                <div class="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-3 flex flex-col justify-between transition group shadow-xl hover:shadow-cyan-500/10 relative overflow-hidden text-slate-100">
                    <div class="absolute -top-7 -left-7 w-16 h-16 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow-md z-10">
                        <span class="text-[7.5px] font-black text-white uppercase tracking-tighter">-25% DTO</span>
                    </div>

                    <button class="absolute top-2.5 right-2.5 text-slate-500 hover:text-pink-400 transition text-sm z-10 cursor-pointer" title="Favoritos">
                        <i class="fa-regular fa-heart"></i>
                    </button>

                    <div>
                        <div class="w-full h-32 sm:h-36 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-center p-2 mb-2.5 relative group-hover:border-cyan-500/40 transition">
                            <img 
                                src="${localImg}" 
                                alt="${title}" 
                                width="160" 
                                height="160" 
                                loading="lazy" 
                                class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                                onerror="this.onerror=null; this.src='${cdnImg}'; this.onerror=function(){this.src='assets/img/catalog/gabinete_negro.webp';};"
                            />
                        </div>

                        <div class="text-center mb-1.5">
                            <span class="text-xs sm:text-sm font-black text-emerald-400 block font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <div class="flex items-center justify-center gap-1.5 text-[9px] font-mono">
                                <span class="text-slate-500 line-through">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                <span class="text-amber-400 font-bold">Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div class="text-center text-[9px] text-cyan-400 font-mono font-bold mb-1 flex items-center justify-center gap-1">
                            <i class="fa-solid fa-truck-bolt text-[10px]"></i> Entrega Inmediata GDL
                        </div>

                        <h4 class="text-slate-200 text-xs font-semibold text-center line-clamp-2 leading-tight group-hover:text-cyan-300 transition mb-1" title="${title}">
                            ${title}
                        </h4>

                        <div class="text-center text-[9px] font-mono text-slate-400 mb-2">
                            <span>SKU: ${sku}</span>
                        </div>
                    </div>

                    <div class="pt-1">
                        <button 
                            onclick="buyNowCT('${sku}', '${title}', ${price}, '${localImg}')" 
                            class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 px-2 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md hover:shadow-cyan-500/30 cursor-pointer"
                        >
                            <i class="fa-solid fa-cart-plus text-xs"></i> <span>Comprar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        container.className = "flex flex-col gap-3 pb-4";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.25);
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

                    <div class="w-full md:w-32 h-28 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-center p-2 shrink-0 relative">
                        <img 
                            src="${localImg}" 
                            alt="${title}" 
                            width="120" 
                            height="120" 
                            loading="lazy" 
                            class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                            onerror="this.onerror=null; this.src='${cdnImg}'; this.onerror=function(){this.src='assets/img/catalog/gabinete_negro.webp';};"
                        />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 class="text-cyan-300 font-bold text-sm mb-1 group-hover:text-cyan-200 transition leading-snug cursor-pointer" onclick="buyNowCT('${sku}', '${title}', ${price}, '${localImg}')">
                            ${title}
                        </h4>
                        <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1">
                            <span>SKU: ${sku}</span>
                            <span>•</span>
                            <span>Clave CT: ${sku}</span>
                            <span>•</span>
                            <span class="text-emerald-400 font-bold">Margen Protegido</span>
                        </div>
                        
                        <div class="flex items-center gap-0.5 text-amber-400 text-xs mb-1.5">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </div>

                        <p class="text-slate-400 text-xs leading-relaxed line-clamp-2">${desc}</p>
                    </div>

                    <div class="w-full md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0 text-right">
                        <div class="w-full mb-2">
                            <span class="text-[10px] text-cyan-400 font-mono font-bold block mb-0.5"><i class="fa-solid fa-check"></i> Stock Disponible GDL</span>
                            <span class="text-[10px] text-slate-500 line-through block font-mono">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-base sm:text-lg font-black text-emerald-400 leading-tight font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </div>
                            <span class="text-[10px] text-slate-400 block font-mono">$${usdPrice} USD • Mayoreo: $${mayoreo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div class="flex items-center gap-2 w-full">
                            <button class="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500 transition cursor-pointer" title="Favoritos">
                                <i class="fa-regular fa-heart"></i>
                            </button>
                            <button 
                                onclick="addToCartCT('${sku}', '${title}', ${price}, '${localImg}')" 
                                class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md hover:shadow-cyan-500/30 cursor-pointer uppercase"
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

function renderSidebarFacets() {
    const root = document.getElementById("sidebar-facets-root");
    if (!root) return;

    const catMetaList = [
        { id: 'Todas', name: 'Todas las Categorías', count: 16122, icon: 'fa-layer-group' },
        { id: 'monitores', name: 'Monitores & Pantallas PC', count: 326, icon: 'fa-desktop' },
        { id: 'procesadores', name: 'Procesadores (CPUs)', count: 204, icon: 'fa-microchip' },
        { id: 'tarjetas_madre', name: 'Tarjetas Madre (Motherboards)', count: 174, icon: 'fa-chess-board' },
        { id: 'tarjetas_de_video', name: 'Tarjetas de Video (GPUs)', count: 187, icon: 'fa-gamepad' },
        { id: 'memorias_ram', name: 'Memorias RAM (DDR4 / DDR5)', count: 328, icon: 'fa-memory' },
        { id: 'discos_duros', name: 'Discos Duros & SSD NVMe', count: 784, icon: 'fa-hard-drive' },
        { id: 'fuentes_energia', name: 'Fuentes de Poder & UPS', count: 805, icon: 'fa-plug-circle-bolt' },
        { id: 'gabinetes', name: 'Gabinetes & Chasis Gamer', count: 281, icon: 'fa-server' },
        { id: 'enfriamiento', name: 'Enfriamiento Líquido/Aire', count: 228, icon: 'fa-snowflake' },
        { id: 'impresoras', name: 'Impresoras & Multifuncionales', count: 701, icon: 'fa-print' },
        { id: 'consumibles', name: 'Tintas, Tóner & Consumibles', count: 2017, icon: 'fa-fill-drip' },
        { id: 'conectividad_redes', name: 'Conectividad & Routers WiFi', count: 2027, icon: 'fa-network-wired' },
        { id: 'software', name: 'Software & Licencias', count: 648, icon: 'fa-compact-disc' },
        { id: 'accesorios_perifericos', name: 'Teclados, Mouse & Periféricos', count: 1484, icon: 'fa-keyboard' },
        { id: 'telefonia_seguridad', name: 'Videovigilancia CCTV & Telefonía', count: 352, icon: 'fa-video' },
        { id: 'equipos_de_marca', name: 'Laptops & Computadoras', count: 193, icon: 'fa-laptop' },
        { id: 'punto_de_venta', name: 'Punto de Venta (POS)', count: 564, icon: 'fa-barcode' },
        { id: 'electronica_consumo', name: 'Smart TVs & Audio', count: 209, icon: 'fa-tv' },
        { id: 'linea_blanca', name: 'Climatización & Línea Blanca', count: 26, icon: 'fa-fan' },
        { id: 'outlet_remates', name: 'Remates & Liquidaciones', count: 5, icon: 'fa-tags' }
    ];

    const brandCounts = { 'ASUS': 218, 'INTEL': 142, 'AMD': 116, 'KINGSTON': 287, 'ACTECK': 213, 'MSI': 98, 'GIGABYTE': 124, 'TRIPP-LITE': 86, 'ADATA': 94, 'CORSAIR': 76, 'LOGITECH': 115, 'SAMSUNG': 64, 'LG': 58, 'DELL': 72, 'HP': 89, 'LENOVO': 95 };

    root.innerHTML = `
        <div class="bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 text-white p-3.5 rounded-t-2xl font-bold text-xs uppercase flex items-center justify-between shadow-lg">
            <span class="flex items-center gap-2 text-cyan-300 font-mono"><i class="fa-solid fa-sliders text-cyan-400"></i> Filtros de Búsqueda</span>
            <span class="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">16,122 Items</span>
        </div>

        <div class="p-4 bg-slate-900/95 border-x border-b border-slate-800 rounded-b-2xl text-slate-300 text-xs space-y-4 shadow-2xl">
            <div class="flex gap-2">
                <button onclick="renderExactCatalogView()" class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-2 rounded-xl text-[11px] uppercase transition cursor-pointer shadow-md hover:shadow-cyan-500/20">
                    Aplicar Filtros
                </button>
                <button onclick="resetFacets()" class="flex-1 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 font-bold py-2 rounded-xl text-[11px] uppercase transition cursor-pointer">
                    Limpiar
                </button>
            </div>

            <div class="border-b border-slate-800 pb-3">
                <h4 class="font-bold text-white mb-2 text-xs flex items-center gap-1.5 font-mono">
                    <i class="fa-solid fa-tags text-amber-400"></i> Promociones Activas
                </h4>
                <div class="space-y-1.5 text-slate-300">
                    <label class="flex items-center gap-2 cursor-pointer hover:text-cyan-300">
                        <input type="checkbox" checked class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer" /> <span>Descuento de -25% Vigente</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer hover:text-cyan-300">
                        <input type="checkbox" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer" /> <span>Nuevos Lanzamientos</span>
                    </label>
                </div>
            </div>

            <div class="border-b border-slate-800 pb-3">
                <h4 class="font-bold text-white mb-2 text-xs flex items-center gap-1.5 font-mono">
                    <i class="fa-solid fa-microchip text-cyan-400"></i> Categorías (${catMetaList.length})
                </h4>
                <div class="space-y-1 text-slate-400 max-h-72 overflow-y-auto pr-1">
                    ${catMetaList.map(c => `
                        <label class="flex items-center justify-between cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60 transition">
                            <span class="flex items-center gap-2 truncate">
                                <input type="radio" name="cat_facet" ${activeSelectedCategory === c.id ? 'checked' : ''} onchange="activeSelectedCategory='${c.id}'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer shrink-0" />
                                <i class="fa-solid ${c.icon} text-[11px] text-slate-400 w-3 text-center shrink-0"></i>
                                <span class="truncate ${activeSelectedCategory === c.id ? 'font-bold text-cyan-300' : ''}">${c.name}</span>
                            </span>
                            <span class="text-[10px] text-slate-400 font-mono">(${c.count.toLocaleString('es-MX')})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="border-b border-slate-800 pb-3">
                <h4 class="font-bold text-white mb-2 text-xs flex items-center gap-1.5 font-mono">
                    <i class="fa-solid fa-award text-amber-400"></i> Marcas Oficiales
                </h4>
                <div class="space-y-1 text-slate-400 max-h-48 overflow-y-auto pr-1">
                    <label class="flex items-center gap-2 cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60">
                        <input type="radio" name="brand_facet" ${activeSelectedBrand === 'Todas' ? 'checked' : ''} onchange="activeSelectedBrand='Todas'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer" />
                        <span>Todas las Marcas</span>
                    </label>
                    ${Object.entries(brandCounts).map(([b, count]) => `
                        <label class="flex items-center justify-between cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60">
                            <span class="flex items-center gap-2 truncate">
                                <input type="radio" name="brand_facet" ${activeSelectedBrand === b ? 'checked' : ''} onchange="activeSelectedBrand='${b}'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer" />
                                <span class="truncate ${activeSelectedBrand === b ? 'font-bold text-cyan-300' : ''}">${b}</span>
                            </span>
                            <span class="text-[10px] text-slate-400 font-mono">(${count})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div>
                <h4 class="font-bold text-white mb-2 text-xs flex items-center gap-1.5 font-mono">
                    <i class="fa-solid fa-location-dot text-emerald-400"></i> Sucursal & Logística
                </h4>
                <div class="space-y-1 text-slate-400">
                    <label class="flex items-center justify-between cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60">
                        <span class="flex items-center gap-2">
                            <input type="checkbox" checked class="w-3.5 h-3.5 accent-emerald-400 cursor-pointer" />
                            <span>Guadalajara (Pedro Moreno 501 A)</span>
                        </span>
                        <span class="text-[10px] text-emerald-400 font-mono font-bold">(477)</span>
                    </label>
                    <label class="flex items-center justify-between cursor-pointer hover:text-cyan-300 py-1 px-1.5 rounded-lg hover:bg-slate-800/60">
                        <span class="flex items-center gap-2">
                            <input type="checkbox" class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer" />
                            <span>Envío Nacional Express</span>
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">(16,122)</span>
                    </label>
                </div>
            </div>
        </div>
    `;
}

function resetFacets() {
    activeSelectedCategory = 'Todas';
    activeSelectedBrand = 'Todas';
    currentPageNumber = 1;
    renderSidebarFacets();
    renderExactCatalogView();
}

window.addToCartCT = function(sku, title, price, img) {
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
    syncBoutiqueCart();
    alert(`🛒 ¡${title} se agregó a la canasta!`);
};

window.buyNowCT = function(sku, title, price, img) {
    window.addToCartCT(sku, title, price, img);
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
