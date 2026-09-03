// =========================================================================
// MOTOR UNIVERSAL BILINGÜE PC CUSTOM LAB (17,490 PRODUCTOS EN 60 VITRINAS)
// ARQUITECTURA ZERO-BLANK F5 + SIDEBAR STICKY CON 7 DEPARTAMENTOS MAESTROS
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
let currentSortCriterion = 'destacados';
let isFullCatalogLoaded = false;
window.activeCurrency = localStorage.getItem('pc_custom_currency') || 'MXN';

// Definición Oficial de los 7 Departamentos Maestros en Acordeón Colapsable
const MASTER_DEPARTMENTS = [
    {
        id: 'master_ensamble',
        name: '1. COMPUTADORAS Y ENSAMBLE',
        icon: 'fa-microchip',
        deptIds: [
            'procesadores',
            'tarjetas_madre',
            'memorias_ram_pc',
            'gabinetes',
            'tarjetas_video',
            'enfriamiento',
            'fuentes_energia',
            'ssds_m2_nvme',
            'discos_duros_hdd_internos',
            'monitores_pantallas',
            'teclados',
            'ratones_mouse',
            'combos_teclado_mouse'
        ]
    },
    {
        id: 'master_equipos',
        name: '2. EQUIPOS COMPLETOS Y LAPTOPS',
        icon: 'fa-laptop',
        deptIds: [
            'computadoras_ensambladas',
            'mini_pcs_nuc',
            'laptops_portatiles',
            'computadoras_all_in_one',
            'servidores_enterprise'
        ]
    },
    {
        id: 'master_redes',
        name: '3. REDES Y TELECOMUNICACIONES',
        icon: 'fa-network-wired',
        deptIds: [
            'switches_red',
            'routers_access_points',
            'cableado_estructurado',
            'antenas_radioenlaces',
            'fibra_optica_transceivers',
            'racks_gabinetes_servidor'
        ]
    },
    {
        id: 'master_seguridad',
        name: '4. SEGURIDAD Y CCTV',
        icon: 'fa-shield-halved',
        deptIds: [
            'camaras_seguridad_cctv',
            'grabadores_dvr_nvr',
            'control_acceso_biometricos',
            'alarmas_sensores_seguridad',
            'telefonia_conmutadores'
        ]
    },
    {
        id: 'master_impresion',
        name: '5. IMPRESIÓN Y DIGITALIZACIÓN',
        icon: 'fa-print',
        deptIds: [
            'impresoras_multifuncionales',
            'toners_laser',
            'tintas_cartuchos',
            'plotters_gran_formato',
            'etiquetas_ribbons'
        ]
    },
    {
        id: 'master_energia',
        name: '6. ENERGÍA Y PROTECCIÓN',
        icon: 'fa-car-battery',
        deptIds: [
            'no_breaks_ups',
            'reguladores_voltaje'
        ]
    },
    {
        id: 'master_accesorios',
        name: '7. ACCESORIOS Y MANTENIMIENTO',
        icon: 'fa-boxes-stacked',
        deptIds: [
            'limpieza_mantenimiento',
            'cables_adaptadores',
            'mochilas_fundas_maletines',
            'soportes_ergonomia',
            'hubs_docks_estaciones',
            'gaming_consolas_sillas',
            'tarjetas_microsd',
            'tarjetas_sd',
            'memorias_usb_pendrives',
            'discos_duros_externos',
            'ssds_externos_portatiles',
            'memorias_ram_laptop',
            'memorias_ram_servidor',
            'diademas_headsets',
            'bocinas_sonido',
            'microfonos',
            'proyectores_presentacion',
            'sistemas_operativos',
            'ofimatica_productividad',
            'antivirus_seguridad_digital',
            'punto_de_venta',
            'smartphones_celulares',
            'tablets_ipads',
            'accesorios_perifericos'
        ]
    }
];

window.setCurrencyDisplay = function(curr) {
    window.activeCurrency = curr;
    localStorage.setItem('pc_custom_currency', curr);
    const btnMxn = document.getElementById('currencyToggleMXN');
    const btnUsd = document.getElementById('currencyToggleUSD');
    if (btnMxn && btnUsd) {
        if (curr === 'USD') {
            btnUsd.className = 'px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black transition cursor-pointer';
            btnMxn.className = 'px-2 py-0.5 rounded-full text-slate-300 hover:text-white transition cursor-pointer';
        } else {
            btnMxn.className = 'px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black transition cursor-pointer';
            btnUsd.className = 'px-2 py-0.5 rounded-full text-slate-300 hover:text-white transition cursor-pointer';
        }
    }
    renderExactCatalogView();
    syncBoutiqueCart();
};

