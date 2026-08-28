// =========================================================================
// MOTOR OFICIAL CT ONLINE (EXACT PIXEL-PERFECT LIST & GRID VIEW)
// =========================================================================

let currentViewStyle = 'grid'; // 'grid' (Imagen 2) o 'list' (Imagen 1)
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
            btnList.style.backgroundColor = '#1d4ed8';
            btnList.style.color = '#ffffff';
            btnGrid.style.backgroundColor = 'transparent';
            btnGrid.style.color = '#64748b';
        } else {
            btnGrid.style.backgroundColor = '#1d4ed8';
            btnGrid.style.color = '#ffffff';
            btnList.style.backgroundColor = 'transparent';
            btnList.style.color = '#64748b';
        }
    }
    renderExactCatalogView();
}

function getFilteredList() {
    let items = [...(window.PC_COMBOS_DATA || []), ...(window.CT_CATALOG_DATA || [])];

    // Filtro Categoría
    if (activeSelectedCategory !== 'Todas') {
        items = items.filter(p => (p.categoria_ct || p.categoria || '').toLowerCase().includes(activeSelectedCategory.toLowerCase()));
    }

    // Filtro Marca
    if (activeSelectedBrand !== 'Todas') {
        items = items.filter(p => (p.marca || '').toUpperCase() === activeSelectedBrand.toUpperCase());
    }

    // Ordenamiento
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
            <i class="fa-solid fa-box-open text-4xl text-blue-500 mb-3 block"></i>
            No se encontraron productos con los filtros seleccionados.
            <br><button onclick="resetFacets()" class="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs uppercase cursor-pointer">Limpiar Filtros</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        // =========================================================================
        // VISTA 2: CUADRÍCULA / GRUPOS (IMAGEN 2)
        // =========================================================================
        container.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 pb-4";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.25);
            const img = p.local_img || p.img || `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const marca = p.marca || 'CT';

            return `
                <div class="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between transition group shadow-sm hover:shadow-md relative overflow-hidden text-slate-800">
                    <div class="absolute -top-7 -left-7 w-16 h-16 bg-red-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow z-10">
                        <span class="text-[7.5px] font-bold text-white uppercase tracking-tighter">Promoción</span>
                    </div>

                    <button class="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition text-sm z-10 cursor-pointer" title="Favoritos">
                        <i class="fa-regular fa-heart"></i>
                    </button>

                    <div>
                        <div class="w-full h-32 sm:h-36 bg-white flex items-center justify-center p-2 mb-2 relative">
                            <img 
                                src="${img}" 
                                alt="${title}" 
                                width="160" 
                                height="160" 
                                loading="lazy" 
                                class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                                onerror="this.onerror=null; this.src='https://iaworldcenter-creator.github.io/pc-custom-lab/assets/img/mascota_tigre_thumb.webp';"
                            />
                        </div>

                        <div class="text-center mb-1">
                            <span class="text-xs sm:text-sm font-black text-slate-900 block font-mono">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <span class="text-[9px] text-slate-400 line-through font-mono">
                                $${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                        </div>

                        <div class="text-center text-[9px] text-emerald-600 font-bold mb-1 flex items-center justify-center gap-1">
                            <i class="fa-solid fa-cloud-arrow-down text-[10px]"></i> Entrega Inmediata GDL
                        </div>

                        <h4 class="text-slate-700 text-xs font-medium text-center line-clamp-2 leading-tight group-hover:text-blue-600 transition mb-1" title="${title}">
                            ${title}
                        </h4>

                        <div class="text-center text-[9px] font-mono text-slate-500 mb-2">
                            <span>${sku}</span>
                        </div>
                    </div>

                    <div class="pt-1">
                        <button 
                            onclick="buyNowCT('${sku}', '${title}', ${price}, '${img}')" 
                            class="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-1.5 px-2 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer"
                        >
                            <span>Comprar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // =========================================================================
        // VISTA 1: LISTADO HORIZONTAL (IMAGEN 1)
        // =========================================================================
        container.className = "flex flex-col gap-3 pb-4";
        container.innerHTML = pageItems.map(p => {
            const sku = p.sku;
            const title = (p.nombre || p.descripcion_completa || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;');
            const price = p.precio_mxn || p.precio;
            const original = p.precio_original || (price * 1.25);
            const usdPrice = (price / 19.50).toFixed(2);
            const img = p.local_img || p.img || `https://static.ctonline.mx/imagenes/${sku}/${sku}_400.jpg`;
            const marca = p.marca || 'CT';
            const desc = p.descripcion_completa || p.desc || '';

            return `
                <div class="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-sm hover:shadow relative overflow-hidden text-slate-800">
                    <div class="absolute -top-6 -left-6 w-14 h-14 bg-red-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow z-10">
                        <span class="text-[7px] font-bold text-white uppercase">Promo</span>
                    </div>

                    <div class="w-full md:w-32 h-28 bg-white flex items-center justify-center p-2 shrink-0 relative">
                        <img 
                            src="${img}" 
                            alt="${title}" 
                            width="120" 
                            height="120" 
                            loading="lazy" 
                            class="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                            onerror="this.onerror=null; this.src='https://iaworldcenter-creator.github.io/pc-custom-lab/assets/img/mascota_tigre_thumb.webp';"
                        />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 class="text-blue-700 font-bold text-sm mb-1 group-hover:underline transition leading-snug cursor-pointer" onclick="buyNowCT('${sku}', '${title}', ${price}, '${img}')">
                            ${title}
                        </h4>
                        <div class="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-1">
                            <span>SKU: ${sku}</span>
                            <span>•</span>
                            <span>Clave CT: ${sku}</span>
                        </div>
                        
                        <div class="flex items-center gap-0.5 text-red-600 text-xs mb-1.5">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </div>

                        <p class="text-slate-600 text-xs leading-relaxed line-clamp-2">${desc}</p>
                    </div>

                    <div class="w-full md:w-56 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 shrink-0 text-right">
                        <div class="w-full mb-2">
                            <span class="text-[10px] text-emerald-600 font-bold block mb-0.5"><i class="fa-solid fa-check"></i> Disponible en Sucursal</span>
                            <span class="text-[10px] text-slate-400 line-through block font-mono">$${original.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            <div class="text-base sm:text-lg font-black text-slate-900 leading-tight font-mono">
                                $${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </div>
                            <span class="text-[10px] text-slate-500 block font-mono">$${usdPrice} USD</span>
                        </div>

                        <div class="flex items-center gap-2 w-full">
                            <button class="p-2 rounded border border-slate-200 text-slate-400 hover:text-red-500 transition cursor-pointer" title="Favoritos">
                                <i class="fa-regular fa-heart"></i>
                            </button>
                            <button 
                                onclick="addToCartCT('${sku}', '${title}', ${price}, '${img}')" 
                                class="flex-1 bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer uppercase"
                            >
                                <span>Agregar al carrito</span>
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
            return `<span class="px-1 text-slate-400 font-mono text-xs">...</span>`;
        }
        const isAct = (p === currentPageNumber);
        const cls = isAct 
            ? "bg-[#1e40af] text-white font-bold border-[#1e40af]" 
            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100";
        return `<button onclick="goToPageNumber(${p})" class="w-6 h-6 sm:w-7 sm:h-7 rounded border text-xs font-mono transition flex items-center justify-center cursor-pointer ${cls}">${p}</button>`;
    }).join('');

    containers.forEach(box => {
        box.innerHTML = `
            <div class="flex items-center gap-1">
                <button onclick="goToPageNumber(${currentPageNumber - 1})" ${currentPageNumber <= 1 ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-100"'} class="w-6 h-6 sm:w-7 sm:h-7 rounded bg-white border border-slate-300 text-slate-600 text-xs flex items-center justify-center">
                    <i class="fa-solid fa-chevron-left text-[9px]"></i>
                </button>
                ${htmlPages}
                <button onclick="goToPageNumber(${currentPageNumber + 1})" ${currentPageNumber >= totalPages ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="cursor-pointer hover:bg-slate-100"'} class="w-6 h-6 sm:w-7 sm:h-7 rounded bg-white border border-slate-300 text-slate-600 text-xs flex items-center justify-center">
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

    const brandCounts = { 'ASUS': 218, 'INTEL': 142, 'AMD': 116, 'KINGSTON': 287, 'ACTECK': 213, 'MSI': 98, 'GIGABYTE': 124, 'TRIPP-LITE': 86, 'ADATA': 94 };
    const catCounts = { 'Procesadores': 185, 'Tarjetas Madre': 240, 'Tarjetas de Video': 92, 'Memorias RAM': 310, 'Discos SSD/HDD': 260, 'Gabinetes': 145, 'Fuentes de Poder': 130 };

    root.innerHTML = `
        <div class="bg-[#1e3a8a] text-white p-3 rounded-t-lg font-bold text-xs uppercase flex items-center gap-2">
            <i class="fa-solid fa-sliders text-sm"></i> Filtros de búsqueda
        </div>

        <div class="p-3 bg-white border-x border-b border-slate-200 rounded-b-lg text-slate-700 text-xs space-y-4">
            <div class="flex gap-2">
                <button onclick="renderExactCatalogView()" class="flex-1 bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-bold py-1.5 rounded text-[11px] uppercase transition cursor-pointer">
                    Aplicar Filtros
                </button>
                <button onclick="resetFacets()" class="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-1.5 rounded text-[11px] uppercase transition cursor-pointer">
                    Limpiar Filtros
                </button>
            </div>

            <div class="border-b border-slate-100 pb-3">
                <h4 class="font-bold text-slate-900 mb-1.5 text-xs">Promociones</h4>
                <div class="space-y-1 text-slate-600">
                    <label class="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                        <input type="checkbox" checked class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" /> Promociones
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                        <input type="checkbox" class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" /> Nuevos
                    </label>
                </div>
            </div>

            <div class="border-b border-slate-100 pb-3">
                <h4 class="font-bold text-slate-900 mb-1.5 text-xs">Categorías</h4>
                <div class="space-y-1 text-slate-600 max-h-48 overflow-y-auto pr-1">
                    <label class="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                        <input type="radio" name="cat_facet" ${activeSelectedCategory === 'Todas' ? 'checked' : ''} onchange="activeSelectedCategory='Todas'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" />
                        <span>Todas</span>
                    </label>
                    ${Object.entries(catCounts).map(([cat, count]) => `
                        <label class="flex items-center justify-between cursor-pointer hover:text-blue-700">
                            <span class="flex items-center gap-2 truncate">
                                <input type="radio" name="cat_facet" ${activeSelectedCategory === cat ? 'checked' : ''} onchange="activeSelectedCategory='${cat}'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" />
                                <span class="truncate">${cat}</span>
                            </span>
                            <span class="text-[10px] text-slate-400 font-mono">(${count})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="border-b border-slate-100 pb-3">
                <h4 class="font-bold text-slate-900 mb-1.5 text-xs">Marcas</h4>
                <div class="space-y-1 text-slate-600 max-h-48 overflow-y-auto pr-1">
                    <label class="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                        <input type="radio" name="brand_facet" ${activeSelectedBrand === 'Todas' ? 'checked' : ''} onchange="activeSelectedBrand='Todas'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" />
                        <span>Todas</span>
                    </label>
                    ${Object.entries(brandCounts).map(([b, count]) => `
                        <label class="flex items-center justify-between cursor-pointer hover:text-blue-700">
                            <span class="flex items-center gap-2 truncate">
                                <input type="radio" name="brand_facet" ${activeSelectedBrand === b ? 'checked' : ''} onchange="activeSelectedBrand='${b}'; currentPageNumber=1; renderExactCatalogView();" class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" />
                                <span class="truncate">${b}</span>
                            </span>
                            <span class="text-[10px] text-slate-400 font-mono">(${count})</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div>
                <h4 class="font-bold text-slate-900 mb-1.5 text-xs">Sucursales</h4>
                <div class="space-y-1 text-slate-600">
                    <label class="flex items-center justify-between cursor-pointer hover:text-blue-700">
                        <span class="flex items-center gap-2">
                            <input type="checkbox" checked class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" />
                            <span>Guadalajara (Pedro Moreno 501 A)</span>
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">(477)</span>
                    </label>
                    <label class="flex items-center justify-between cursor-pointer hover:text-blue-700">
                        <span class="flex items-center gap-2">
                            <input type="checkbox" class="w-3.5 h-3.5 accent-[#1e40af] cursor-pointer" />
                            <span>Envío Nacional Express</span>
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">(16,159)</span>
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
    if (typeof syncBoutiqueCart === 'function') syncBoutiqueCart();
    alert(`🛒 ¡${title} se agregó a la canasta!`);
};

window.buyNowCT = function(sku, title, price, img) {
    window.addToCartCT(sku, title, price, img);
    window.location.href = "checkout.html";
};