window.formatPriceDisplay = function(priceMxn, priceUsd) {
    const isUsd = window.activeCurrency === 'USD';
    const val = isUsd ? (priceUsd || ((priceMxn || 0) / 19.50)) : (priceMxn || 0);
    return `$${Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Normalizador universal de objetos (soporta formato compacto y completo)
window.normalizeProductItem = function(p) {
    if (!p) return null;
    const priceMxn = p.precio_mxn || p.p || p.precio || 0;
    const priceUsd = p.precio_usd || p.u || (priceMxn / 19.50);
    const orig = p.precio_original || p.o || (priceMxn * 1.3333);
    const may = p.precio_mayoreo_10pzs || p.y || (priceMxn * 0.90);
    const mayUsd = p.precio_mayoreo_usd || (may / 19.50);
    const sku = p.sku || p.s || p.clave || '';
    const cat = p.categoria_clasificada || p.c || 'accesorios_perifericos';
    const name = p.nombre || p.n || p.descripcion_completa || '';
    const desc = p.descripcion_completa || p.d || name;
    const marca = p.marca || p.m || 'Generica';
    const isAgotado = (p.agotado === true || p.a === 1);
    const hasImg = (p.has_verified_image === true || p.i === 1);
    const subLabel = p.subgrupo_label || '';

    return {
        sku,
        cat,
        name,
        desc,
        marca,
        priceMxn,
        priceUsd,
        orig,
        may,
        mayUsd,
        isAgotado,
        hasImg,
        subLabel
    };
};

function stripAccents(text) {
    if (!text) return "";
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

const SYNONYM_DICTIONARY = {
    "ram": ["ram", "ddr4", "ddr5", "ddr3", "dimm", "sodimm", "udimm", "rdimm"],
    "memoria": ["memoria", "memorias"],
    "memorias": ["memoria", "memorias"],
    "disco": ["disco duro", "ssd", "nvme", "disco solido", "disco sólido", "hdd"],
    "discos": ["disco duro", "ssd", "nvme", "disco solido", "hdd"],
    "solido": ["ssd", "nvme", "disco solido", "m.2"],
    "ssd": ["ssd", "nvme", "disco solido", "m.2"],
    "fuente": ["fuente de poder", "power supply", "fuente atx", "fuente cert", "psu", "80 plus"],
    "fuentes": ["fuente de poder", "power supply", "fuente atx", "fuente cert", "psu", "80 plus"],
    "psu": ["fuente de poder", "power supply", "psu"],
    "gabinete": ["gabinete", "chasis", "case gamer", "media torre", "mini torre"],
    "gabinetes": ["gabinete", "chasis", "case gamer"],
    "procesador": ["procesador", "cpu", "ryzen", "core i", "core ultra", "intel core", "amd ryzen"],
    "procesadores": ["procesador", "cpu", "ryzen", "core i", "core ultra", "intel core", "amd ryzen"],
    "cpu": ["procesador", "cpu", "ryzen", "core i", "core ultra"],
    "grafica": ["tarjeta de video", "tarjeta grafica", "gpu", "geforce rtx", "geforce gtx", "radeon rx"],
    "graficas": ["tarjeta de video", "tarjeta grafica", "gpu"],
    "gpu": ["tarjeta de video", "gpu", "rtx", "gtx", "radeon rx"],
    "video": ["tarjeta de video", "gpu", "rtx", "gtx", "radeon rx"],
    "tarjeta": ["tarjeta madre", "tarjeta de video", "tarjeta sd", "motherboard", "gpu"],
    "tarjetas": ["tarjeta madre", "tarjeta de video", "tarjeta sd", "motherboard", "gpu"],
    "madre": ["tarjeta madre", "motherboard", "placa madre", "mainboard"],
    "motherboard": ["tarjeta madre", "motherboard", "placa madre"],
    "teclado": ["teclado", "keyboard", "keypad"],
    "teclados": ["teclado", "keyboard"],
    "mouse": ["mouse", "raton", "ratón", "mice", "mousepad"],
    "raton": ["mouse", "raton", "ratón", "mice", "mousepad"],
    "ratones": ["mouse", "raton", "ratón", "mice"],
    "monitor": ["monitor", "pantalla gamer", "pantalla led", "display"],
    "monitores": ["monitor", "pantalla gamer", "pantalla led"],
    "laptop": ["laptop", "notebook", "macbook", "portatil", "portátil"],
    "laptops": ["laptop", "notebook", "macbook", "portatil", "portátil"],
    "regulador": ["regulador", "no-break", "nobreak", "ups"],
    "reguladores": ["regulador", "no-break", "nobreak", "ups"],
    "nobreak": ["no-break", "nobreak", "ups", "regulador"]
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
    const rawQuery = (query || '').trim();
    if (!rawQuery) return all;

    const tokens = cleanSearchTokens(rawQuery);
    if (!tokens || tokens.length === 0) return all;

    const isSingleChar = rawQuery.length === 1;
    const charPrefix = rawQuery.toLowerCase();

    const scoredResults = [];

    for (let i = 0; i < all.length; i++) {
        const p = all[i];
        const item = window.normalizeProductItem(p);
        const skuNorm = stripAccents(item.sku);
        const nameNorm = stripAccents(item.name);
        const catNorm = stripAccents(item.cat);
        const brandNorm = stripAccents(item.marca);
        const descNorm = stripAccents(item.desc);

        if (isSingleChar) {
            if (nameNorm.startsWith(charPrefix) || brandNorm.startsWith(charPrefix) || catNorm.startsWith(charPrefix) || skuNorm.startsWith(charPrefix)) {
                let score = 500;
                if (nameNorm.startsWith(charPrefix)) score += 300;
                if (catNorm.startsWith(charPrefix)) score += 200;
                scoredResults.push({ score, product: p });
            }
            continue;
        }

        let matchAll = true;
        let score = 0;

        for (let j = 0; j < tokens.length; j++) {
            const t = tokens[j];
            const syns = SYNONYM_DICTIONARY[t] || [t];
            let tokenFound = false;

            for (let k = 0; k < syns.length; k++) {
                const s = syns[k];
                if (s === skuNorm) {
                    score += 2500;
                    tokenFound = true;
                    break;
                } else if (skuNorm.startsWith(s)) {
                    score += 1000;
                    tokenFound = true;
                    break;
                } else if (nameNorm.startsWith(s)) {
                    score += 1200;
                    tokenFound = true;
                    break;
                } else if (nameNorm.includes(' ' + s + ' ') || nameNorm.startsWith(s + ' ') || nameNorm.endsWith(' ' + s)) {
                    score += 700;
                    tokenFound = true;
                    break;
                } else if (nameNorm.includes(s)) {
                    score += 350;
                    tokenFound = true;
                    break;
                } else if (catNorm.includes(s)) {
                    score += 250;
                    tokenFound = true;
                    break;
                } else if (brandNorm.includes(s)) {
                    score += 180;
                    tokenFound = true;
                    break;
                } else if (descNorm.includes(s)) {
                    score += 60;
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
            if (tokens.some(t => ['ram', 'memoria', 'memorias'].includes(t))) {
                if (catNorm.includes('memorias_ram')) score += 10000;
                if (nameNorm.includes('memoria ram')) score += 8000;
                else if (nameNorm.startsWith('memoria')) score += 4000;
            }

            if (tokens.some(t => ['procesador', 'procesadores', 'cpu', 'ryzen', 'core'].includes(t))) {
                if (catNorm === 'procesadores') score += 10000;
                if (nameNorm.startsWith('procesador')) score += 8000;
            }

            if (tokens.some(t => ['disco', 'discos', 'ssd', 'nvme'].includes(t))) {
                if (catNorm.includes('ssd') || catNorm.includes('disco')) score += 10000;
            }

            if (tokens.some(t => ['monitor', 'monitores', 'pantalla', 'pantallas'].includes(t))) {
                if (catNorm.includes('monitores')) score += 10000;
            }

            scoredResults.push({ score, product: p });
        }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.map(r => r.product);
}

// Controles de Presupuesto
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

window.setSortCriterion = function(crit) {
    currentSortCriterion = crit;
    currentPageNumber = 1;
    renderExactCatalogView();
};

window.scrollToResults = function() {
    const el = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// =========================================================================
// SUBRUTINA MAESTRA UNIFICADA: ARRANQUE NATIVO LIMPIO (ZERO-BLANK F5)
// =========================================================================
window.runCleanHomeCatalog = function() {
    activeSelectedCategory = 'Todas';
    activeSelectedBrand = 'Todas';
    activeSelectedChip = 'Todos';
    activeSearchQuery = '';
    currentPageNumber = 1;
    activeMinPrice = 0;
    activeMaxPrice = Infinity;
    activeMinDiscount = 0;

    const searchInput = document.getElementById("boutiqueSearchInput");
    if (searchInput) searchInput.value = '';

    renderSidebarFacets();
    renderExactCatalogView();
};

// El botón "LIMPIAR" y el arranque F5 invocan exactamente la misma subrutina
window.resetFacets = function() {
    window.runCleanHomeCatalog();
    window.scrollToResults();
};

// Inicialización del Catálogo
function initFullCatalog() {
    if (window.activeCurrency === 'USD') {
        const btnMxn = document.getElementById('currencyToggleMXN');
        const btnUsd = document.getElementById('currencyToggleUSD');
        if (btnMxn && btnUsd) {
            btnUsd.className = 'px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black transition cursor-pointer';
            btnMxn.className = 'px-2 py-0.5 rounded-full text-slate-300 hover:text-white transition cursor-pointer';
        }
    }

    const data = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL;
    if (data && Array.isArray(data) && data.length > 0) {
        isFullCatalogLoaded = true;
        window.runCleanHomeCatalog();
        return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        const d = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL;
        if (d && Array.isArray(d) && d.length > 0) {
            clearInterval(interval);
            isFullCatalogLoaded = true;
            window.runCleanHomeCatalog();
        } else if (attempts > 80) {
            clearInterval(interval);
        }
    }, 25);
}

// Renderizado del Welcome Hub (Panel superior de acceso rápido)
function renderWelcomeHub() {
    const hubContainer = document.getElementById("welcome-hub-container");
    if (!hubContainer) return;

    if (activeSelectedCategory !== 'Todas' || (activeSearchQuery && activeSearchQuery.trim() !== '') || currentPageNumber > 1) {
        hubContainer.innerHTML = '';
        hubContainer.classList.add("hidden");
        return;
    }

    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const getCount = (id) => all.filter(p => (p.categoria_clasificada || p.c || '').toLowerCase() === id.toLowerCase()).length;

    const hubDepts = [
        { id: 'procesadores', name: '1. Procesadores (CPUs)', icon: 'fa-microchip', color: 'from-blue-600 to-cyan-600', badge: 'Intel Core Ultra & AMD Ryzen' },
        { id: 'tarjetas_madre', name: '2. Tarjetas Madre', icon: 'fa-chess-board', color: 'from-indigo-600 to-blue-600', badge: 'AM5, LGA1851, LGA1700' },
        { id: 'memorias_ram_pc', name: '3. Memorias RAM PC', icon: 'fa-memory', color: 'from-emerald-600 to-teal-600', badge: 'DDR5 & DDR4 DIMM' },
        { id: 'gabinetes', name: '4. Gabinetes Gamer', icon: 'fa-server', color: 'from-amber-600 to-orange-600', badge: 'Cristal Templado & ARGB' },
        { id: 'tarjetas_video', name: '5. Tarjetas de Video', icon: 'fa-vr-cardboard', color: 'from-purple-600 to-pink-600', badge: 'GeForce RTX & Radeon' },
        { id: 'enfriamiento', name: '6. Enfriamiento Líquido', icon: 'fa-fan', color: 'from-cyan-600 to-blue-500', badge: 'Líquido AIO & Disipadores' },
        { id: 'ssds_m2_nvme', name: '7. Almacenamiento SSD', icon: 'fa-hard-drive', color: 'from-sky-600 to-indigo-600', badge: 'M.2 NVMe PCIe 4.0/5.0' },
        { id: 'fuentes_energia', name: '8. Fuentes de Poder', icon: 'fa-bolt', color: 'from-yellow-600 to-amber-600', badge: '80 Plus Gold & Bronze' },
        { id: 'monitores_pantallas', name: '9. Monitores PC', icon: 'fa-desktop', color: 'from-rose-600 to-red-600', badge: 'Gamer 144Hz - 240Hz & 4K' },
        { id: 'computadoras_ensambladas', name: '10. PCs Armadas & Gamer', icon: 'fa-computer', color: 'from-cyan-500 to-emerald-600', badge: 'Gaming & Workstations' },
        { id: 'proyectores_presentacion', name: '11. Proyectores Video', icon: 'fa-video', color: 'from-violet-600 to-purple-700', badge: 'BenQ, Epson & Láser' },
        { id: 'switches_red', name: '12. Redes & Switches', icon: 'fa-network-wired', color: 'from-blue-700 to-indigo-800', badge: 'Ethernet, PoE+ & Fibra' },
        { id: 'camaras_seguridad_cctv', name: '13. Cámaras CCTV', icon: 'fa-video', color: 'from-slate-700 to-cyan-900', badge: 'Cámaras IP, Bala & Domo' },
        { id: 'no_breaks_ups', name: '14. No-Breaks & UPS', icon: 'fa-car-battery', color: 'from-emerald-700 to-green-900', badge: 'Respaldo Eléctrico' },
        { id: 'limpieza_mantenimiento', name: '15. Limpieza & Servicio', icon: 'fa-spray-can-sparkles', color: 'from-teal-600 to-cyan-700', badge: 'Aire Comprimido & Espumas' }
    ];

    hubContainer.classList.remove("hidden");
    hubContainer.innerHTML = `
        <div class="bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 mb-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                        <i class="fa-solid fa-cubes text-base"></i>
                    </div>
                    <div>
                        <h2 class="text-white font-black text-sm sm:text-base tracking-wide font-mono uppercase">
                            WELCOME HUB • NAVEGACIÓN RÁPIDA POR DEPARTAMENTO
                        </h2>
                        <p class="text-[11px] text-slate-400 font-mono">
                            Haz clic en cualquier categoría para desplegar su vitrina completa con entrega inmediata
                        </p>
                    </div>
                </div>
                <span class="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full w-fit">
                    ${all.length.toLocaleString('es-MX')} Productos en Catálogo
                </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                ${hubDepts.map(d => {
                    const count = getCount(d.id);
                    return `
                        <button 
                            type="button" 
                            onclick="window.selectCategoryFacet('${d.id}')" 
                            class="btn-action group text-left p-3 rounded-2xl bg-slate-950/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400 transition-all duration-200 shadow-md hover:shadow-cyan-500/20 flex flex-col justify-between min-h-[92px] cursor-pointer"
                        >
                            <div class="flex items-center justify-between w-full mb-1">
                                <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center text-white text-xs shadow-sm group-hover:scale-110 transition">
                                    <i class="fa-solid ${d.icon}"></i>
                                </div>
                                <span class="text-[9px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                    ${count.toLocaleString('es-MX')}
                                </span>
                            </div>
                            <div>
                                <h3 class="text-white group-hover:text-cyan-300 font-bold text-xs leading-snug line-clamp-1">
                                    ${d.name}
                                </h3>
                                <span class="text-[9.5px] font-mono text-slate-400 block line-clamp-1">
                                    ${d.badge}
                                </span>
                            </div>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Selección de categorías y auto-scroll
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

    const target = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.scrollToDepartments = function() {
    const target = document.getElementById("sidebar-facets-root") || document.getElementById("boutiqueSearchInput");
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Inicializador Maestro que cubre DOMContentLoaded, ejecución diferida e inmediata
function bootMasterZeroBlank() {
    initFullCatalog();
    initPredictiveSearchEngine();
    syncBoutiqueCart();
    window.runCleanHomeCatalog();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootMasterZeroBlank);
} else {
    bootMasterZeroBlank();
}
// Doble verificación a 20ms para garantizar que F5 jamás muestre pantalla blanca
setTimeout(bootMasterZeroBlank, 20);

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

    if (activeSelectedCategory !== 'Todas') {
        items = items.filter(p => {
            const catClasif = (p.categoria_clasificada || p.c || '').toLowerCase();
            return catClasif === activeSelectedCategory.toLowerCase();
        });
    }

    if (activeSelectedBrand !== 'Todas') {
        items = items.filter(p => (p.marca || p.m || '').toUpperCase() === activeSelectedBrand.toUpperCase());
    }

    if (activeMinPrice > 0 || activeMaxPrice < Infinity) {
        items = items.filter(p => {
            const pr = parseFloat(p.precio_mxn || p.p || p.precio || 0);
            return pr >= activeMinPrice && pr <= activeMaxPrice;
        });
    }

    if (activeSearchQuery && activeSearchQuery.trim() !== '' && currentSortCriterion === 'destacados') {
        return items;
    }

    items.sort((a, b) => {
        const aItem = window.normalizeProductItem(a);
        const bItem = window.normalizeProductItem(b);
        const aHasImg = aItem.hasImg ? 1 : 0;
        const bHasImg = bItem.hasImg ? 1 : 0;
        
        if (aHasImg !== bHasImg) {
            return bHasImg - aHasImg;
        }

        if (currentSortCriterion === 'precio_asc') {
            return aItem.priceMxn - bItem.priceMxn;
        } else if (currentSortCriterion === 'precio_desc') {
            return bItem.priceMxn - aItem.priceMxn;
        } else if (currentSortCriterion === 'nombre') {
            return aItem.name.localeCompare(bItem.name);
        } else {
            return bItem.priceMxn - aItem.priceMxn;
        }
    });

    return items;
}

function getPlaceholderForCat(cat) {
    const map = {
        'procesadores': 'cpu_placeholder.jpg',
        'tarjetas_madre': 'mbd_placeholder.jpg',
        'memorias_ram_pc': 'ram_placeholder.jpg',
        'memorias_ram_laptop': 'ram_placeholder.jpg',
        'memorias_ram_servidor': 'ram_placeholder.jpg',
        'tarjetas_microsd': 'ssd_placeholder.jpg',
        'tarjetas_sd': 'ssd_placeholder.jpg',
        'memorias_usb_pendrives': 'ssd_placeholder.jpg',
        'ssds_m2_nvme': 'ssd_placeholder.jpg',
        'discos_duros_hdd_internos': 'ssd_placeholder.jpg',
        'discos_duros_externos': 'ssd_placeholder.jpg',
        'ssds_externos_portatiles': 'ssd_placeholder.jpg',
        'tarjetas_video': 'gpu_placeholder.jpg',
        'gabinetes': 'gab_placeholder.jpg',
        'fuentes_energia': 'psu_placeholder.jpg',
        'enfriamiento': 'cooling_placeholder.jpg',
        'no_breaks_ups': 'ups_placeholder.jpg',
        'reguladores_voltaje': 'ups_placeholder.jpg',
        'monitores_pantallas': 'mon_placeholder.jpg',
        'proyectores_presentacion': 'mon_placeholder.jpg',
        'teclados': 'acc_placeholder.jpg',
        'ratones_mouse': 'acc_placeholder.jpg',
        'combos_teclado_mouse': 'acc_placeholder.jpg',
        'diademas_headsets': 'elec_placeholder.jpg',
        'bocinas_sonido': 'elec_placeholder.jpg',
        'microfonos': 'elec_placeholder.jpg',
        'computadoras_ensambladas': 'pc_placeholder.jpg',
        'laptops_portatiles': 'lap_placeholder.jpg',
        'computadoras_all_in_one': 'pc_placeholder.jpg',
        'mini_pcs_nuc': 'minipc_placeholder.jpg',
        'servidores_enterprise': 'minipc_placeholder.jpg',
        'switches_red': 'redes_placeholder.jpg',
        'routers_access_points': 'redes_placeholder.jpg',
        'camaras_seguridad_cctv': 'cctv_placeholder.jpg',
        'grabadores_dvr_nvr': 'cctv_placeholder.jpg',
        'control_acceso_biometricos': 'cctv_placeholder.jpg',
        'alarmas_sensores_seguridad': 'cctv_placeholder.jpg',
        'telefonia_conmutadores': 'cctv_placeholder.jpg',
        'impresoras_multifuncionales': 'imp_placeholder.jpg',
        'toners_laser': 'imp_placeholder.jpg',
        'tintas_cartuchos': 'imp_placeholder.jpg',
        'plotters_gran_formato': 'imp_placeholder.jpg',
        'sistemas_operativos': 'sof_placeholder.jpg',
        'ofimatica_productividad': 'sof_placeholder.jpg',
        'antivirus_seguridad_digital': 'sof_placeholder.jpg',
        'punto_de_venta': 'pos_placeholder.jpg',
        'smartphones_celulares': 'lap_placeholder.jpg',
        'tablets_ipads': 'lap_placeholder.jpg',
        'cables_adaptadores': 'acc_placeholder.jpg',
        'limpieza_mantenimiento': 'acc_placeholder.jpg'
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

function renderProductCardHTML(p, viewStyle) {
    const item = window.normalizeProductItem(p);
    if (!item) return '';

    const title = item.name.replace(/'/g, "&#39;").replace(/"/g, '&quot;');
    const localImg = `assets/img/${item.sku}.webp`;

    if (viewStyle === 'grid') {
        return `
            <article class="bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-3.5 flex flex-col justify-between transition group shadow-xl hover:shadow-cyan-500/10 relative overflow-hidden text-slate-100">
                <div class="absolute -top-7 -left-7 w-16 h-16 bg-gradient-to-br from-red-600 to-amber-600 rotate-[-45deg] flex items-end justify-center pb-0.5 shadow-md z-10">
                    <span class="text-[7.5px] font-black text-white uppercase tracking-tighter">-25% DTO</span>
                </div>

                <div>
                    <!-- Foto Cuadrada 1080x1080 WebP -->
                    <div onclick="openProductDetailModal('${item.sku}')" class="w-full aspect-square bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 mb-2.5 group-hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-center">
                        <img 
                            src="${localImg}" 
                            alt="${title}" 
                            width="300" 
                            height="300" 
                            loading="lazy" 
                            decoding="async" 
                            class="w-full h-full object-contain group-hover:scale-105 transition duration-200" 
                            onerror="window.handleProductImgError(this, '${item.sku}', '${item.cat}')"
                        />
                    </div>

                    ${item.subLabel ? `
                        <div class="text-center mb-1">
                            <span class="inline-block bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                                ${item.subLabel}
                            </span>
                        </div>
                    ` : ''}

                    <!-- Precios Claros -->
                    <div class="text-center mb-1.5">
                        <span class="text-sm font-black text-emerald-300 block font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                            ${window.formatPriceDisplay(item.priceMxn, item.priceUsd)}
                        </span>
                        <div class="flex items-center justify-center gap-1.5 text-[10px] font-mono">
                            <span class="text-slate-400 line-through">${window.formatPriceDisplay(item.orig, (item.priceUsd || (item.priceMxn/19.5))*1.33)}</span>
                            <span class="text-amber-300 font-bold">Mayoreo: ${window.formatPriceDisplay(item.may, item.mayUsd)}</span>
                        </div>
                    </div>

                    <div class="text-center text-[9px] font-mono font-bold mb-1 flex items-center justify-center gap-1">
                        ${item.isAgotado 
                            ? `<span class="text-amber-400"><i class="fa-solid fa-clock mr-0.5"></i> Bajo Pedido (Próxima Existencia)</span>`
                            : `<span class="text-cyan-300"><i class="fa-solid fa-truck-bolt mr-0.5"></i> Disponible en Pedro Moreno 501 A</span>`
                        }
                    </div>

                    <h3 onclick="openProductDetailModal('${item.sku}')" class="text-slate-100 text-xs font-semibold text-center line-clamp-2 leading-tight hover:text-cyan-300 transition mb-1 cursor-pointer" title="${title}">
                        ${title}
                    </h3>

                    <div class="text-center text-[9.5px] font-mono text-slate-400 mb-2">
                        <span>SKU: <strong class="text-cyan-300">${item.sku}</strong></span>
                    </div>
                </div>

                <!-- Botones de Acción: Ficha, + Carrito y Comprar -->
                <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div class="flex gap-1.5">
                        <button 
                            onclick="openProductDetailModal('${item.sku}')" 
                            aria-label="Ver ficha de ${title}" 
                            class="btn-action flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10.5px] font-bold rounded-xl py-2 transition cursor-pointer border border-slate-700 min-h-[40px] flex items-center justify-center gap-1"
                        >
                            <i class="fa-solid fa-file-lines text-xs"></i> <span>Ficha</span>
                        </button>
                        <button 
                            onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `addToCartCT('${item.sku}')`}" 
                            aria-label="Agregar ${title} al carrito" 
                            class="btn-action flex-1 ${item.isAgotado ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow active:scale-95'} font-mono text-[10.5px] font-bold rounded-xl py-2 transition cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
                        >
                            <i class="fa-solid ${item.isAgotado ? 'fa-clock' : 'fa-cart-plus'} text-xs"></i> <span>${item.isAgotado ? 'Apartar' : '+ Carrito'}</span>
                        </button>
                    </div>
                    <button 
                        onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `buyNowCT('${item.sku}')`}" 
                        aria-label="Comprar ${title} ahora" 
                        class="btn-action w-full ${item.isAgotado ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/40' : 'bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg active:scale-95'} font-mono text-[11px] font-black rounded-xl py-2.5 uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
                    >
                        <i class="fa-solid ${item.isAgotado ? 'fa-hourglass-half text-amber-300' : 'fa-bolt text-yellow-300'}"></i> <span>${item.isAgotado ? 'Bajo Pedido' : 'Comprar Ahora'}</span>
                    </button>
                </div>
            </article>
        `;
    } else {
        return `
            <article class="bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition group shadow-xl relative overflow-hidden text-slate-100">
                <div class="w-24 h-24 sm:w-28 sm:h-28 bg-slate-950 rounded-xl p-2 shrink-0 flex items-center justify-center cursor-pointer" onclick="openProductDetailModal('${item.sku}')">
                    <img src="${localImg}" alt="${title}" width="120" height="120" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${item.sku}', '${item.cat}')" />
                </div>
                <div class="flex-1 min-w-0 text-left">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">${item.cat.replace(/_/g, ' ')} • SKU: ${item.sku}</span>
                        ${item.subLabel ? `<span class="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">${item.subLabel}</span>` : ''}
                    </div>
                    <h3 onclick="openProductDetailModal('${item.sku}')" class="text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-300 transition line-clamp-2 cursor-pointer mb-1.5">${title}</h3>
                    <div class="text-[11px] font-mono ${item.isAgotado ? 'text-amber-400' : 'text-slate-400'}">
                        ${item.isAgotado ? '<i class="fa-solid fa-clock"></i> Bajo Pedido hasta su próxima existencia' : 'Entrega Inmediata en Pedro Moreno 501 A • Garantía 48h Directa'}
                    </div>
                </div>
                <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 shrink-0 space-y-2">
                    <div class="text-right">
                        <span class="text-[10px] text-slate-500 line-through font-mono block">${window.formatPriceDisplay(item.orig, (item.priceUsd || (item.priceMxn/19.5))*1.33)}</span>
                        <div class="text-sm sm:text-base font-black text-emerald-400 font-mono">${window.formatPriceDisplay(item.priceMxn, item.priceUsd)}</div>
                    </div>
                    <div class="flex gap-1.5 w-full">
                        <button onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `addToCartCT('${item.sku}')`}" class="flex-1 ${item.isAgotado ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 hover:bg-blue-500 text-white'} font-bold py-2 rounded-xl text-[10.5px] font-mono uppercase flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer min-h-[40px]">
                            <i class="fa-solid ${item.isAgotado ? 'fa-clock' : 'fa-cart-plus'}"></i> ${item.isAgotado ? 'Bajo Pedido' : '+Carrito'}
                        </button>
                        <button onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `buyNowCT('${item.sku}')`}" class="flex-1 ${item.isAgotado ? 'bg-slate-800 text-amber-300 border border-amber-500/40' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white'} font-black py-2 rounded-xl text-[10.5px] font-mono uppercase flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer min-h-[40px]">
                            <i class="fa-solid ${item.isAgotado ? 'fa-hourglass-half' : 'fa-bolt'}"></i> ${item.isAgotado ? 'Apartar' : 'Comprar'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }
}

// RENDERIZADOR MAESTRO DE VITRINAS POR DEPARTAMENTO (PANTALLA DE INICIO)
function renderShowcaseVitrinas(container) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const depts = window.PC_DEPARTAMENTOS || [];

    const bars = document.querySelectorAll(".pagination-target-bar");
    bars.forEach(b => b.innerHTML = '');

    const resultsCountTxt = document.getElementById("results-count-display");
    if (resultsCountTxt) {
        resultsCountTxt.innerHTML = `Vitrinas Oficiales por Departamento <span class="text-slate-400 font-normal">(${depts.length} Departamentos • ${all.length.toLocaleString('es-MX')} Productos)</span>`;
    }

    let vitrinasHtml = '';

    for (let i = 0; i < depts.length; i++) {
        const dept = depts[i];
        const deptProducts = all.filter(p => (p.categoria_clasificada || p.c) === dept.id);
        if (deptProducts.length === 0) continue;

        const sample = deptProducts.slice(0, 4);

        vitrinasHtml += `
            <section class="vitrina-modulo mb-6 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl transition duration-200" data-dept-id="${dept.id}">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg text-base shrink-0">
                            <i class="fa-solid ${dept.icon}"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-white font-black text-sm sm:text-base tracking-wide font-mono uppercase">
                                    ${dept.name}
                                </h2>
                                <span class="bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                    ${deptProducts.length.toLocaleString('es-MX')} Modelos
                                </span>
                            </div>
                            <span class="text-[11px] text-slate-400 font-mono">
                                Componentes certificados listos para ensamble y entrega inmediata en Guadalajara
                            </span>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onclick="window.selectCategoryFacet('${dept.id}')" 
                        class="btn-action bg-slate-950 hover:bg-slate-850 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 font-mono text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shadow min-h-[40px] w-fit shrink-0"
                    >
                        <span>Ver Vitrina Completa (${deptProducts.length.toLocaleString('es-MX')})</span>
                        <i class="fa-solid fa-arrow-right text-[11px]"></i>
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    ${sample.map(p => renderProductCardHTML(p, 'grid')).join('')}
                </div>
            </section>
        `;
    }

    container.className = "flex flex-col gap-2 pb-6";
    container.innerHTML = vitrinasHtml;
}

// RENDERIZADOR DE VITRINA COMPLETA PAGINADA (CUANDO SE ENTRA A UN DEPARTAMENTO O BÚSQUEDA)
function renderPaginatedDepartmentView(container, resultsCountTxt) {
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
            const deptObj = (window.PC_DEPARTAMENTOS || []).find(d => d.id === activeSelectedCategory);
            const deptName = deptObj ? deptObj.name : activeSelectedCategory.replace(/_/g, ' ').toUpperCase();
            titleTxt = `
                <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="resetFacets()" class="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <i class="fa-solid fa-arrow-left"></i> Volver a Vitrinas
                    </button>
                    <span class="text-slate-500">|</span>
                    <span>${deptName}</span>
                    <span class="text-slate-400 font-normal text-xs">(${startIdx + 1}-${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount.toLocaleString('es-MX')})</span>
                </div>
            `;
        } else {
            titleTxt = `Aparador Principal <span class="text-slate-400 font-normal">(${startIdx + 1}-${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount.toLocaleString('es-MX')})</span>`;
        }
        resultsCountTxt.innerHTML = titleTxt;
    }

    renderPaginationBar(totalPages);

    if (pageItems.length === 0) {
        container.className = "w-full py-16 text-center text-slate-300 font-mono text-sm bg-slate-900/90 border border-slate-800 rounded-2xl";
        container.innerHTML = `
            <i class="fa-solid fa-box-open text-4xl text-cyan-400 mb-3 block" aria-hidden="true"></i>
            No se encontraron productos en esta sección con los filtros actuales.
            <br><button onclick="resetFacets()" aria-label="Ver todas las vitrinas" class="btn-action mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-lg min-h-[44px]">Ver Todas las Vitrinas</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2";
        container.innerHTML = pageItems.map(p => renderProductCardHTML(p, 'grid')).join('');
    } else {
        container.className = "flex flex-col gap-3.5 pb-2";
        container.innerHTML = pageItems.map(p => renderProductCardHTML(p, 'list')).join('');
    }
}

// CONTROLADOR MAESTRO DE VISTA DEL CATÁLOGO
function renderExactCatalogView() {
    const container = document.getElementById("products-grid-container");
    const resultsCountTxt = document.getElementById("results-count-display");
    if (!container) return;

    if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
        renderWelcomeHub();
        renderShowcaseVitrinas(container);
        return;
    }

    const hubContainer = document.getElementById("welcome-hub-container");
    if (hubContainer) {
        hubContainer.innerHTML = '';
        hubContainer.classList.add("hidden");
    }

    renderPaginatedDepartmentView(container, resultsCountTxt);
}

// BARRA DE PAGINACIÓN NUMÉRICA EXTENDIDA
function renderPaginationBar(totalPages) {
    const bars = document.querySelectorAll(".pagination-target-bar");
    if (!bars.length) return;

    if (totalPages <= 1) {
        bars.forEach(b => b.innerHTML = '');
        return;
    }

    const current = currentPageNumber;
    const pages = [];
    const delta = 2;
    const left = Math.max(2, current - delta);
    const right = Math.min(totalPages - 1, current + delta);

    pages.push(1);
    if (left > 2) {
        pages.push('...');
    }
    for (let i = left; i <= right; i++) {
        pages.push(i);
    }
    if (right < totalPages - 1) {
        pages.push('...');
    }
    if (totalPages > 1) {
        pages.push(totalPages);
    }

    const html = `
        <div class="w-full flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-white">
            <div class="flex items-center gap-1.5">
                <button 
                    type="button"
                    onclick="goToPage(${current - 1})" 
                    ${current === 1 ? 'disabled class="px-3 py-2 rounded-xl bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed text-xs font-bold min-h-[40px]"' : 'class="btn-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-400 cursor-pointer text-xs font-bold transition shadow min-h-[40px] flex items-center gap-1"'}
                    aria-label="Página anterior"
                >
                    <i class="fa-solid fa-chevron-left text-[11px]"></i>
                    <span>Anterior</span>
                </button>
            </div>

            <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                ${pages.map(p => {
                    if (p === '...') {
                        return `<span class="px-2 py-1 text-slate-500 font-bold select-none">...</span>`;
                    }
                    const isActive = p === current;
                    return `
                        <button 
                            type="button" 
                            onclick="goToPage(${p})" 
                            class="btn-action min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${isActive ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20 scale-105' : 'bg-slate-950/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'}"
                            aria-label="Ir a página ${p}"
                        >
                            ${p}
                        </button>
                    `;
                }).join('')}
            </div>

            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
                    <label for="pageJumpInput" class="text-[10.5px]">Ir a:</label>
                    <input 
                        type="number" 
                        id="pageJumpInput"
                        min="1" 
                        max="${totalPages}" 
                        value="${current}" 
                        onkeydown="if(event.key==='Enter'){event.preventDefault(); goToPage(parseInt(this.value, 10));}"
                        class="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 text-center text-white text-xs font-bold outline-none focus:border-cyan-400 font-mono"
                    />
                    <button 
                        type="button" 
                        onclick="const inp=this.previousElementSibling; if(inp){goToPage(parseInt(inp.value, 10));}"
                        class="btn-action bg-blue-600 hover:bg-blue-500 text-white font-black px-2.5 py-1 rounded-lg text-[10px] uppercase cursor-pointer transition shadow"
                    >
                        Ir
                    </button>
                </div>

                <button 
                    type="button"
                    onclick="goToPage(${current + 1})" 
                    ${current === totalPages ? 'disabled class="px-3 py-2 rounded-xl bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed text-xs font-bold min-h-[40px]"' : 'class="btn-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-400 cursor-pointer text-xs font-bold transition shadow min-h-[40px] flex items-center gap-1"'}
                    aria-label="Página siguiente"
                >
                    <span>Siguiente</span>
                    <i class="fa-solid fa-chevron-right text-[11px]"></i>
                </button>
            </div>
        </div>
    `;

    bars.forEach(b => b.innerHTML = html);
}

function goToPage(page) {
    const filtered = getFilteredList();
    const totalPages = Math.ceil(filtered.length / productsPerPage) || 1;
    if (page < 1 || page > totalPages || isNaN(page)) return;
    currentPageNumber = page;
    renderExactCatalogView();
    const showcaseTarget = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
    if (showcaseTarget) showcaseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =========================================================================
// MENÚ LATERAL: ACORDEÓN DE 7 DEPARTAMENTOS MAESTROS (SIN SCROLL DESBORDADO)
// =========================================================================
function renderSidebarFacets() {
    const root = document.getElementById("sidebar-facets-root");
    if (!root) return;

    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const depts = window.PC_DEPARTAMENTOS || [];

    const renderMasterAccordion = (master) => {
        const isParentOfActive = master.deptIds.includes(activeSelectedCategory);
        
        // Sumar todos los productos correspondientes a este maestro
        const masterCount = master.deptIds.reduce((sum, deptId) => {
            return sum + all.filter(p => (p.categoria_clasificada || p.c || '').toLowerCase() === deptId.toLowerCase()).length;
        }, 0);

        const childDepts = master.deptIds
            .map(id => depts.find(d => d.id === id))
            .filter(Boolean);

        return `
            <details class="master-dept group bg-slate-950/75 border ${isParentOfActive ? 'border-cyan-500/70 bg-slate-950 shadow-lg shadow-cyan-500/10' : 'border-slate-800/90'} rounded-xl overflow-hidden transition-all duration-200" ${isParentOfActive ? 'open' : ''}>
                <summary class="flex items-center justify-between p-2.5 cursor-pointer select-none hover:bg-slate-850 transition list-none font-mono text-xs font-bold text-white">
                    <div class="flex items-center gap-2 truncate min-w-0 pr-1">
                        <i class="fa-solid ${master.icon} text-cyan-400 text-xs w-4 text-center shrink-0"></i>
                        <span class="truncate text-[11px] ${isParentOfActive ? 'text-cyan-300 font-black' : 'text-slate-200'}">${master.name}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-[9px] font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-cyan-300 font-bold">
                            ${masterCount.toLocaleString('es-MX')}
                        </span>
                        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200"></i>
                    </div>
                </summary>
                <div class="p-2 pt-1 pb-1.5 space-y-1 bg-slate-900/80 border-t border-slate-800/80 text-xs divide-y divide-slate-800/40">
                    ${childDepts.map(c => {
                        const count = all.filter(p => (p.categoria_clasificada || p.c || '').toLowerCase() === c.id.toLowerCase()).length;
                        const isSelected = activeSelectedCategory === c.id;
                        return `
                            <label for="cat_${c.id}" class="category-link flex items-center justify-between cursor-pointer hover:text-cyan-300 transition py-1">
                                <span class="flex items-center gap-2 truncate pr-1">
                                    <input type="radio" id="cat_${c.id}" name="cat_facet" aria-label="${c.name}" ${isSelected ? 'checked' : ''} onchange="window.selectCategoryFacet('${c.id}')" class="accent-cyan-400 cursor-pointer shrink-0" />
                                    <i class="fa-solid ${c.icon} text-cyan-400 w-3 text-center shrink-0 text-[10px]" aria-hidden="true"></i>
                                    <span class="cat-title truncate ${isSelected ? 'font-black text-cyan-300' : 'text-slate-300'} text-[10.5px]">${c.name}</span>
                                </span>
                                <span class="cat-count font-mono text-[9px] text-slate-400 shrink-0">(${count.toLocaleString('es-MX')})</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </details>
        `;
    };

    root.innerHTML = `
        <div class="bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 text-white p-3 rounded-t-2xl font-bold text-xs uppercase flex items-center justify-between shadow-lg">
            <h2 class="flex items-center gap-2 text-cyan-300 font-mono text-xs"><i class="fa-solid fa-sliders text-cyan-400" aria-hidden="true"></i> Departamentos</h2>
            <span class="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">${all.length.toLocaleString('es-MX')} Items</span>
        </div>

        <div class="p-3 bg-slate-900/95 border-x border-b border-slate-800 rounded-b-2xl text-slate-200 text-xs shadow-2xl flex flex-col justify-between space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            
            <div class="flex gap-2">
                <button onclick="renderExactCatalogView()" aria-label="Aplicar filtros seleccionados" class="btn-action flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-[11px] uppercase transition cursor-pointer shadow min-h-[40px]">
                    Aplicar
                </button>
                <button onclick="window.resetFacets()" aria-label="Limpiar todos los filtros" class="btn-action flex-1 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-200 hover:text-red-400 font-bold rounded-xl text-[11px] uppercase transition cursor-pointer min-h-[40px]">
                    Limpiar
                </button>
            </div>

            <!-- ENLACE A TODAS LAS VITRINAS -->
            <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition flex items-center">
                <label for="cat_todas" class="category-link flex items-center justify-between cursor-pointer w-full">
                    <span class="flex items-center gap-2 truncate">
                        <input type="radio" id="cat_todas" name="cat_facet" aria-label="Todas las vitrinas" ${activeSelectedCategory === 'Todas' ? 'checked' : ''} onchange="window.selectCategoryFacet('Todas')" class="accent-cyan-400 cursor-pointer shrink-0" />
                        <i class="fa-solid fa-layer-group text-xs text-cyan-400 shrink-0" aria-hidden="true"></i>
                        <span class="cat-title truncate font-black text-white text-xs">Todas las Vitrinas</span>
                    </span>
                    <span class="font-mono text-[9.5px] text-cyan-300 font-bold">(${all.length.toLocaleString('es-MX')})</span>
                </label>
            </div>

            <!-- LOS 7 DEPARTAMENTOS MAESTROS COLAPSABLES (ACORDEÓN COMPACTO SIN SCROLL DESBORDADO) -->
            <div class="space-y-1.5 pr-0.5">
                ${MASTER_DEPARTMENTS.map(renderMasterAccordion).join('')}
            </div>

            <!-- BARRA DE PRESUPUESTO INTERACTIVO -->
            <div class="border-t border-slate-800 pt-3 space-y-2">
                <h3 class="dept-heading text-amber-300 font-mono uppercase text-xs font-black flex items-center justify-between">
                    <span><i class="fa-solid fa-calculator text-amber-400 mr-1.5"></i> Presupuesto</span>
                    <span class="text-[9px] text-slate-400 font-normal">($ MXN)</span>
                </h3>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <input type="number" id="budgetMinInput" placeholder="Mín: $0" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono outline-none focus:border-cyan-400" />
                    </div>
                    <div>
                        <input type="number" id="budgetMaxInput" placeholder="Máx: Sin límite" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono outline-none focus:border-cyan-400" />
                    </div>
                </div>

                <button onclick="window.applyCustomBudget()" aria-label="Filtrar por presupuesto" class="btn-action w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold text-xs py-1.5 rounded-xl transition cursor-pointer border border-amber-500/30 flex items-center justify-center gap-1.5 min-h-[38px]">
                    <i class="fa-solid fa-filter text-[10px]"></i> <span>Filtrar Presupuesto</span>
                </button>
            </div>

        </div>
    `;
}

// Búsqueda Predictiva Rápida
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
                        Ver todas en vitrina »
                    </button>
                </div>
                <div class="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
                    ${topMatches.map(rawP => {
                        const item = window.normalizeProductItem(rawP);
                        const title = item.name.replace(/'/g, "&#39;").replace(/"/g, '&quot;');
                        const localImg = `assets/img/${item.sku}.webp`;

                        return `
                            <div class="flex items-center justify-between gap-3 p-3 hover:bg-slate-850 transition cursor-pointer group min-h-[48px]" onclick="openProductDetailModal('${item.sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" role="button" tabindex="0" aria-label="Ver detalle de ${title}">
                                <div class="w-12 h-12 bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-800 group-hover:border-cyan-400/50 flex items-center justify-center">
                                    <img src="${localImg}" alt="${title}" width="48" height="48" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${item.sku}', '${item.cat}')" />
                                </div>
                                <div class="flex-1 min-w-0 text-left">
                                    <div class="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate">${title}</div>
                                    <div class="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                                        <span class="text-cyan-300 font-bold">SKU: ${item.sku}</span>
                                        <span>•</span>
                                        <span class="text-amber-300">May: ${window.formatPriceDisplay(item.may, item.mayUsd)}</span>
                                    </div>
                                </div>
                                <div class="text-right shrink-0 flex items-center gap-1.5">
                                    <div class="text-xs font-mono font-black text-emerald-300">${window.formatPriceDisplay(item.priceMxn, item.priceUsd)}</div>
                                    <button type="button" onclick="event.stopPropagation(); openProductDetailModal('${item.sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" aria-label="Ver ficha de ${title}" class="btn-action bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-slate-700 uppercase min-h-[40px]">
                                        Ficha
                                    </button>
                                    <button type="button" onclick="event.stopPropagation(); addToCartCT('${item.sku}'); document.getElementById('boutique-autocomplete-box').classList.add('hidden');" aria-label="Agregar ${title} al carrito" class="btn-action bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase min-h-[40px]">
                                        + Carrito
                                    </button>
                                    <button type="button" onclick="event.stopPropagation(); buyNowCT('${item.sku}');" aria-label="Comprar ${title} ahora" class="btn-action bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow min-h-[40px]">
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
    currentPageNumber = 1;
    
    const box = document.getElementById("boutique-autocomplete-box");
    if (box) box.classList.add("hidden");

    renderSidebarFacets();
    renderExactCatalogView();
    window.scrollToResults();
};

// Carrito de compras
function getBoutiqueCart() {
    try {
        return JSON.parse(localStorage.getItem('pc_custom_cart') || '[]');
    } catch {
        return [];
    }
}

function saveBoutiqueCart(cart) {
    localStorage.setItem('pc_custom_cart', JSON.stringify(cart));
    syncBoutiqueCart();
}

function syncBoutiqueCart() {
    const cart = getBoutiqueCart();
    const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const totalMxn = cart.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

    const badge = document.getElementById("boutique-cart-badge");
    const totalTxt = document.getElementById("boutique-cart-total");

    if (badge) badge.innerText = count.toString();
    if (totalTxt) totalTxt.innerText = window.formatPriceDisplay(totalMxn);
}

window.addToCartCT = function(sku) {
    const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const raw = catalog.find(item => (item.sku === sku || item.s === sku || item.clave === sku));
    if (!raw) return;

    const p = window.normalizeProductItem(raw);
    const cart = getBoutiqueCart();
    const existing = cart.find(item => item.sku === sku);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            sku: p.sku,
            name: p.name,
            price: p.priceMxn,
            store: 'pc-custom-lab',
            storeName: 'PC Custom Lab',
            image: `./assets/img/${p.sku}.webp`,
            quantity: 1
        });
    }

    saveBoutiqueCart(cart);
    showAddToCartToast(p.name);
};

window.buyNowCT = function(sku) {
    const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const raw = catalog.find(item => (item.sku === sku || item.s === sku || item.clave === sku));
    if (!raw) {
        window.location.href = "checkout.html";
        return;
    }

    const p = window.normalizeProductItem(raw);
    const cart = getBoutiqueCart();
    const existing = cart.find(item => item.sku === sku);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            sku: p.sku,
            name: p.name,
            price: p.priceMxn,
            store: 'pc-custom-lab',
            storeName: 'PC Custom Lab',
            image: `./assets/img/${p.sku}.webp`,
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

// Modal Ficha Técnica (PDP) 100% Nativo PC Custom Lab
window.openProductDetailModal = function(sku) {
    const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const raw = catalog.find(item => (item.sku === sku || item.s === sku || item.clave === sku));
    if (!raw) return;

    const p = window.normalizeProductItem(raw);
    const modal = document.getElementById("productDetailModal");
    const content = document.getElementById("productDetailModalContent");
    if (!modal || !content) return;

    const title = p.name.replace(/'/g, "&#39;");
    const desc = p.desc.replace(/'/g, "&#39;");
    const localImg = `assets/img/${p.sku}.webp`;

    content.innerHTML = `
        <div class="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <i class="fa-solid fa-microchip mr-1.5 text-cyan-400"></i> Ficha Técnica Oficial • PC Custom Lab
            </span>
            <button onclick="closeProductDetailModal()" aria-label="Cerrar modal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 flex items-center justify-center transition cursor-pointer min-h-[44px]">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="w-full aspect-square bg-slate-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800">
                <img src="${localImg}" alt="${title}" width="400" height="400" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${p.sku}', '${p.cat}')" />
            </div>

            <div class="flex flex-col justify-between space-y-4">
                <div>
                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                        <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                            ${p.cat.replace(/_/g, ' ')} • SKU: ${p.sku}
                        </span>
                        ${p.subLabel ? `
                            <span class="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                ${p.subLabel}
                            </span>
                        ` : ''}
                        <span class="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                            Marca: ${(p.marca && p.marca.toUpperCase() !== 'CT') ? p.marca : 'Certificada PC Custom'}
                        </span>
                    </div>

                    <h2 class="text-base sm:text-lg font-bold text-white leading-snug mb-2">${title}</h2>

                    <div class="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto space-y-2 mb-2">
                        <div class="font-bold text-cyan-300 font-mono uppercase text-[11px]"><i class="fa-solid fa-list-check mr-1"></i> Especificaciones Técnicas:</div>
                        <p>${desc}</p>
                    </div>

                    <div class="w-full bg-slate-950/90 text-slate-300 border border-cyan-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow font-mono text-[11px]">
                        <span class="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <i class="fa-solid fa-certificate text-cyan-400"></i> Ficha Técnica Nativa PC Custom Lab
                        </span>
                        <span class="text-emerald-400 font-bold flex items-center gap-1">
                            <i class="fa-solid fa-shield-check"></i> Garantía y Facturación SAT
                        </span>
                    </div>
                </div>

                <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div class="flex items-baseline justify-between">
                        <div>
                            <span class="text-xs text-slate-500 line-through font-mono block">${window.formatPriceDisplay(p.orig, (p.priceUsd)*1.33)}</span>
                            <div class="text-xl font-black text-emerald-400 font-mono">${window.formatPriceDisplay(p.priceMxn, p.priceUsd)}</div>
                        </div>
                        <span class="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
                            Mayoreo: ${window.formatPriceDisplay(p.may, p.mayUsd)}
                        </span>
                    </div>

                    <div class="text-[11px] font-mono text-slate-400 space-y-1.5">
                        ${p.isAgotado ? `
                            <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-2">
                                <i class="fa-solid fa-clock-rotate-left text-base"></i>
                                <span>Disponibilidad: <strong>Bajo Pedido (hasta su próxima existencia en almacén)</strong></span>
                            </div>
                        ` : `
                            <div><i class="fa-solid fa-shield-check text-emerald-400 mr-1"></i> Garantía 48h Directa en Tienda / 1 Año Fabricante</div>
                            <div><i class="fa-solid fa-location-dot text-cyan-400 mr-1"></i> Entrega Inmediata en Pedro Moreno 501 A</div>
                        `}
                    </div>

                    <div class="flex gap-2 pt-2">
                        <button onclick="${p.isAgotado ? `window.open('https://wa.me/523337271440?text=Hola,%20me%20interesa%20apartar%20bajo%20pedido%20el%20producto:%20${p.sku}', '_blank')` : `addToCartCT('${p.sku}'); closeProductDetailModal();`}" class="flex-1 ${p.isAgotado ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40' : 'bg-blue-600 hover:bg-blue-500 text-white shadow'} font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]">
                            <i class="fa-solid ${p.isAgotado ? 'fa-clock' : 'fa-cart-plus'}"></i> <span>${p.isAgotado ? 'Apartar Bajo Pedido' : '+ Carrito'}</span>
                        </button>
                        <button onclick="${p.isAgotado ? `window.open('https://wa.me/523337271440?text=Hola,%20cotizar%20bajo%20pedido:%20${p.sku}', '_blank')` : `buyNowCT('${p.sku}');`}" class="flex-1 ${p.isAgotado ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition cursor-pointer min-h-[44px]">
                            <i class="fa-solid ${p.isAgotado ? 'fa-file-invoice-dollar' : 'fa-bolt'}"></i> <span>${p.isAgotado ? 'Cotizar Pieza' : 'Comprar Ahora'}</span>
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
