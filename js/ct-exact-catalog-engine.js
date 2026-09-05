// =========================================================================
// MOTOR UNIVERSAL BILINGÜE PC CUSTOM LAB (V24 REPARACIÓN TOTAL)
// 58 VITRINAS ACTIVAS • COMPATIBILIDAD DUAL (file:/// Y https://) • RESISTENTE A FALLOS
// =========================================================================

let currentViewStyle = 'grid';
let currentPageNumber = 1;
let productsPerPage = 24;
let activeSelectedCategory = 'Todas';
let activeSelectedChip = 'Todos';
let activeSelectedBrand = 'Todas';
let activeSearchQuery = '';
let activeMinPrice = 0;
let activeMaxPrice = Infinity;
let activeMinDiscount = 0;
let currentSortCriterion = 'destacados';
let isFullCatalogLoaded = false;
window.activeCurrency = localStorage.getItem('pc_custom_currency') || 'MXN';

// LISTA MAESTRA INQUEBRANTABLE DE DEPARTAMENTOS (FALLBACK INTEGRADO)
const DEFAULT_PC_DEPARTAMENTOS = [
    { id: 'procesadores', name: '1. Procesadores (CPUs)', icon: 'fa-microchip', order: 1 },
    { id: 'tarjetas_madre', name: '2. Tarjetas Madre (Motherboards)', icon: 'fa-chess-board', order: 2 },
    { id: 'memorias_ram_pc', name: '3. Memorias RAM PC (DIMM)', icon: 'fa-memory', order: 3 },
    { id: 'gabinetes', name: '4. Gabinetes & Chasis Gamer', icon: 'fa-server', order: 4 },
    { id: 'tarjetas_video', name: '5. Tarjetas de Video (GPUs)', icon: 'fa-vr-cardboard', order: 5 },
    { id: 'enfriamiento', name: '6. Sistemas de Enfriamiento Líquido & Aire', icon: 'fa-fan', order: 6 },
    { id: 'fuentes_energia', name: '7. Fuentes de Poder Certificadas', icon: 'fa-bolt', order: 7 },
    { id: 'ssds_m2_nvme', name: '8. Unidades SSD M.2 NVMe PCIe', icon: 'fa-hard-drive', order: 8 },
    { id: 'discos_duros_hdd_internos', name: '9. Discos Duros Internos HDD', icon: 'fa-hard-drive', order: 9 },
    { id: 'monitores_pantallas', name: '10. Monitores & Pantallas PC', icon: 'fa-desktop', order: 10 },
    { id: 'teclados', name: '11. Teclados Mecánicos & Oficina', icon: 'fa-keyboard', order: 11 },
    { id: 'ratones_mouse', name: '12. Ratones & Mouse Gamer', icon: 'fa-mouse', order: 12 },
    { id: 'combos_teclado_mouse', name: '13. Kits de Teclado y Ratón', icon: 'fa-keyboard', order: 13 },
    { id: 'laptops_portatiles', name: '14. Laptops & Computadoras Portátiles', icon: 'fa-laptop', order: 14 },
    { id: 'mini_pcs_nuc', name: '15. Mini PCs Ultracompactas & NUCs', icon: 'fa-cube', order: 15 },
    { id: 'computadoras_ensambladas', name: '16. Computadoras de Escritorio & Gaming PCs', icon: 'fa-computer', order: 16 },
    { id: 'computadoras_all_in_one', name: '17. Computadoras All-in-One (AIO)', icon: 'fa-tv', order: 17 },
    { id: 'servidores_enterprise', name: '18. Servidores Torre & Rack Enterprise', icon: 'fa-server', order: 18 },
    { id: 'no_breaks_ups', name: '19. No-Breaks & Sistemas UPS', icon: 'fa-car-battery', order: 19 },
    { id: 'reguladores_voltaje', name: '20. Reguladores de Voltaje & Supresores', icon: 'fa-bolt', order: 20 },
    { id: 'cargadores_baterias_powerbanks', name: '21. Cargadores, Baterías & Power Banks', icon: 'fa-plug-circle-bolt', order: 21 },
    { id: 'discos_duros_externos', name: '22. Unidades & Discos Externos (SSD & HDD)', icon: 'fa-hard-drive', order: 22 },
    { id: 'tarjetas_microsd', name: '23. Tarjetas de Memoria MicroSD & SD', icon: 'fa-sd-card', order: 23 },
    { id: 'memorias_usb_pendrives', name: '24. Memorias USB Flash & Pendrives', icon: 'fa-usb', order: 24 },
    { id: 'memorias_ram_laptop', name: '25. Memorias RAM para Laptop (SODIMM)', icon: 'fa-laptop', order: 25 },
    { id: 'memorias_ram_servidor', name: '26. Memorias RAM para Servidor (ECC)', icon: 'fa-server', order: 26 },
    { id: 'diademas_headsets', name: '27. Diademas & Headsets Gamer', icon: 'fa-headphones', order: 27 },
    { id: 'bocinas_sonido', name: '28. Bocinas, Barras de Sonido & Bafles', icon: 'fa-volume-high', order: 28 },
    { id: 'microfonos', name: '29. Micrófonos para Streaming & Voz', icon: 'fa-microphone', order: 29 },
    { id: 'webcams_videoconferencia', name: '30. Cámaras Web & Videoconferencia', icon: 'fa-camera', order: 30 },
    { id: 'proyectores_presentacion', name: '31. Proyectores de Video & Pantallas Murales', icon: 'fa-video', order: 31 },
    { id: 'camaras_seguridad_cctv', name: '32. Cámaras de Seguridad (IP, Bala, Domo)', icon: 'fa-video', order: 32 },
    { id: 'grabadores_dvr_nvr', name: '33. Grabadores de Video DVR & NVR', icon: 'fa-compact-disc', order: 33 },
    { id: 'control_acceso_biometricos', name: '34. Control de Acceso, Asistencia & Biometría', icon: 'fa-fingerprint', order: 34 },
    { id: 'alarmas_sensores_seguridad', name: '35. Alarmas, Sensores de Intrusión & Sirenas', icon: 'fa-shield-halved', order: 35 },
    { id: 'telefonia_conmutadores', name: '36. Conmutadores & Telefonía IP', icon: 'fa-phone', order: 36 },
    { id: 'switches_red', name: '37. Switches Ethernet & PoE+', icon: 'fa-network-wired', order: 37 },
    { id: 'routers_access_points', name: '38. Routers Inalámbricos & Access Points WiFi', icon: 'fa-wifi', order: 38 },
    { id: 'antenas_radioenlaces', name: '39. Antenas de Largo Alcance & Radioenlaces', icon: 'fa-satellite-dish', order: 39 },
    { id: 'cableado_estructurado', name: '40. Bobinas UTP, Patch Cords & Conectores RJ45', icon: 'fa-network-wired', order: 40 },
    { id: 'fibra_optica_transceivers', name: '41. Módulos Transceivers SFP & Fibra Óptica', icon: 'fa-network-wired', order: 41 },
    { id: 'racks_gabinetes_servidor', name: '42. Racks de Telecomunicaciones & Gabinetes', icon: 'fa-server', order: 42 },
    { id: 'impresoras_multifuncionales', name: '43. Impresoras de Inyección & Multifuncionales', icon: 'fa-print', order: 43 },
    { id: 'toners_laser', name: '44. Tóners para Impresoras Láser', icon: 'fa-cubes', order: 44 },
    { id: 'tintas_cartuchos', name: '45. Tintas Originales & Cartuchos', icon: 'fa-droplet', order: 45 },
    { id: 'plotters_gran_formato', name: '46. Plotters de Impresión en Gran Formato', icon: 'fa-ruler-combined', order: 46 },
    { id: 'etiquetas_ribbons', name: '47. Cintas Ribbon, Etiquetas & Papel Térmico', icon: 'fa-tags', order: 47 },
    { id: 'escaneres_digitalizadores', name: '48. Escáneres de Documentos & Cama Plana', icon: 'fa-scanner', order: 48 },
    { id: 'sistemas_operativos', name: '49. Sistemas Operativos Windows Oficiales', icon: 'fa-compact-disc', order: 49 },
    { id: 'ofimatica_productividad', name: '50. Microsoft 365 & Suites de Oficina', icon: 'fa-file-lines', order: 50 },
    { id: 'software_contable_administrativo', name: '51. Software Aspel & CONTPAQi Administrativo', icon: 'fa-calculator', order: 51 },
    { id: 'antivirus_seguridad_digital', name: '52. Antivirus & Seguridad Digital', icon: 'fa-shield', order: 52 },
    { id: 'garantias_polizas_servicio', name: '53. Pólizas & Extensiones de Garantía Oficial', icon: 'fa-certificate', order: 53 },
    { id: 'punto_de_venta', name: '54. Sistemas de Punto de Venta (POS)', icon: 'fa-barcode', order: 54 },
    { id: 'smartphones_celulares', name: '55. Teléfonos Celulares & Smartphones', icon: 'fa-mobile-screen-button', order: 55 },
    { id: 'tablets_ipads', name: '56. Tablets & iPads', icon: 'fa-tablet-screen-button', order: 56 },
    { id: 'smartwatches_wearables', name: '57. Smartwatches & Relojes Inteligentes', icon: 'fa-clock', order: 57 },
    { id: 'limpieza_mantenimiento', name: '58. Aire Comprimido, Espumas & Limpieza', icon: 'fa-spray-can-sparkles', order: 58 },
    { id: 'cables_adaptadores', name: '59. Cables de Video, USB & Adaptadores', icon: 'fa-plug', order: 59 },
    { id: 'mochilas_fundas_maletines', name: '60. Mochilas, Fundas & Maletines para Laptop', icon: 'fa-briefcase', order: 60 },
    { id: 'soportes_ergonomia', name: '61. Soportes Articulados & Bases para Monitor', icon: 'fa-tv', order: 61 },
    { id: 'hubs_docks_estaciones', name: '62. Hubs USB-C & Docking Stations', icon: 'fa-layer-group', order: 62 },
    { id: 'herramientas_servicio_tecnico', name: '63. Herramientas de Red & Ensamble Técnico', icon: 'fa-wrench', order: 63 },
    { id: 'candados_seguridad_laptop', name: '64. Candados de Seguridad Kensington', icon: 'fa-lock', order: 64 },
    { id: 'climatizacion_aires_acondicionados', name: '65. Climatización & Minisplits', icon: 'fa-snowflake', order: 65 },
    { id: 'gaming_consolas_sillas', name: '66. Sillas Gamer, Consolas & Videojuegos', icon: 'fa-gamepad', order: 66 },
    { id: 'accesorios_perifericos', name: '67. Accesorios de Cómputo & Misceláneos', icon: 'fa-boxes-stacked', order: 67 }
];

function getMasterDepartmentsList() {
    if (window.PC_DEPARTAMENTOS && Array.isArray(window.PC_DEPARTAMENTOS) && window.PC_DEPARTAMENTOS.length > 0) {
        return window.PC_DEPARTAMENTOS;
    }
    return DEFAULT_PC_DEPARTAMENTOS;
}

// 7 Departamentos Maestros en Acordeón Colapsable
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
            'laptops_portatiles',
            'mini_pcs_nuc',
            'computadoras_ensambladas',
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
            'antenas_radioenlaces',
            'cableado_estructurado',
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
            'etiquetas_ribbons',
            'escaneres_digitalizadores'
        ]
    },
    {
        id: 'master_energia',
        name: '6. ENERGÍA Y PROTECCIÓN',
        icon: 'fa-car-battery',
        deptIds: [
            'no_breaks_ups',
            'reguladores_voltaje',
            'cargadores_baterias_powerbanks'
        ]
    },
    {
        id: 'master_accesorios',
        name: '7. ACCESORIOS Y MANTENIMIENTO',
        icon: 'fa-boxes-stacked',
        deptIds: [
            'discos_duros_externos',
            'tarjetas_microsd',
            'memorias_usb_pendrives',
            'memorias_ram_laptop',
            'memorias_ram_servidor',
            'diademas_headsets',
            'bocinas_sonido',
            'microfonos',
            'webcams_videoconferencia',
            'proyectores_presentacion',
            'sistemas_operativos',
            'ofimatica_productividad',
            'software_contable_administrativo',
            'antivirus_seguridad_digital',
            'garantias_polizas_servicio',
            'punto_de_venta',
            'smartphones_celulares',
            'tablets_ipads',
            'smartwatches_wearables',
            'limpieza_mantenimiento',
            'cables_adaptadores',
            'mochilas_fundas_maletines',
            'soportes_ergonomia',
            'hubs_docks_estaciones',
            'herramientas_servicio_tecnico',
            'candados_seguridad_laptop',
            'climatizacion_aires_acondicionados',
            'gaming_consolas_sillas',
            'accesorios_perifericos'
        ]
    }
];

window.setCurrencyDisplay = function(curr) {
    try {
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
        if (typeof window.syncBoutiqueCart === 'function') window.syncBoutiqueCart();
    } catch(e) {
        console.warn("setCurrencyDisplay error:", e);
    }
};

window.formatPriceDisplay = function(priceMxn, priceUsd) {
    const isUsd = window.activeCurrency === 'USD';
    const val = isUsd ? (priceUsd || ((priceMxn || 0) / 19.50)) : (priceMxn || 0);
    return `$${Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

window.normalizeProductItem = function(p) {
    if (!p) return null;
    const priceMxn = p.precio_mxn || p.p || p.precio || p.priceMxn || 0;
    const priceUsd = p.precio_usd || p.u || p.priceUsd || (priceMxn / 19.50);
    const orig = p.precio_original || p.o || p.orig || (priceMxn * 1.3333);
    const may = p.precio_mayoreo_10pzs || p.y || p.may || (priceMxn * 0.90);
    const mayUsd = p.precio_mayoreo_usd || p.mayUsd || (may / 19.50);
    const sku = p.sku || p.s || p.clave || '';
    const cat = p.categoria_clasificada || p.c || p.cat || 'accesorios_perifericos';
    const name = p.nombre || p.n || p.descripcion_completa || p.name || '';
    const desc = p.descripcion_completa || p.d || p.desc || name;
    const marca = p.marca || p.m || 'Generica';
    const isAgotado = (p.agotado === true || p.a === 1 || p.isAgotado === true);
    const hasImg = (p.has_verified_image === true || p.i === 1 || p.hasImg === true);
    const subLabel = p.subgrupo_label || p.subLabel || '';
    const imgs = (Array.isArray(p.k) && p.k.length > 0) 
        ? p.k 
        : (Array.isArray(p.imgs) && p.imgs.length > 0) 
            ? p.imgs 
            : [`assets/img/${sku}.webp`];
    const isVolumetric = (p.is_volumetric === true || p.v === 1 || p.isVolumetric === true);

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
        subLabel,
        imgs,
        isVolumetric
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
    "ram": ["ram", "ddr5", "ddr4", "ddr3", "dimm", "sodimm", "udimm"],
    "memoria": ["memoria", "memorias"],
    "memorias": ["memoria", "memorias"],
    "disco": ["disco duro", "ssd", "nvme", "disco solido", "hdd"],
    "solido": ["ssd", "nvme", "disco solido", "m.2"],
    "ssd": ["ssd", "nvme", "disco solido", "m.2"],
    "fuente": ["fuente de poder", "power supply", "fuente atx", "psu"],
    "gabinete": ["gabinete", "chasis", "case gamer", "media torre", "mini torre", "pecera", "aquarium"],
    "pecera": ["pecera", "aquarium", "cristal templado", "panoramico", "panorámico", "dual chamber"],
    "procesador": ["procesador", "cpu", "ryzen", "core i", "core ultra", "intel core", "amd ryzen"],
    "cpu": ["procesador", "cpu", "ryzen", "core i", "core ultra"],
    "grafica": ["tarjeta de video", "tarjeta grafica", "gpu", "geforce rtx", "radeon rx"],
    "gpu": ["tarjeta de video", "gpu", "rtx", "gtx", "radeon rx"],
    "madre": ["tarjeta madre", "motherboard", "placa madre"],
    "motherboard": ["tarjeta madre", "motherboard", "placa madre"],
    "teclado": ["teclado", "keyboard"],
    "mouse": ["mouse", "raton", "ratón"],
    "monitor": ["monitor", "pantalla gamer", "pantalla led"],
    "laptop": ["laptop", "notebook", "macbook", "portatil", "portátil"],
    "laptops": ["laptop", "notebook", "macbook", "portatil", "portátil"],
    "toner": ["toner", "tóner", "cartucho de toner", "drum"],
    "toners": ["toner", "tóner", "cartucho de toner"],
    "impresora": ["impresora", "multifuncional", "copiadora", "ecotank", "laserjet"],
    "impresoras": ["impresora", "multifuncional", "copiadora"],
    "tablet": ["tablet", "tableta", "ipad", "galaxy tab"],
    "tablets": ["tablet", "tableta", "ipad", "galaxy tab"],
    "celular": ["celular", "smartphone", "telefono celular"],
    "celulares": ["celular", "smartphone", "telefono celular"]
};

const STOP_WORDS_SET = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas",
    "de", "del", "al", "a", "en", "con", "para", "por",
    "que", "se", "es", "y", "e", "o", "u", "su", "sus"
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

    const scoredResults = [];

    for (let i = 0; i < all.length; i++) {
        const p = all[i];
        const item = window.normalizeProductItem(p);
        const skuNorm = stripAccents(item.sku);
        const nameNorm = stripAccents(item.name);
        const catNorm = stripAccents(item.cat);
        const brandNorm = stripAccents(item.marca);
        const descNorm = stripAccents(item.desc);

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
            if (/(servidor|rack|1u|2u|3u|4u|42 u|42u|gabinete de piso|industrial)/.test(nameNorm + ' ' + descNorm)) {
                score -= 8000;
            }

            if (!item.isAgotado) score += 2000;
            if (item.hasImg) score += 1500;

            if (tokens.some(t => ['gabinete', 'pecera', 'aquarium'].includes(t))) {
                if (catNorm === 'gabinetes') score += 10000;
                if (nameNorm.includes('pecera') || nameNorm.includes('panorak') || nameNorm.includes('aquarium')) score += 12000;
                if (nameNorm.includes('cristal') || nameNorm.includes('panoramico')) score += 6000;
            }

            if (tokens.some(t => ['toner', 'tóner', 'toners'].includes(t))) {
                if (catNorm === 'toners_laser') score += 12000;
                if (catNorm === 'impresoras_multifuncionales') score -= 5000;
            }

            if (tokens.some(t => ['impresora', 'impresoras', 'multifuncional'].includes(t))) {
                if (catNorm === 'impresoras_multifuncionales') score += 12000;
                if (catNorm === 'toners_laser') score -= 8000;
            }

            if (tokens.some(t => ['laptop', 'laptops', 'notebook'].includes(t))) {
                if (catNorm === 'laptops_portatiles') score += 15000;
            }

            if (tokens.some(t => ['mini pc', 'minipc', 'nuc'].includes(t))) {
                if (catNorm === 'mini_pcs_nuc') score += 15000;
            }

            scoredResults.push({ score, product: p });
        }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.map(r => r.product);
}

// Controles de Presupuesto
window.setBudgetPreset = function(min, max) {
    try {
        activeMinPrice = min;
        activeMaxPrice = max;
        currentPageNumber = 1;
        
        const minInp = document.getElementById("budgetMinInput");
        const maxInp = document.getElementById("budgetMaxInput");
        if (minInp) minInp.value = min > 0 ? min : '';
        if (maxInp) maxInp.value = max < Infinity ? max : '';
        
        renderExactCatalogView();
        window.scrollToResults();
    } catch(e) {
        console.warn("setBudgetPreset error:", e);
    }
};

window.applyCustomBudget = function() {
    try {
        const minInp = document.getElementById("budgetMinInput");
        const maxInp = document.getElementById("budgetMaxInput");
        
        const minVal = parseFloat(minInp ? minInp.value : 0) || 0;
        const maxVal = parseFloat(maxInp && maxInp.value ? maxInp.value : Infinity) || Infinity;
        
        activeMinPrice = minVal;
        activeMaxPrice = maxVal;
        currentPageNumber = 1;
        
        renderExactCatalogView();
        window.scrollToResults();
    } catch(e) {
        console.warn("applyCustomBudget error:", e);
    }
};

window.setSortCriterion = function(crit) {
    try {
        currentSortCriterion = crit;
        currentPageNumber = 1;
        renderExactCatalogView();
    } catch(e) {
        console.warn("setSortCriterion error:", e);
    }
};

window.scrollToResults = function() {
    try {
        const el = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
        if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch(e) {}
};

// =========================================================================
// SUBRUTINA MAESTRA UNIFICADA: ARRANQUE NATIVO LIMPIO (ZERO-BLANK F5)
// =========================================================================
window.runCleanHomeCatalog = function() {
    try {
        activeSelectedCategory = 'Todas';
        activeSelectedBrand = 'Todas';
        activeSelectedChip = 'Todos';
        activeSearchQuery = '';
        currentPageNumber = 1;
        activeMinPrice = 0;
        activeMaxPrice = Infinity;
        activeMinDiscount = 0;

        const searchInput = document.querySelector("#main-search-input, #boutiqueSearchInput");
        if (searchInput) searchInput.value = '';

        renderSidebarFacets();
        renderExactCatalogView();
    } catch(e) {
        console.error("runCleanHomeCatalog error:", e);
    }
};

window.resetFacets = function() {
    window.runCleanHomeCatalog();
    window.scrollToResults();
};

// =========================================================================
// CATÁLOGO ULTRA RÁPIDO OFF-MAIN-THREAD (WEB WORKER + DATA CHUNKING)
// =========================================================================
// El hilo principal opera exclusivamente con js/ct-showcase-data.js para FCP/LCP instantáneo.
// La totalidad de los 17,490 productos se delega bajo demanda al Web Worker (js/catalog-worker.js)
// mediante particiones JSON (< 400 KB) en data/departments/. Cero bloqueo de CPU en el hilo principal.
window.ensureFullCatalogLoaded = function(callback) {
    if (typeof callback === 'function') callback();
};

// =========================================================================
// PUENTE DE COMUNICACIÓN CON EL WEB WORKER (OFF-MAIN-THREAD ARCHITECTURE)
// =========================================================================
let catalogWorker = null;
let isWorkerAvailable = false;
let workerMsgId = 0;
const workerCallbacks = new Map();

function getAppBaseUrl() {
    try {
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
            const origin = window.location.origin;
            const path = window.location.pathname || '';
            const dir = path.substring(0, path.lastIndexOf('/') + 1);
            return (origin + dir).replace(/\/+$/, '');
        }
    } catch(e) {}
    return '';
}

function initCatalogWorker() {
    try {
        if (typeof Worker !== 'undefined' && typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
            catalogWorker = new Worker('js/catalog-worker.js?v=20260904_chunk');
            catalogWorker.onmessage = function(e) {
                const { id, action, success, data, error } = e.data || {};
                if (action === 'ALL_LOADED') {
                    console.log(`[Worker] Inventario 100% en memoria secundaria: ${data ? data.totalProducts : 17490} productos.`);
                    const resultsCountTxt = document.getElementById("results-count-display");
                    if (resultsCountTxt && activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '')) {
                        const depts = getMasterDepartmentsList();
                        resultsCountTxt.innerHTML = `Vitrinas Oficiales por Departamento <span class="text-slate-400 font-normal">(${depts.length} Departamentos • ${(data ? data.totalProducts : 17490).toLocaleString('es-MX')} Productos)</span>`;
                    }
                    return;
                }
                if (id && workerCallbacks.has(id)) {
                    const cb = workerCallbacks.get(id);
                    workerCallbacks.delete(id);
                    cb(success ? data : null, error);
                }
            };
            catalogWorker.onerror = function(err) {
                console.warn("[Worker] Error en hilo secundario:", err);
            };

            // Iniciar worker pasando baseUrl absoluto para GitHub Pages y subdirectorios
            catalogWorker.postMessage({
                id: ++workerMsgId,
                action: 'INIT',
                payload: { baseUrl: getAppBaseUrl() }
            });
            isWorkerAvailable = true;
        }
    } catch(e) {
        console.warn("[Worker] No disponible, recurriendo a hilo principal sincrónico:", e);
        isWorkerAvailable = false;
    }
}

function queryWorkerCatalog(params, callback) {
    if (!isWorkerAvailable || !catalogWorker) {
        if (typeof callback === 'function') callback(null);
        return;
    }
    const msgId = ++workerMsgId;
    workerCallbacks.set(msgId, callback);
    const payload = Object.assign({}, params);
    if (!payload.baseUrl) payload.baseUrl = getAppBaseUrl();
    if (!payload.deptId && payload.category) payload.deptId = payload.category;

    catalogWorker.postMessage({
        id: msgId,
        action: 'QUERY_CATALOG',
        payload: payload
    });
}

function initFullCatalog() {
    try {
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
            if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
                window.runCleanHomeCatalog();
            } else {
                renderSidebarFacets();
                renderExactCatalogView();
            }
            return;
        }

        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            const d = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL;
            if (d && Array.isArray(d) && d.length > 0) {
                clearInterval(interval);
                isFullCatalogLoaded = true;
                if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
                    window.runCleanHomeCatalog();
                } else {
                    renderSidebarFacets();
                    renderExactCatalogView();
                }
            } else if (attempts > 80) {
                clearInterval(interval);
                // Si aún no está cargado, forzar renderizado limpio únicamente si sigue en Home
                if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
                    window.runCleanHomeCatalog();
                }
            }
        }, 25);
    } catch(e) {
        console.error("initFullCatalog error:", e);
        if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
            window.runCleanHomeCatalog();
        }
    }
}

// WELCOME HUB ACTUALIZADO CON VISIBILIDAD DE LAPTOPS, MINI PCS E IMPRESORAS
function renderWelcomeHub() {
    const hubContainer = document.getElementById("welcome-hub-container");
    if (!hubContainer) return;

    if (activeSelectedCategory !== 'Todas' || (activeSearchQuery && activeSearchQuery.trim() !== '') || currentPageNumber > 1) {
        hubContainer.innerHTML = '';
        hubContainer.classList.add("hidden");
        hubContainer.style.minHeight = '0px';
        return;
    }

    hubContainer.style.minHeight = '220px';
    hubContainer.classList.remove("hidden");

    const deptsMeta = window.PC_DEPARTAMENTOS || [];
    const totalCatalogProducts = deptsMeta.reduce((acc, d) => acc + (d.count || 0), 0) || 17490;
    const getCount = (id) => {
        const found = deptsMeta.find(d => d.id === id);
        return found ? found.count : 0;
    };

    const hubDepts = [
        { id: 'procesadores', name: '1. Procesadores (CPUs)', icon: 'fa-microchip', color: 'from-blue-600 to-cyan-600', badge: 'Intel Core Ultra & AMD Ryzen' },
        { id: 'tarjetas_madre', name: '2. Tarjetas Madre', icon: 'fa-chess-board', color: 'from-indigo-600 to-blue-600', badge: 'AM5, LGA1851, LGA1700' },
        { id: 'memorias_ram_pc', name: '3. Memorias RAM PC', icon: 'fa-memory', color: 'from-emerald-600 to-teal-600', badge: 'DDR5 & DDR4 DIMM' },
        { id: 'gabinetes', name: '4. Gabinetes Gamer', icon: 'fa-server', color: 'from-amber-600 to-orange-600', badge: 'Pecera, Vidrio Templado & ARGB' },
        { id: 'tarjetas_video', name: '5. Tarjetas de Video', icon: 'fa-vr-cardboard', color: 'from-purple-600 to-pink-600', badge: 'GeForce RTX & Radeon' },
        { id: 'laptops_portatiles', name: '6. Laptops & Portátiles', icon: 'fa-laptop', color: 'from-cyan-600 to-blue-500', badge: 'Gamer, ThinkPad & Ultrabooks' },
        { id: 'mini_pcs_nuc', name: '7. Mini PCs & Barebones', icon: 'fa-cube', color: 'from-indigo-700 to-purple-600', badge: 'Asus NUC, Beelink & Brix' },
        { id: 'computadoras_ensambladas', name: '8. PCs Armadas & Gamer', icon: 'fa-computer', color: 'from-emerald-500 to-cyan-600', badge: 'Gaming & Workstations' },
        { id: 'enfriamiento', name: '9. Enfriamiento Líquido', icon: 'fa-fan', color: 'from-sky-600 to-indigo-600', badge: 'Líquido AIO & Disipadores' },
        { id: 'ssds_m2_nvme', name: '10. Almacenamiento SSD', icon: 'fa-hard-drive', color: 'from-blue-700 to-cyan-700', badge: 'M.2 NVMe PCIe 4.0/5.0' },
        { id: 'fuentes_energia', name: '11. Fuentes de Poder', icon: 'fa-bolt', color: 'from-yellow-600 to-amber-600', badge: '80 Plus Gold & Bronze' },
        { id: 'monitores_pantallas', name: '12. Monitores PC', icon: 'fa-desktop', color: 'from-rose-600 to-red-600', badge: 'Gamer 144Hz - 240Hz & 4K' },
        { id: 'impresoras_multifuncionales', name: '13. Impresoras & Copiadoras', icon: 'fa-print', color: 'from-violet-600 to-purple-700', badge: 'EcoTank, LaserJet & Smart Tank' },
        { id: 'toners_laser', name: '14. Tóners Láser Certificados', icon: 'fa-fill-drip', color: 'from-amber-700 to-yellow-600', badge: 'Cartuchos & Tambores de Tóner' },
        { id: 'switches_red', name: '15. Redes & Switches', icon: 'fa-network-wired', color: 'from-blue-700 to-indigo-800', badge: 'Ethernet, PoE+ & Fibra' },
        { id: 'camaras_seguridad_cctv', name: '16. Cámaras CCTV & Alarmas', icon: 'fa-video', color: 'from-slate-700 to-cyan-900', badge: 'Cámaras IP, Bala & Domo' },
        { id: 'no_breaks_ups', name: '17. No-Breaks & UPS', icon: 'fa-car-battery', color: 'from-emerald-700 to-green-900', badge: 'Respaldo Eléctrico y Baterías' },
        { id: 'tablets_ipads', name: '18. Tablets & iPads', icon: 'fa-tablet-screen-button', color: 'from-teal-600 to-cyan-700', badge: 'Galaxy Tab, iPad & Lenovo' },
        { id: 'punto_de_venta', name: '19. Punto de Venta & Kioscos', icon: 'fa-cash-register', color: 'from-orange-600 to-red-600', badge: 'Terminales POS & Código Barras' },
        { id: 'limpieza_mantenimiento', name: '20. Limpieza & Servicio', icon: 'fa-spray-can-sparkles', color: 'from-teal-700 to-emerald-800', badge: 'Aire Comprimido & Espumas' }
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
                            Catálogo verificado por entidad física: selecciona una sección para abrir su vitrina completa
                        </p>
                    </div>
                </div>
                <span class="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full w-fit">
                    ${totalCatalogProducts.toLocaleString('es-MX')} Productos en Catálogo
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


window.selectSubcategoryChip = function(chip) {
    try {
        activeSelectedChip = chip;
        currentPageNumber = 1;
        renderExactCatalogView();
        window.scrollToResults();
    } catch(e) {
        console.warn("selectSubcategoryChip error:", e);
    }
};

window.selectCategoryFacet = function(catId) {
    try {
        activeSelectedCategory = catId;
        activeSelectedChip = 'Todos';
        activeSelectedBrand = 'Todas';
        activeSearchQuery = '';
        currentPageNumber = 1;

        const searchInput = document.querySelector("#main-search-input, #boutiqueSearchInput");
        if (searchInput) searchInput.value = '';

        renderSidebarFacets();
        renderExactCatalogView();

        const target = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
        if (target && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (typeof window.ensureFullCatalogLoaded === 'function') {
            window.ensureFullCatalogLoaded(() => {
                if (activeSelectedCategory === catId) {
                    renderSidebarFacets();
                    renderExactCatalogView();
                }
            });
        }
    } catch(e) {
        console.error("selectCategoryFacet error:", e);
    }
};

window.selectDepartmentWithSubcategory = function(catId, subName) {
    try {
        activeSelectedCategory = catId;
        activeSelectedChip = subName || 'Todos';
        activeSelectedBrand = 'Todas';
        activeSearchQuery = '';
        currentPageNumber = 1;

        const searchInput = document.querySelector("#main-search-input, #boutiqueSearchInput");
        if (searchInput) searchInput.value = '';

        renderSidebarFacets();
        renderExactCatalogView();

        const target = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
        if (target && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (typeof window.ensureFullCatalogLoaded === 'function') {
            window.ensureFullCatalogLoaded(() => {
                if (activeSelectedCategory === catId) {
                    renderSidebarFacets();
                    renderExactCatalogView();
                }
            });
        }
    } catch(e) {
        console.error("selectDepartmentWithSubcategory error:", e);
    }
};
window.selectCategoryWithSubchip = window.selectDepartmentWithSubcategory;

window.scrollToDepartments = function() {
    try {
        const target = document.getElementById("sidebar-facets") || document.getElementById("sidebar-facets-root") || document.getElementById("main-search-input") || document.getElementById("boutiqueSearchInput");
        if (target && typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch(e) {}
};

function bootMasterZeroBlank() {
    try {
        initFullCatalog();
        initPredictiveSearchEngine();
        initCatalogWorker();
        if (typeof window.syncBoutiqueCart === 'function') window.syncBoutiqueCart();
        if (typeof window.renderMobileDepartmentsHub === 'function') window.renderMobileDepartmentsHub();
        if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
            window.runCleanHomeCatalog();
        }
    } catch(e) {
        console.error("bootMasterZeroBlank error:", e);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootMasterZeroBlank);
} else {
    bootMasterZeroBlank();
}
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
        if (activeSelectedChip && activeSelectedChip !== 'Todos') {
            items = items.filter(p => {
                const item = window.normalizeProductItem(p);
                return item && item.subLabel === activeSelectedChip;
            });
        }
    } else if (activeSelectedChip && activeSelectedChip !== 'Todos') {
        items = items.filter(p => {
            const item = window.normalizeProductItem(p);
            return item && item.subLabel === activeSelectedChip;
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

    // PRIORIDAD EN GABINETES: PECERA, CRISTAL TEMPLADO Y GAMING PRIMERO
    if (activeSelectedCategory === 'gabinetes' && currentSortCriterion === 'destacados') {
        items.sort((a, b) => {
            const aItem = window.normalizeProductItem(a);
            const bItem = window.normalizeProductItem(b);
            
            const aHasImg = aItem.hasImg ? 1 : 0;
            const bHasImg = bItem.hasImg ? 1 : 0;
            if (aHasImg !== bHasImg) return bHasImg - aHasImg;

            const gabScore = (item) => {
                const text = (item.name + ' ' + item.desc).toLowerCase();
                let score = 0;
                if (/(pecera|aquarium|cristal templado|vidrio templado|panoramico|panorámico|tempered glass|vista panoramica|vista panorámica|dual chamber|acuari)/.test(text)) {
                    score += 6000;
                }
                if (/(argb|rgb|fan argb|iluminacion|iluminación|ventiladores)/.test(text)) {
                    score += 2500;
                }
                if (/(gamer|gaming|media torre|mid tower|mini torre|full tower|torre completa)/.test(text)) {
                    score += 1500;
                }
                if (/(servidor|rack|1u|2u|3u|4u|industrial)/.test(text)) {
                    score -= 8000;
                }
                return score;
            };

            const scoreDiff = gabScore(bItem) - gabScore(aItem);
            if (scoreDiff !== 0) return scoreDiff;

            return aItem.priceMxn - bItem.priceMxn;
        });
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
        'teclados': 'keyboard_placeholder.jpg',
        'ratones_mouse': 'mouse_placeholder.jpg',
        'combos_teclado_mouse': 'keyboard_placeholder.jpg',
        'diademas_headsets': 'elec_placeholder.jpg',
        'bocinas_sonido': 'elec_placeholder.jpg',
        'computadoras_ensambladas': 'pc_placeholder.jpg',
        'laptops_portatiles': 'lap_placeholder.jpg',
        'computadoras_all_in_one': 'pc_placeholder.jpg',
        'mini_pcs_nuc': 'minipc_placeholder.jpg',
        'servidores_enterprise': 'pc_placeholder.jpg',
        'switches_red': 'redes_placeholder.jpg',
        'routers_access_points': 'redes_placeholder.jpg',
        'camaras_seguridad_cctv': 'cctv_placeholder.jpg',
        'grabadores_dvr_nvr': 'cctv_placeholder.jpg',
        'control_acceso_biometricos': 'cctv_placeholder.jpg',
        'alarmas_sensores_seguridad': 'cctv_placeholder.jpg',
        'telefonia_conmutadores': 'cctv_placeholder.jpg',
        'impresoras_multifuncionales': 'imp_placeholder.jpg',
        'toners_laser': 'toner_placeholder.jpg',
        'tintas_cartuchos': 'toner_placeholder.jpg',
        'etiquetas_ribbons': 'toner_placeholder.jpg',
        'plotters_gran_formato': 'imp_placeholder.jpg',
        'sistemas_operativos': 'sof_placeholder.jpg',
        'ofimatica_productividad': 'sof_placeholder.jpg',
        'antivirus_seguridad_digital': 'sof_placeholder.jpg',
        'punto_de_venta': 'pos_placeholder.jpg',
        'smartphones_celulares': 'lap_placeholder.jpg',
        'tablets_ipads': 'lap_placeholder.jpg',
        'cables_adaptadores': 'cable_placeholder.jpg',
        'limpieza_mantenimiento': 'clean_placeholder.jpg',
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

function renderProductCardHTML(p, viewStyle, isPriority = false) {
    const item = window.normalizeProductItem(p);
    if (!item) return '';

    const title = item.name.replace(/'/g, "&#39;").replace(/"/g, '&quot;');
    const localImg = `assets/img/${item.sku}.webp`;
    const imgLoadingAttrs = isPriority 
        ? 'fetchpriority="high" decoding="async"' 
        : 'loading="lazy" decoding="async"';

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
                            ${imgLoadingAttrs} 
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
                            onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `addToCartCT('${item.sku}', event)`}" 
                            aria-label="Agregar ${title} al carrito" 
                            class="btn-action flex-1 ${item.isAgotado ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow active:scale-95'} font-mono text-[10.5px] font-bold rounded-xl py-2 transition cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
                        >
                            <i class="fa-solid ${item.isAgotado ? 'fa-clock' : 'fa-cart-plus'} text-xs"></i> <span>${item.isAgotado ? 'Apartar' : '+ Carrito'}</span>
                        </button>
                    </div>
                    <button 
                        onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `buyNowCT('${item.sku}', event)`}" 
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
                    <img src="${localImg}" alt="${title}" width="120" height="120" ${imgLoadingAttrs} class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${item.sku}', '${item.cat}')" />
                </div>
                <div class="flex-1 min-w-0 text-left">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">${item.cat.replace(/_/g, ' ')} • SKU: ${item.sku}</span>
                        ${item.subLabel ? `<span class="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">${item.subLabel}</span>` : ''}
                    </div>
                    <h3 onclick="openProductDetailModal('${item.sku}')" class="text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-300 transition line-clamp-2 cursor-pointer mb-1.5">${title}</h3>
                    <div class="text-[11px] font-mono ${item.isAgotado ? 'text-amber-400' : 'text-slate-400'}">
                        ${item.isAgotado ? '<i class="fa-solid fa-clock"></i> Bajo Pedido hasta su próxima existencia' : 'Entrega Inmediata en Pedro Moreno 501 A • Garantía Directa'}
                    </div>
                </div>
                <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 shrink-0 space-y-2">
                    <div class="text-right">
                        <span class="text-[10px] text-slate-500 line-through font-mono block">${window.formatPriceDisplay(item.orig, (item.priceUsd || (item.priceMxn/19.5))*1.33)}</span>
                        <div class="text-sm sm:text-base font-black text-emerald-400 font-mono">${window.formatPriceDisplay(item.priceMxn, item.priceUsd)}</div>
                    </div>
                    <div class="flex gap-1.5 w-full">
                        <button onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `addToCartCT('${item.sku}', event)`}" class="flex-1 ${item.isAgotado ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 hover:bg-blue-500 text-white'} font-bold py-2 rounded-xl text-[10.5px] font-mono uppercase flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer min-h-[40px]">
                            <i class="fa-solid ${item.isAgotado ? 'fa-clock' : 'fa-cart-plus'}"></i> ${item.isAgotado ? 'Bajo Pedido' : '+Carrito'}
                        </button>
                        <button onclick="${item.isAgotado ? `openProductDetailModal('${item.sku}')` : `buyNowCT('${item.sku}', event)`}" class="flex-1 ${item.isAgotado ? 'bg-slate-800 text-amber-300 border border-amber-500/40' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white'} font-black py-2 rounded-xl text-[10.5px] font-mono uppercase flex items-center justify-center gap-1 transition active:scale-95 shadow cursor-pointer min-h-[40px]">
                            <i class="fa-solid ${item.isAgotado ? 'fa-hourglass-half' : 'fa-bolt'}"></i> ${item.isAgotado ? 'Apartar' : 'Comprar'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }
}

function renderShowcaseVitrinas(container) {
    const all = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
    const depts = getMasterDepartmentsList();

    const bars = document.querySelectorAll(".pagination-target-bar");
    bars.forEach(b => b.innerHTML = '');

    // Agrupación en una sola pasada O(N) para liberar la CPU
    const productsByDept = new Map();
    for (let i = 0; i < all.length; i++) {
        const prod = all[i];
        const cat = prod.categoria_clasificada || prod.c;
        let list = productsByDept.get(cat);
        if (!list) {
            list = [];
            productsByDept.set(cat, list);
        }
        list.push(prod);
    }

    // Filtrar sólo departamentos con productos activos
    const activeDepts = depts.filter(dept => {
        const list = productsByDept.get(dept.id);
        return list && list.length > 0;
    });

    const resultsCountTxt = document.getElementById("results-count-display");
    if (resultsCountTxt) {
        resultsCountTxt.innerHTML = `Vitrinas Oficiales por Departamento <span class="text-slate-400 font-normal">(${activeDepts.length} Departamentos • ${all.length.toLocaleString('es-MX')} Productos)</span>`;
    }

    container.className = "flex flex-col gap-2 pb-6";

    // Función auxiliar para construir el HTML de una sola vitrina (exactamente el mismo HTML)
    const buildVitrinaMarkup = (dept, isFirstVitrina) => {
        let deptProducts = productsByDept.get(dept.id) || [];
        if (deptProducts.length === 0) return '';

        if (dept.id === 'gabinetes') {
            deptProducts = [...deptProducts].sort((a, b) => {
                const aItem = window.normalizeProductItem(a);
                const bItem = window.normalizeProductItem(b);
                const aHasImg = aItem.hasImg ? 1 : 0;
                const bHasImg = bItem.hasImg ? 1 : 0;
                if (aHasImg !== bHasImg) return bHasImg - aHasImg;

                const isPecera = (it) => /(pecera|aquarium|cristal templado|vidrio templado|panoramico|panorámico|tempered glass|dual chamber)/i.test(it.name + ' ' + it.desc);
                const aP = isPecera(aItem) ? 1 : 0;
                const bP = isPecera(bItem) ? 1 : 0;
                if (aP !== bP) return bP - aP;

                return aItem.priceMxn - bItem.priceMxn;
            });
        }

        const sample = deptProducts.slice(0, 4);

        return `
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
                                Entrega inmediata y garantía directa en Guadalajara
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
                    ${sample.map((p, idx) => renderProductCardHTML(p, 'grid', isFirstVitrina && idx < 2)).join('')}
                </div>
            </section>
        `;
    };

    // FASE 1: Renderizar inmediatamente las primeras 2 vitrinas (Pantalla visible)
    const initialDepts = activeDepts.slice(0, 2);
    const remainingDepts = activeDepts.slice(2);

    let initialHtml = '';
    for (let i = 0; i < initialDepts.length; i++) {
        initialHtml += buildVitrinaMarkup(initialDepts[i], i === 0);
    }
    container.innerHTML = initialHtml;

    // FASE 2: Renderizado progresivo por lotes pequeños (libera el procesador móvil)
    if (remainingDepts.length > 0) {
        const renderToken = Date.now();
        container._vitrinaRenderToken = renderToken;
        let currentIndex = 0;
        const BATCH_SIZE = 3; // Lotes de 3 vitrinas para no superar los 50ms por tarea

        function renderNextBatch() {
            if (container._vitrinaRenderToken !== renderToken) return;
            if (currentIndex >= remainingDepts.length) return;

            const chunk = remainingDepts.slice(currentIndex, currentIndex + BATCH_SIZE);
            let chunkHtml = '';
            for (let j = 0; j < chunk.length; j++) {
                chunkHtml += buildVitrinaMarkup(chunk[j], false);
            }
            container.insertAdjacentHTML('beforeend', chunkHtml);
            currentIndex += BATCH_SIZE;

            if (currentIndex < remainingDepts.length) {
                // Cede el control al navegador antes del siguiente lote
                if (typeof requestIdleCallback === 'function') {
                    requestIdleCallback(renderNextBatch, { timeout: 100 });
                } else {
                    setTimeout(renderNextBatch, 25);
                }
            }
        }

        // Arrancar la carga progresiva en el siguiente tiempo libre
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(renderNextBatch, { timeout: 150 });
        } else {
            setTimeout(renderNextBatch, 50);
        }
    }
}

function renderPaginatedDepartmentView(container, resultsCountTxt) {
    // 1. Render defensivo inmediato sincrónico (Zero-Wait / Zero-Blank)
    renderPaginatedDepartmentViewSync(container, resultsCountTxt);

    // 2. Si el Web Worker está disponible, delegar consulta y particionado fuera del hilo principal
    if (isWorkerAvailable && catalogWorker) {
        const queryToken = ++workerMsgId;
        container._activeQueryToken = queryToken;

        queryWorkerCatalog({
            query: activeSearchQuery,
            category: activeSelectedCategory,
            deptId: activeSelectedCategory,
            chip: activeSelectedChip,
            minPrice: activeMinPrice,
            maxPrice: activeMaxPrice,
            sort: currentSortCriterion,
            page: currentPageNumber,
            pageSize: productsPerPage
        }, (data, err) => {
            if (container._activeQueryToken !== queryToken) return;
            if (data && Array.isArray(data.items)) {
                if (data.items.length > 0) {
                    renderPaginatedDepartmentViewFromItems(container, resultsCountTxt, data.items, data.totalCount, data.totalPages, data.currentPage, data.availableSubs, data.subcategories);
                } else if (activeSearchQuery && activeSearchQuery.trim() !== '') {
                    // Búsqueda sin resultados reales
                    renderPaginatedDepartmentViewFromItems(container, resultsCountTxt, [], 0, 1, 1, [], []);
                } else if (activeMinPrice > 0 || (typeof activeMaxPrice === 'number' && isFinite(activeMaxPrice) && activeMaxPrice < Infinity)) {
                    // Filtros de precio no arrojaron resultados
                    renderPaginatedDepartmentViewFromItems(container, resultsCountTxt, [], 0, 1, 1, [], []);
                }
            }
        });
        return;
    }
}

function renderPaginatedDepartmentViewFromItems(container, resultsCountTxt, pageItems, totalCount, totalPages, currentPage, availableSubs, subcategories) {
    currentActiveTotalPages = totalPages || 1;
    if (typeof currentPage === 'number' && currentPage > 0) {
        currentPageNumber = currentPage;
    }
    const startIdx = (currentPageNumber - 1) * productsPerPage;

    if (resultsCountTxt) {
        let titleTxt = '';
        if (activeSearchQuery) {
            titleTxt = `Búsqueda: "${activeSearchQuery}" <span class="text-slate-400 font-normal">(${totalCount.toLocaleString('es-MX')} productos • Página ${currentPageNumber} de ${totalPages})</span>`;
        } else if (activeSelectedCategory !== 'Todas') {
            const depts = getMasterDepartmentsList();
            const deptObj = depts.find(d => d.id === activeSelectedCategory);
            const deptName = deptObj ? deptObj.name : activeSelectedCategory.replace(/_/g, ' ').toUpperCase();

            titleTxt = `
                <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="window.runCleanHomeCatalog()" class="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <i class="fa-solid fa-arrow-left"></i> Volver a Vitrinas
                    </button>
                    <span class="text-slate-500">|</span>
                    <span>${deptName}</span>
                    <span class="text-slate-400 font-normal text-xs">(${totalCount.toLocaleString('es-MX')} productos • Página ${currentPageNumber} de ${totalPages})</span>
                </div>
            `;
        } else {
            titleTxt = `Aparador Principal <span class="text-slate-400 font-normal">(${startIdx + 1}-${Math.min(startIdx + productsPerPage, totalCount)} de ${totalCount.toLocaleString('es-MX')})</span>`;
        }
        resultsCountTxt.innerHTML = titleTxt;
    }

    renderPaginationBar(totalPages);

    // Normalizar subcategorías
    const subsList = (subcategories && Array.isArray(subcategories) && subcategories.length > 0)
        ? subcategories
        : ((window.PC_SUBDEPARTAMENTOS && window.PC_SUBDEPARTAMENTOS[activeSelectedCategory]) || (availableSubs || []).map(s => typeof s === 'object' ? s : { name: s, count: null }));

    let headerControlsHTML = '';
    if (activeSelectedCategory !== 'Todas' || (activeSearchQuery && activeSearchQuery.trim() !== '')) {
        let subChipsHTML = '';
        if (activeSelectedCategory !== 'Todas' && subsList.length > 0) {
            subChipsHTML = `
                <div class="w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-md mb-3">
                    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span class="text-[10px] font-mono font-bold text-slate-400 shrink-0 flex items-center gap-1 px-1">
                            <i class="fa-solid fa-filter text-cyan-400"></i> Subdepartamentos:
                        </span>
                        <button type="button" onclick="window.selectSubcategoryChip('Todos')" class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 ${activeSelectedChip === 'Todos' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}">
                            Todos
                        </button>
                        ${subsList.map(s => {
                            const isSelected = activeSelectedChip === s.name;
                            const countTxt = (typeof s.count === 'number') ? ` <span class="text-[10px] opacity-75">(${s.count})</span>` : '';
                            return `
                                <button type="button" onclick="window.selectSubcategoryChip('${s.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 ${isSelected ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}">
                                    ${s.name}${countTxt}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        headerControlsHTML = `
            <div class="col-span-full w-full">
                <button onclick="window.runCleanHomeCatalog()" class="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg text-sm border border-slate-700 transition-colors">
                    <i class="fa-solid fa-arrow-left"></i> Volver a Todas las Vitrinas
                </button>
                ${subChipsHTML}
            </div>
        `;
    }

    if (pageItems.length === 0) {
        container.className = "w-full py-16 text-center text-slate-300 font-mono text-sm bg-slate-900/90 border border-slate-800 rounded-2xl";
        container.innerHTML = `
            ${headerControlsHTML}
            <i class="fa-solid fa-box-open text-4xl text-cyan-400 mb-3 block" aria-hidden="true"></i>
            No se encontraron productos en esta sección con los filtros actuales.
            <br><button onclick="window.resetFacets()" aria-label="Ver todas las vitrinas" class="btn-action mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-lg min-h-[44px]">Ver Todas las Vitrinas</button>
        `;
        return;
    }

    if (currentViewStyle === 'grid') {
        container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2";
        container.innerHTML = headerControlsHTML + pageItems.map(p => renderProductCardHTML(p, 'grid')).join('');
    } else {
        container.className = "flex flex-col gap-3.5 pb-2";
        container.innerHTML = headerControlsHTML + pageItems.map(p => renderProductCardHTML(p, 'list')).join('');
    }
}

function renderPaginatedDepartmentViewSync(container, resultsCountTxt) {
    const maxPages = getMaxAvailablePages();
    if (currentPageNumber > maxPages) currentPageNumber = maxPages;

    const filtered = getFilteredList();
    const totalCount = (activeSelectedCategory !== 'Todas') 
        ? (((window.PC_DEPARTAMENTOS && window.PC_DEPARTAMENTOS.find(d => d.id === activeSelectedCategory)) || {}).count || filtered.length)
        : filtered.length;
    const totalPages = maxPages;
    const startIdx = (currentPageNumber - 1) * productsPerPage;
    const pageItems = filtered.slice(startIdx, startIdx + productsPerPage);
    
    let availableSubs = [];
    if (activeSelectedCategory !== 'Todas') {
        if (window.PC_SUBDEPARTAMENTOS && window.PC_SUBDEPARTAMENTOS[activeSelectedCategory]) {
            availableSubs = window.PC_SUBDEPARTAMENTOS[activeSelectedCategory];
        } else {
            const allDeptItems = (window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || []).filter(p => (p.categoria_clasificada || p.c || '').toLowerCase() === activeSelectedCategory.toLowerCase());
            availableSubs = Array.from(new Set(allDeptItems.map(p => (window.normalizeProductItem(p) || {}).subLabel).filter(Boolean)));
        }
    }
    
    // Si la categoría seleccionada tiene 0 productos sincrónicos en esta página Y aún no está el catálogo completo ni el worker
    // mostramos un estado de carga elegante en lugar del mensaje erróneo "No se encontraron productos"
    if (pageItems.length === 0 && activeSelectedCategory !== 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && (!window.CT_CATALOG_DATA || window.CT_CATALOG_DATA.length < 1000)) {
        const depts = getMasterDepartmentsList();
        const deptObj = depts.find(d => d.id === activeSelectedCategory);
        const deptName = deptObj ? deptObj.name : activeSelectedCategory.replace(/_/g, ' ').toUpperCase();
        
        if (resultsCountTxt) {
            resultsCountTxt.innerHTML = `
                <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="window.resetFacets()" class="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <i class="fa-solid fa-arrow-left"></i> Volver a Vitrinas
                    </button>
                    <span class="text-slate-500">|</span>
                    <span>${deptName}</span>
                    <span class="text-cyan-400 font-mono text-xs animate-pulse">(Cargando página ${currentPageNumber} de ${totalPages}...)</span>
                </div>
            `;
        }
        container.className = "w-full py-16 text-center text-slate-300 font-mono text-sm bg-slate-900/90 border border-slate-800 rounded-2xl";
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center gap-3">
                <i class="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-400"></i>
                <p class="text-slate-300 font-medium text-sm">Cargando vitrina de <span class="text-cyan-300 font-bold">${deptName}</span> (Página ${currentPageNumber} de ${totalPages})...</p>
                <p class="text-slate-500 text-xs">Optimizando inventario en memoria ultra rápida</p>
            </div>
        `;
        return;
    }

    renderPaginatedDepartmentViewFromItems(container, resultsCountTxt, pageItems, totalCount, totalPages, currentPageNumber, availableSubs);
}

function renderExactCatalogView() {
    try {
        const container = document.getElementById("products-grid-container");
        const resultsCountTxt = document.getElementById("results-count-display");
        if (!container) return;

        if (typeof window.renderMobileDepartmentsHub === 'function') {
            window.renderMobileDepartmentsHub();
        }

        if (activeSelectedCategory === 'Todas' && (!activeSearchQuery || activeSearchQuery.trim() === '') && currentPageNumber === 1) {
            renderWelcomeHub();
            renderShowcaseVitrinas(container);
            return;
        }

        const hubContainer = document.getElementById("welcome-hub-container");
        if (hubContainer) {
            hubContainer.innerHTML = '';
            hubContainer.classList.add("hidden");
            hubContainer.style.minHeight = '0px';
        }

        renderPaginatedDepartmentView(container, resultsCountTxt);
    } catch(e) {
        console.error("renderExactCatalogView error:", e);
    }
}

let currentActiveTotalPages = 1;

function getMaxAvailablePages() {
    if (currentActiveTotalPages > 1) {
        return currentActiveTotalPages;
    }
    if (activeSelectedCategory !== 'Todas') {
        const depts = (window.PC_DEPARTAMENTOS && Array.isArray(window.PC_DEPARTAMENTOS)) ? window.PC_DEPARTAMENTOS : getMasterDepartmentsList();
        const deptObj = depts.find(d => d.id === activeSelectedCategory);
        if (deptObj && typeof deptObj.count === 'number' && deptObj.count > 0) {
            let count = deptObj.count;
            if (activeSelectedChip && activeSelectedChip !== 'Todos' && window.PC_SUBDEPARTAMENTOS && window.PC_SUBDEPARTAMENTOS[activeSelectedCategory]) {
                const sub = window.PC_SUBDEPARTAMENTOS[activeSelectedCategory].find(s => s.name === activeSelectedChip);
                if (sub && typeof sub.count === 'number') count = sub.count;
            }
            return Math.ceil(count / productsPerPage) || 1;
        }
    }
    const filtered = getFilteredList();
    return Math.ceil(filtered.length / productsPerPage) || 1;
}

function renderPaginationBar(totalPages) {
    const bars = document.querySelectorAll(".pagination-target-bar");
    if (!bars.length) return;

    currentActiveTotalPages = totalPages || currentActiveTotalPages || 1;

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
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    const html = `
        <div class="w-full flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-white">
            <div class="flex items-center gap-1.5">
                <button 
                    type="button"
                    onclick="window.goToPage(${current - 1})" 
                    ${current === 1 ? 'disabled class="px-3 py-2 rounded-xl bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed text-xs font-bold min-h-[40px]"' : 'class="btn-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-400 cursor-pointer text-xs font-bold transition shadow min-h-[40px] flex items-center gap-1"'}
                    aria-label="Página anterior"
                >
                    <i class="fa-solid fa-chevron-left text-[11px]"></i>
                    <span>Anterior</span>
                </button>
            </div>

            <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                ${pages.map(p => {
                    if (p === '...') return `<span class="px-2 py-1 text-slate-500 font-bold select-none">...</span>`;
                    const isActive = p === current;
                    return `
                        <button 
                            type="button" 
                            onclick="window.goToPage(${p})" 
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
                    <label class="text-[10.5px]">Ir a:</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="${totalPages}" 
                        value="${current}" 
                        onkeydown="if(event.key==='Enter'){event.preventDefault(); window.goToPage(parseInt(this.value, 10));}"
                        class="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 text-center text-white text-xs font-bold outline-none focus:border-cyan-400 font-mono"
                    />
                    <button 
                        type="button" 
                        onclick="const inp=this.previousElementSibling; if(inp){window.goToPage(parseInt(inp.value, 10));}"
                        class="btn-action bg-blue-600 hover:bg-blue-500 text-white font-black px-2.5 py-1 rounded-lg text-[10px] uppercase cursor-pointer transition shadow"
                    >
                        Ir
                    </button>
                </div>

                <button 
                    type="button"
                    onclick="window.goToPage(${current + 1})" 
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
    try {
        const p = parseInt(page, 10);
        if (isNaN(p) || p < 1) return;
        
        const maxPages = getMaxAvailablePages();
        if (p > maxPages) return;
        
        currentPageNumber = p;
        renderExactCatalogView();
        
        const showcaseTarget = document.getElementById("results-count-display") || document.getElementById("products-grid-container");
        if (showcaseTarget && typeof showcaseTarget.scrollIntoView === 'function') {
            showcaseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch(e) {
        console.error("goToPage error:", e);
    }
}
window.goToPage = goToPage;

// MENÚ LATERAL: 7 ACORDEONES + BOTONES PATROCINADOS GEMINI & ANTIGRAVITY
function renderSidebarFacets() {
    try {
        const root = document.getElementById("sidebar-facets") || document.getElementById("sidebar-facets-root");
        if (!root) return;

        const depts = (window.PC_DEPARTAMENTOS && Array.isArray(window.PC_DEPARTAMENTOS) && window.PC_DEPARTAMENTOS.length > 0)
            ? window.PC_DEPARTAMENTOS
            : getMasterDepartmentsList();

        const totalItems = depts.reduce((sum, d) => sum + (d.count || 0), 0) || 17490;

        const renderMasterAccordion = (master) => {
            const isParentOfActive = master.deptIds.includes(activeSelectedCategory);
            
            const childDepts = master.deptIds
                .map(id => depts.find(d => d.id === id))
                .filter(Boolean);

            const masterCount = childDepts.reduce((sum, d) => sum + (d.count || 0), 0);

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
                            const count = c.count || 0;
                            const isSelected = activeSelectedCategory === c.id;
                            const subs = (window.PC_SUBDEPARTAMENTOS && window.PC_SUBDEPARTAMENTOS[c.id]) || [];
                            return `
                                <div class="py-0.5">
                                    <label for="cat_${c.id}" class="category-link flex items-center justify-between cursor-pointer hover:text-cyan-300 transition py-1">
                                        <span class="flex items-center gap-2 truncate pr-1">
                                            <input type="radio" id="cat_${c.id}" name="cat_facet" aria-label="${c.name}" ${isSelected ? 'checked' : ''} onchange="window.selectCategoryFacet('${c.id}')" class="accent-cyan-400 cursor-pointer shrink-0" />
                                            <i class="fa-solid ${c.icon} text-cyan-400 w-3 text-center shrink-0 text-[10px]" aria-hidden="true"></i>
                                            <span class="cat-title truncate ${isSelected ? 'font-black text-cyan-300' : 'text-slate-300'} text-[10.5px]">${c.name}</span>
                                        </span>
                                        <span class="cat-count font-mono text-[9px] text-slate-400 shrink-0">(${count.toLocaleString('es-MX')})</span>
                                    </label>
                                    ${(isSelected && subs.length > 0) ? `
                                        <div class="flex flex-wrap gap-1 pl-4 pt-1 pb-1">
                                            <button type="button" onclick="window.selectSubcategoryChip('Todos')" class="text-[9px] font-mono px-1.5 py-0.5 rounded ${activeSelectedChip === 'Todos' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white'} transition cursor-pointer">
                                                Todos
                                            </button>
                                            ${subs.map(s => `
                                                <button type="button" onclick="window.selectSubcategoryChip('${s.name.replace(/'/g, "\\'")}')" class="text-[9px] font-mono px-1.5 py-0.5 rounded ${activeSelectedChip === s.name ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-cyan-300'} transition cursor-pointer">
                                                    ${s.name} <span class="opacity-75">(${s.count})</span>
                                                </button>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </details>
            `;
        };

        root.innerHTML = `
            <div class="bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 text-white p-3 rounded-t-2xl font-bold text-xs uppercase flex items-center justify-between shadow-lg">
                <h2 class="flex items-center gap-2 text-cyan-300 font-mono text-xs"><i class="fa-solid fa-sliders text-cyan-400" aria-hidden="true"></i> Departamentos</h2>
                <span class="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">${totalItems.toLocaleString('es-MX')} Items</span>
            </div>

            <div class="p-3 bg-slate-900/95 border-x border-b border-slate-800 rounded-b-2xl text-slate-200 text-xs shadow-2xl flex flex-col justify-between space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
                
                <div class="flex gap-2">
                    <button id="btn-aplicar" onclick="renderExactCatalogView()" aria-label="Aplicar filtros seleccionados" class="btn-action flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-[11px] uppercase transition cursor-pointer shadow min-h-[40px]">
                        Aplicar
                    </button>
                    <button id="btn-limpiar" onclick="window.resetFacets()" aria-label="Limpiar todos los filtros" class="btn-action flex-1 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-200 hover:text-red-400 font-bold rounded-xl text-[11px] uppercase transition cursor-pointer min-h-[40px]">
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
                        <span class="font-mono text-[9.5px] text-cyan-300 font-bold">(${totalItems.toLocaleString('es-MX')})</span>
                    </label>
                </div>

                <!-- LOS 7 DEPARTAMENTOS MAESTROS COLAPSABLES -->
                <div class="space-y-1.5 pr-0.5">
                    ${MASTER_DEPARTMENTS.map(renderMasterAccordion).join('')}
                </div>

                <!-- BOTONES PATROCINADOS OFICIALES: GEMINI ADVANCED & ANTIGRAVITY -->
                <div class="pt-2 border-t border-slate-800 space-y-2">
                    <a 
                        href="https://gemini.google.com/advanced" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="group w-full p-2.5 rounded-xl bg-gradient-to-r from-blue-950/90 via-indigo-950 to-purple-950/90 border border-indigo-500/40 hover:border-cyan-400 flex items-center justify-between transition-all duration-200 shadow-md hover:shadow-indigo-500/20 cursor-pointer text-left block"
                    >
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs shadow shrink-0 group-hover:scale-105 transition">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                            </div>
                            <div class="truncate">
                                <span class="text-[11px] font-mono font-black text-white group-hover:text-cyan-300 block truncate">
                                    Suscríbete a Gemini
                                </span>
                                <span class="text-[9px] font-mono text-purple-300 block truncate">
                                    Inteligencia Artificial de Google
                                </span>
                            </div>
                        </div>
                        <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-purple-400 group-hover:text-white shrink-0 ml-1"></i>
                    </a>

                    <a 
                        href="https://github.com/iaworldcenter-creator" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="group w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-emerald-950/90 border border-cyan-500/40 hover:border-emerald-400 flex items-center justify-between transition-all duration-200 shadow-md hover:shadow-cyan-500/20 cursor-pointer text-left block"
                    >
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 text-xs shadow shrink-0 group-hover:scale-105 transition">
                                <i class="fa-solid fa-atom"></i>
                            </div>
                            <div class="truncate">
                                <span class="text-[11px] font-mono font-black text-white group-hover:text-emerald-300 block truncate">
                                    Descarga Anti Gravity
                                </span>
                                <span class="text-[9px] font-mono text-cyan-300 block truncate">
                                    Prueba su Inteligencia Autónoma
                                </span>
                            </div>
                        </div>
                        <i class="fa-solid fa-download text-[10px] text-cyan-400 group-hover:text-white shrink-0 ml-1"></i>
                    </a>
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
    } catch(e) {
        console.error("renderSidebarFacets error:", e);
    }
}
window.renderSidebarFacets = renderSidebarFacets;

// DRAWER DESLIZANTE PARA MÓVIL (67 DEPARTAMENTOS EN CELULAR)
window.toggleMobileDepartmentsDrawer = function(open) {
    try {
        const drawer = document.getElementById("mobile-departments-drawer");
        const backdrop = document.getElementById("mobile-departments-backdrop");
        if (!drawer) return;

        if (open) {
            window.renderMobileDepartmentsList();
            drawer.classList.remove("hidden");
            if (backdrop) backdrop.classList.remove("hidden");
            setTimeout(() => {
                drawer.classList.remove("-translate-x-full");
                if (backdrop) backdrop.classList.remove("opacity-0");
            }, 10);
        } else {
            drawer.classList.add("-translate-x-full");
            if (backdrop) backdrop.classList.add("opacity-0");
            setTimeout(() => {
                drawer.classList.add("hidden");
                if (backdrop) backdrop.classList.add("hidden");
            }, 300);
        }
    } catch(e) {
        console.error("toggleMobileDepartmentsDrawer error:", e);
    }
};

window.renderMobileDepartmentsList = function() {
    try {
        const container = document.getElementById("mobile-departments-list");
        if (!container) return;

        const depts = (window.PC_DEPARTAMENTOS && Array.isArray(window.PC_DEPARTAMENTOS) && window.PC_DEPARTAMENTOS.length > 0)
            ? window.PC_DEPARTAMENTOS
            : getMasterDepartmentsList();

        const totalItems = depts.reduce((sum, d) => sum + (d.count || 0), 0) || 17490;

        container.innerHTML = `
            <div class="mb-2">
                <button 
                    type="button"
                    onclick="window.selectCategoryFacet('Todas'); window.toggleMobileDepartmentsDrawer(false);" 
                    class="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border ${activeSelectedCategory === 'Todas' ? 'border-cyan-500 bg-slate-900' : 'border-slate-800'} text-left transition cursor-pointer">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-layer-group text-cyan-400 text-xs"></i>
                        <span class="font-bold text-xs text-white">Todas las Vitrinas</span>
                    </div>
                    <span class="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">${totalItems.toLocaleString('es-MX')}</span>
                </button>
            </div>
            ${MASTER_DEPARTMENTS.map(master => {
                const childDepts = master.deptIds.map(id => depts.find(d => d.id === id)).filter(Boolean);
                const isMasterActive = master.deptIds.includes(activeSelectedCategory);
                const masterCount = childDepts.reduce((sum, d) => sum + (d.count || 0), 0);

                return `
                    <details class="group bg-slate-950/80 border ${isMasterActive ? 'border-cyan-500/70 bg-slate-950' : 'border-slate-800/90'} rounded-xl overflow-hidden mb-1.5" ${isMasterActive ? 'open' : ''}>
                        <summary class="flex items-center justify-between p-2.5 cursor-pointer list-none font-mono text-xs font-bold text-white hover:bg-slate-850 transition">
                            <div class="flex items-center gap-2 truncate min-w-0 pr-1">
                                <i class="fa-solid ${master.icon} text-cyan-400 text-xs w-4 text-center shrink-0"></i>
                                <span class="truncate text-[11px] ${isMasterActive ? 'text-cyan-300 font-black' : ''}">${master.name}</span>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <span class="text-[9px] font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-cyan-300 font-bold">
                                    ${masterCount.toLocaleString('es-MX')}
                                </span>
                                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200"></i>
                            </div>
                        </summary>
                        <div class="p-2 pt-1 pb-1 space-y-1 bg-slate-900/90 border-t border-slate-800/80 text-xs divide-y divide-slate-800/40">
                            ${childDepts.map(c => {
                                const isDeptActive = activeSelectedCategory === c.id;
                                const subs = (window.PC_SUBDEPARTAMENTOS && window.PC_SUBDEPARTAMENTOS[c.id]) || [];
                                const hasActiveSub = isDeptActive && activeSelectedChip !== 'Todos';

                                if (subs.length === 0) {
                                    return `
                                        <div class="py-1">
                                            <button 
                                                type="button" 
                                                onclick="window.selectCategoryFacet('${c.id}'); window.toggleMobileDepartmentsDrawer(false);" 
                                                class="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800 text-left transition cursor-pointer ${isDeptActive ? 'text-cyan-300 font-black bg-slate-800/60' : 'text-slate-300'}">
                                                <div class="flex items-center gap-2 truncate min-w-0 pr-1">
                                                    <i class="fa-solid ${c.icon} text-cyan-400 text-[10px] w-3 text-center shrink-0"></i>
                                                    <span class="truncate text-[11px]">${c.name}</span>
                                                </div>
                                                <span class="font-mono text-[9px] text-slate-400 shrink-0">(${c.count || 0})</span>
                                            </button>
                                        </div>
                                    `;
                                }

                                return `
                                    <details class="group/sub py-0.5" ${hasActiveSub ? 'open' : ''}>
                                        <summary class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800 text-left transition cursor-pointer list-none ${isDeptActive ? 'text-cyan-300 font-black bg-slate-800/60' : 'text-slate-300'}">
                                            <div onclick="event.preventDefault(); window.selectCategoryFacet('${c.id}'); window.toggleMobileDepartmentsDrawer(false);" class="flex items-center gap-2 truncate min-w-0 pr-1 flex-1">
                                                <i class="fa-solid ${c.icon} text-cyan-400 text-[10px] w-3 text-center shrink-0"></i>
                                                <span class="truncate text-[11px] font-medium">${c.name}</span>
                                            </div>
                                            <div class="flex items-center gap-1.5 shrink-0">
                                                <span class="font-mono text-[9px] text-slate-400">(${c.count || 0})</span>
                                                <span class="w-6 h-6 flex items-center justify-center rounded bg-slate-800/90 hover:bg-cyan-500/20 text-cyan-400 transition" title="Ver subdepartamentos">
                                                    <i class="fa-solid fa-chevron-down text-[9px] transition-transform duration-200 group-open/sub:rotate-180"></i>
                                                </span>
                                            </div>
                                        </summary>
                                        <div class="flex flex-wrap gap-1.5 pl-5 pr-1 pt-1 pb-2 bg-slate-950/70 rounded-lg mt-1 border border-slate-800/60">
                                            ${subs.map(s => {
                                                const isSubActive = isDeptActive && activeSelectedChip === s.name;
                                                return `
                                                    <button 
                                                        type="button" 
                                                        onclick="window.selectDepartmentWithSubcategory('${c.id}', '${s.name.replace(/'/g, "\\'")}'); window.toggleMobileDepartmentsDrawer(false);" 
                                                        class="text-[10px] font-mono px-2 py-1 rounded-lg border ${isSubActive ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md' : 'bg-slate-900 border-slate-700/80 text-cyan-300 hover:text-white hover:border-cyan-400'} transition cursor-pointer shrink-0">
                                                        ${s.name} <span class="opacity-75">(${s.count})</span>
                                                    </button>
                                                `;
                                            }).join('')}
                                        </div>
                                    </details>
                                `;
                            }).join('')}
                        </div>
                    </details>
                `;
            }).join('')}
        `;
    } catch(e) {
        console.error("renderMobileDepartmentsList error:", e);
    }
};

// EXPLORADOR MÓVIL EN PÁGINA: 67 DEPARTAMENTOS Y SUBDEPARTAMENTOS
window.renderMobileDepartmentsHub = function() {
    try {
        const wrapper = document.getElementById("mobile-departments-hub-wrapper");
        if (!wrapper) return;

        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            wrapper.innerHTML = '';
            return;
        }

        const depts = (window.PC_DEPARTAMENTOS && Array.isArray(window.PC_DEPARTAMENTOS) && window.PC_DEPARTAMENTOS.length > 0)
            ? window.PC_DEPARTAMENTOS
            : getMasterDepartmentsList();

        const totalItems = depts.reduce((sum, d) => sum + (d.count || 0), 0) || 17490;

        wrapper.innerHTML = `
            <div class="w-full bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-3 shadow-xl mb-3.5">
                <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-xs shrink-0">
                            <i class="fa-solid fa-layer-group"></i>
                        </div>
                        <div>
                            <h2 class="text-white font-mono font-bold text-xs uppercase tracking-wide">
                                67 Departamentos & Subcategorías
                            </h2>
                            <p class="text-[9.5px] font-mono text-cyan-300">
                                Acceso directo a todo el inventario en Guadalajara
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onclick="window.toggleMobileDepartmentsDrawer(true)" 
                        class="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase shrink-0 transition flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-bars text-xs"></i> <span>Menú Completo</span>
                    </button>
                </div>

                <!-- 7 Macrogrupos con Subdepartamentos Directos -->
                <div class="space-y-1.5">
                    ${MASTER_DEPARTMENTS.map(master => {
                        const childDepts = master.deptIds.map(id => depts.find(d => d.id === id)).filter(Boolean);
                        const isMasterActive = master.deptIds.includes(activeSelectedCategory);
                        const masterCount = childDepts.reduce((sum, d) => sum + (d.count || 0), 0);

                        return `
                            <details class="group bg-slate-950/80 border ${isMasterActive ? 'border-cyan-500/70 bg-slate-950' : 'border-slate-800/90'} rounded-xl overflow-hidden" ${isMasterActive ? 'open' : ''}>
                                <summary class="flex items-center justify-between p-2 cursor-pointer list-none font-mono text-xs font-bold text-white hover:bg-slate-850 transition select-none">
                                    <div class="flex items-center gap-2 truncate min-w-0 pr-1">
                                        <i class="fa-solid ${master.icon} text-cyan-400 text-xs w-4 text-center shrink-0"></i>
                                        <span class="truncate text-[11px] ${isMasterActive ? 'text-cyan-300 font-black' : ''}">${master.name}</span>
                                    </div>
                                    <div class="flex items-center gap-1.5 shrink-0">
                                        <span class="text-[9px] font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-cyan-300 font-bold">
                                            ${masterCount.toLocaleString('es-MX')}
                                        </span>
                                        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200"></i>
                                    </div>
                                </summary>
                                <div class="p-2 pt-1 pb-1 space-y-1.5 bg-slate-900/90 border-t border-slate-800/80 text-xs divide-y divide-slate-800/40">
                                    ${childDepts.map(c => {
                                        const isDeptActive = activeSelectedCategory === c.id;
                                        const subs = (window.PC_SUBDEPARTAMENTOS && window.PC_SUBDEPARTAMENTOS[c.id]) || [];
                                        return `
                                            <div class="pt-1.5 pb-1">
                                                <div class="flex items-center justify-between">
                                                    <button 
                                                        type="button" 
                                                        onclick="window.selectCategoryFacet('${c.id}')" 
                                                        class="flex items-center gap-1.5 text-left truncate cursor-pointer ${isDeptActive ? 'text-cyan-300 font-black' : 'text-slate-200 hover:text-white'}">
                                                        <i class="fa-solid ${c.icon} text-cyan-400 text-[10px] w-3 text-center shrink-0"></i>
                                                        <span class="text-[10.5px] truncate font-bold">${c.name}</span>
                                                    </button>
                                                    <span class="font-mono text-[9px] text-slate-400 shrink-0">(${c.count || 0})</span>
                                                </div>
                                                ${subs.length > 0 ? `
                                                    <div class="flex flex-wrap gap-1 mt-1 pl-4">
                                                        ${subs.map(s => {
                                                            const isSubActive = isDeptActive && activeSelectedChip === s.name;
                                                            return `
                                                                <button 
                                                                    type="button" 
                                                                    onclick="window.selectDepartmentWithSubcategory('${c.id}', '${s.name.replace(/'/g, "\\'")}')" 
                                                                    class="text-[9.5px] font-mono px-2 py-0.5 rounded-md border ${isSubActive ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm' : 'bg-slate-950 border-slate-700/80 text-cyan-300 hover:text-white hover:border-cyan-400'} transition cursor-pointer shrink-0">
                                                                    ${s.name} <span class="opacity-75">(${s.count})</span>
                                                                </button>
                                                            `;
                                                        }).join('')}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </details>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } catch(e) {
        console.error("renderMobileDepartmentsHub error:", e);
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        if (typeof window.renderMobileDepartmentsHub === 'function') {
            window.renderMobileDepartmentsHub();
        }
    });
}

// BUSCADOR PREDICTIVO EN VIVO (CONECTADO A WEB WORKER OFF-MAIN-THREAD)
let searchDebounceTimer = null;

function renderSearchDropdownHTML(topMatches, totalMatches, rawQuery, box) {
    if (!box) return;

    // Si no hay coincidencias directas en la predicción, ocultar limpiamente el dropdown
    // para NUNCA bloquear la cuadrícula de productos con letreros oscuros.
    if (!topMatches || topMatches.length === 0) {
        box.classList.add("hidden");
        box.innerHTML = "";
        return;
    }

    box.innerHTML = `
        <div class="p-2.5 border-b border-slate-800 flex justify-between items-center text-[10.5px] font-mono text-slate-300 bg-slate-950/90">
            <span>${(totalMatches || topMatches.length).toLocaleString('es-MX')} productos sugeridos para: "<strong>${rawQuery}</strong>"</span>
            <button type="button" onclick="window.executeSearchQuery(document.querySelector('#main-search-input, #boutiqueSearchInput').value);" class="text-cyan-300 font-bold hover:underline cursor-pointer">
                Ver todas en vitrina »
            </button>
        </div>
        <div class="divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto no-scrollbar">
            ${topMatches.map(rawP => {
                const item = window.normalizeProductItem(rawP);
                const title = item.name.replace(/'/g, "&#39;").replace(/"/g, '&quot;');
                const localImg = `assets/img/${item.sku}.webp`;

                return `
                    <div class="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-850 transition cursor-pointer group min-h-[64px]" onclick="openProductDetailModal('${item.sku}');" role="button" tabindex="0" aria-label="Ver detalle de ${title}">
                        <div class="w-[60px] h-[60px] bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-800 group-hover:border-cyan-400/50 flex items-center justify-center">
                            <img src="${localImg}" alt="${title}" width="54" height="54" loading="lazy" decoding="async" class="w-full h-full object-contain" onerror="window.handleProductImgError(this, '${item.sku}', '${item.cat}')" />
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                            <div class="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-1 leading-snug">${title}</div>
                            <div class="text-[10px] font-mono text-slate-300 flex items-center gap-1.5 mt-0.5">
                                <span class="text-cyan-300 font-bold">SKU: ${item.sku}</span>
                                <span>•</span>
                                ${item.isAgotado 
                                    ? `<span class="text-amber-400 font-bold">Bajo Pedido</span>` 
                                    : `<span class="text-emerald-400 font-bold">Entrega Inmediata</span>`
                                }
                            </div>
                        </div>
                        <div class="text-right shrink-0 flex items-center gap-2">
                            <div class="text-xs font-mono font-black text-emerald-400">${window.formatPriceDisplay(item.priceMxn, item.priceUsd)}</div>
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="window.addToCartCT('${item.sku}', event);" aria-label="Agregar al carrito" class="btn-action bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg transition active:scale-95 shadow cursor-pointer min-h-[36px]">
                                    + Carrito
                                </button>
                                <button type="button" onclick="window.buyNowCT('${item.sku}', event);" aria-label="Comprar ahora" class="btn-action bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-[10px] font-mono font-black px-2.5 py-1.5 rounded-lg shadow transition active:scale-95 cursor-pointer min-h-[36px]">
                                    Comprar Ahora
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    box.classList.remove("hidden");
}

function initPredictiveSearchEngine() {
    try {
        const input = document.querySelector("#main-search-input, #boutiqueSearchInput");
        const box = document.querySelector("#search-results-dropdown, #boutique-autocomplete-box");
        if (!input || !box) return;

        // Pre-cargar catálogo completo al interactuar o enfocar el buscador
        input.addEventListener("focus", () => {
            if (typeof window.ensureFullCatalogLoaded === 'function') window.ensureFullCatalogLoaded();
        }, { once: true });
        input.addEventListener("mouseenter", () => {
            if (typeof window.ensureFullCatalogLoaded === 'function') window.ensureFullCatalogLoaded();
        }, { once: true });

        const form = input.closest("form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                clearTimeout(searchDebounceTimer);
                box._searchToken = null;
                box.classList.add("hidden");
                box.innerHTML = "";
                window.executeSearchQuery(input.value);
            });
        }

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                clearTimeout(searchDebounceTimer);
                box._searchToken = null;
                box.classList.add("hidden");
                box.innerHTML = "";
                window.executeSearchQuery(input.value);
            }
        });

        input.addEventListener("input", (e) => {
            clearTimeout(searchDebounceTimer);
            const rawQuery = (e.target.value || '').trim();
            
            if (rawQuery.length < 2) {
                box._searchToken = null;
                box.classList.add("hidden");
                box.innerHTML = "";
                if (activeSearchQuery !== '') {
                    activeSearchQuery = '';
                    renderExactCatalogView();
                }
                return;
            }

            if (typeof window.ensureFullCatalogLoaded === 'function') {
                window.ensureFullCatalogLoaded();
            }

            // Si el Web Worker está activo, delegar la búsqueda predictiva fuera del hilo principal
            if (isWorkerAvailable && catalogWorker) {
                const searchToken = ++workerMsgId;
                box._searchToken = searchToken;
                workerCallbacks.set(searchToken, (data) => {
                    if (box._searchToken !== searchToken) return;
                    if (data && data.query === rawQuery) {
                        renderSearchDropdownHTML(data.matches, data.totalMatches, rawQuery, box);
                    }
                });
                catalogWorker.postMessage({
                    id: searchToken,
                    action: 'PREDICTIVE_SEARCH',
                    payload: { query: rawQuery, limit: 6, baseUrl: getAppBaseUrl() }
                });
                return;
            }

            // Fallback síncrono si el Worker no está disponible
            searchDebounceTimer = setTimeout(() => {
                const matches = searchCatalogMaster(rawQuery);
                const topMatches = matches.slice(0, 6);
                renderSearchDropdownHTML(topMatches, matches.length, rawQuery, box);
            }, 150);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                box.classList.add("hidden");
            }
        });

        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !box.contains(e.target)) {
                box.classList.add("hidden");
            }
        });

        // Al hacer scroll en la pantalla (especialmente en móvil), ocultar cortina flotante para no obstruir los productos
        window.addEventListener("scroll", () => {
            if (box && !box.classList.contains("hidden")) {
                box.classList.add("hidden");
            }
        }, { passive: true });
    } catch(e) {
        console.warn("initPredictiveSearchEngine error:", e);
    }
}

window.executeSearchQuery = function(query) {
    try {
        activeSearchQuery = (query || '').trim();
        activeSelectedCategory = 'Todas';
        currentPageNumber = 1;
        
        clearTimeout(searchDebounceTimer);
        const box = document.querySelector("#search-results-dropdown, #boutique-autocomplete-box");
        if (box) {
            box._searchToken = null;
            box.classList.add("hidden");
            box.innerHTML = "";
        }

        renderSidebarFacets();
        renderExactCatalogView();
        window.scrollToResults();

        if (typeof window.ensureFullCatalogLoaded === 'function') {
            window.ensureFullCatalogLoaded(() => {
                if (activeSearchQuery === (query || '').trim()) {
                    renderSidebarFacets();
                    renderExactCatalogView();
                }
            });
        }
    } catch(e) {
        console.error("executeSearchQuery error:", e);
    }
};

// ACCIONES DE CARRITO UNIFICADO (IAWC_MASTER_CART)
window.addToCartCT = function(sku, event) {
    try {
        if (event) event.stopPropagation();
        const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
        const raw = catalog.find(item => (item.sku === sku || item.s === sku || item.clave === sku));
        if (!raw) return;

        const p = window.normalizeProductItem(raw);
        const cart = typeof window.getBoutiqueCart === 'function' ? window.getBoutiqueCart() : [];
        const existing = cart.find(item => (item.sku === sku || item.id === sku));

        if (existing) {
            existing.qty = (parseInt(existing.qty || existing.quantity) || 1) + 1;
            existing.quantity = existing.qty;
        } else {
            cart.push({
                id: p.sku,
                sku: p.sku,
                title: p.name,
                name: p.name,
                nombre: p.name,
                price: p.priceMxn,
                precio: p.priceMxn,
                qty: 1,
                quantity: 1,
                img: `./assets/img/${p.sku}.webp`,
                image: `./assets/img/${p.sku}.webp`,
                storeName: 'PC Custom Lab',
                tienda_origen: 'PC Custom Lab',
                storeUrl: window.location.origin + window.location.pathname,
                url_tienda: window.location.origin + window.location.pathname
            });
        }

        if (typeof window.saveBoutiqueCart === 'function') {
            window.saveBoutiqueCart(cart);
        }
        showAddToCartToast(p.name);
    } catch(e) {
        console.error("addToCartCT error:", e);
    }
};

window.buyNowCT = function(sku, event) {
    try {
        if (event) event.stopPropagation();
        const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
        const raw = catalog.find(item => (item.sku === sku || item.s === sku || item.clave === sku));
        if (raw) {
            const p = window.normalizeProductItem(raw);
            const cart = typeof window.getBoutiqueCart === 'function' ? window.getBoutiqueCart() : [];
            const existing = cart.find(item => (item.sku === sku || item.id === sku));

            if (existing) {
                existing.qty = (parseInt(existing.qty || existing.quantity) || 1) + 1;
                existing.quantity = existing.qty;
            } else {
                cart.push({
                    id: p.sku,
                    sku: p.sku,
                    title: p.name,
                    name: p.name,
                    nombre: p.name,
                    price: p.priceMxn,
                    precio: p.priceMxn,
                    qty: 1,
                    quantity: 1,
                    img: `./assets/img/${p.sku}.webp`,
                    image: `./assets/img/${p.sku}.webp`,
                    storeName: 'PC Custom Lab',
                    tienda_origen: 'PC Custom Lab',
                    storeUrl: window.location.origin + window.location.pathname,
                    url_tienda: window.location.origin + window.location.pathname
                });
            }
            if (typeof window.saveBoutiqueCart === 'function') {
                window.saveBoutiqueCart(cart);
            }
        }
        if (typeof window.toggleCartDrawer === 'function') {
            window.toggleCartDrawer(true);
        }
    } catch(e) {
        console.error("buyNowCT error:", e);
    }
};

function showAddToCartToast(productTitle) {
    try {
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
                        <div class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">¡Agregado al Carrito Unificado!</div>
                        <div class="text-xs text-slate-200 font-bold truncate">${productTitle}</div>
                    </div>
                </div>
                <div class="flex gap-2 pt-1 border-t border-slate-800">
                    <button onclick="window.scrollToDepartments(); this.closest('#cart-notification-toast').classList.add('hidden');" class="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] font-bold py-2 px-2.5 rounded-xl border border-cyan-500/40 cursor-pointer min-h-[44px]">
                        <i class="fa-solid fa-layer-group"></i> Más Productos
                    </button>
                    <button onclick="window.toggleCartDrawer(true); this.closest('#cart-notification-toast').classList.add('hidden');" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-black py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer min-h-[44px]">
                        <i class="fa-solid fa-cart-shopping"></i> Ver Carrito
                    </button>
                </div>
            </div>
        `;
        toast.classList.remove("hidden");
        setTimeout(() => {
            if (toast) toast.classList.add("hidden");
        }, 4500);
    } catch(e) {}
}

// Modal Ficha Técnica (PDP) 100% Nativo PC Custom Lab

// =========================================================================
// GALERÍA MULTI-IMAGEN HD (1080x1080) Y SLIDER INTERACTIVO EN MODAL
// =========================================================================
window.currentModalProduct = null;
window.currentModalImgIndex = 0;

window.setModalImage = function(idx) {
    try {
        if (!window.currentModalProduct || !window.currentModalProduct.imgs) return;
        const imgs = window.currentModalProduct.imgs;
        if (idx < 0 || idx >= imgs.length) return;
        window.currentModalImgIndex = idx;

        const mainImg = document.getElementById("modalMainImg");
        if (mainImg) {
            mainImg.src = imgs[idx];
        }

        const counter = document.getElementById("modalImgCounter");
        if (counter) {
            counter.textContent = String(idx + 1);
        }

        // Resaltar miniatura activa
        imgs.forEach((_, i) => {
            const thumb = document.getElementById(`modalThumb_${i}`);
            if (thumb) {
                if (i === idx) {
                    thumb.className = "w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950 border-2 border-cyan-400 ring-2 ring-cyan-400/40 transition overflow-hidden p-1 shrink-0 flex items-center justify-center cursor-pointer shadow-lg";
                } else {
                    thumb.className = "w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100 transition overflow-hidden p-1 shrink-0 flex items-center justify-center cursor-pointer";
                }
            }
        });
    } catch(e) {
        console.warn("setModalImage error:", e);
    }
};

window.prevModalImage = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (!window.currentModalProduct || !window.currentModalProduct.imgs) return;
    const imgs = window.currentModalProduct.imgs;
    const newIdx = (window.currentModalImgIndex - 1 + imgs.length) % imgs.length;
    window.setModalImage(newIdx);
};

window.nextModalImage = function(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (!window.currentModalProduct || !window.currentModalProduct.imgs) return;
    const imgs = window.currentModalProduct.imgs;
    const newIdx = (window.currentModalImgIndex + 1) % imgs.length;
    window.setModalImage(newIdx);
};

// Navegación por teclado dentro del modal
document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("productDetailModal");
    if (modal && !modal.classList.contains("hidden")) {
        if (e.key === "ArrowLeft") window.prevModalImage(e);
        if (e.key === "ArrowRight") window.nextModalImage(e);
        if (e.key === "Escape") window.closeProductDetailModal();
    }
});
window.openProductDetailModal = function(sku) {
    try {
        const catalog = window.CT_CATALOG_DATA || window.CT_CATALOG_DATA_INITIAL || [];
        const raw = catalog.find(item => (item.sku === sku || item.s === sku || item.clave === sku));
        if (!raw) return;

        const p = window.normalizeProductItem(raw);
        const modal = document.getElementById("productDetailModal");
        const content = document.getElementById("productDetailModalContent");
        if (!modal || !content) return;

        window.currentModalProduct = p;
        window.currentModalImgIndex = 0;

        const title = p.name.replace(/'/g, "&#39;");
        const desc = p.desc.replace(/'/g, "&#39;");
        const imgs = (p.imgs && p.imgs.length > 0) ? p.imgs : [`assets/img/${p.sku}.webp`];
        const hasMultiple = imgs.length > 1;

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
                <!-- Columna Izquierda: Visor Interactivo Multi-Imagen HD -->
                <div class="flex flex-col">
                    <div id="modalGalleryMain" class="relative w-full aspect-square bg-slate-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800 overflow-hidden group/gallery select-none shadow-2xl">
                        <img 
                            id="modalMainImg" 
                            src="${imgs[0]}" 
                            alt="${title}" 
                            width="600" 
                            height="600" 
                            class="w-full h-full object-contain transition duration-200" 
                            onerror="window.handleProductImgError(this, '${p.sku}', '${p.cat}')" 
                        />

                        ${hasMultiple ? `
                            <!-- Botones Laterales de Navegación Flecha Izq / Der -->
                            <button type="button" onclick="window.prevModalImage(event)" aria-label="Foto anterior" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/85 hover:bg-cyan-500 hover:text-slate-950 text-white border border-slate-700/80 flex items-center justify-center transition shadow-xl cursor-pointer backdrop-blur-sm z-20 active:scale-95">
                                <i class="fa-solid fa-chevron-left text-sm"></i>
                            </button>
                            <button type="button" onclick="window.nextModalImage(event)" aria-label="Siguiente foto" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/85 hover:bg-cyan-500 hover:text-slate-950 text-white border border-slate-700/80 flex items-center justify-center transition shadow-xl cursor-pointer backdrop-blur-sm z-20 active:scale-95">
                                <i class="fa-solid fa-chevron-right text-sm"></i>
                            </button>
                            
                            <!-- Contador de Fotografías -->
                            <div class="absolute bottom-3 right-3 bg-slate-950/85 border border-slate-800 text-cyan-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow">
                                <i class="fa-solid fa-camera mr-1"></i><span id="modalImgCounter">1</span> / ${imgs.length} tomas
                            </div>
                        ` : ''}
                    </div>

                    ${hasMultiple ? `
                        <!-- Tira Inferior de Miniaturas (Thumbnails) -->
                        <div class="flex items-center gap-2 mt-3 overflow-x-auto pb-1 max-w-full no-scrollbar" id="modalThumbnailsStrip">
                            ${imgs.map((src, i) => `
                                <button type="button" onclick="window.setModalImage(${i})" class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-950 ${i === 0 ? 'border-2 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg' : 'border border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'} transition overflow-hidden p-1 shrink-0 flex items-center justify-center cursor-pointer" id="modalThumb_${i}">
                                    <img src="${src}" alt="Vista ${i+1}" class="w-full h-full object-contain" />
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Columna Derecha: Ficha Técnica y Acciones de Compra -->
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

                        ${p.isVolumetric ? `
                            <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 font-mono text-xs flex items-center gap-2.5 mb-2 shadow">
                                <i class="fa-solid fa-box-open text-base text-amber-400 shrink-0"></i>
                                <span>Artículo Volumétrico / Frágil: <strong>Despacho Seguro en Vehículo Protegido</strong></span>
                            </div>
                        ` : ''}

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
                                <div><i class="fa-solid fa-shield-check text-emerald-400 mr-1"></i> Garantía Directa en Tienda / 1 Año Fabricante</div>
                                <div><i class="fa-solid fa-location-dot text-cyan-400 mr-1"></i> Entrega Inmediata en Pedro Moreno 501 A</div>
                            `}
                        </div>

                        <div class="flex gap-2 pt-2">
                            <button onclick="${p.isAgotado ? `window.open('https://wa.me/523337271440?text=Hola,%20me%20interesa%20apartar%20bajo%20pedido%20el%20producto:%20${p.sku}', '_blank')` : `addToCartCT('${p.sku}', event); closeProductDetailModal();`}" class="flex-1 ${p.isAgotado ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40' : 'bg-blue-600 hover:bg-blue-500 text-white shadow'} font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]">
                                <i class="fa-solid ${p.isAgotado ? 'fa-clock' : 'fa-cart-plus'}"></i> <span>${p.isAgotado ? 'Apartar Bajo Pedido' : '+ Carrito'}</span>
                            </button>
                            <button onclick="${p.isAgotado ? `window.open('https://wa.me/523337271440?text=Hola,%20cotizar%20bajo%20pedido:%20${p.sku}', '_blank')` : `buyNowCT('${p.sku}', event); closeProductDetailModal();`}" class="flex-1 ${p.isAgotado ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white'} font-black py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition cursor-pointer min-h-[44px]">
                                <i class="fa-solid ${p.isAgotado ? 'fa-file-invoice-dollar' : 'fa-bolt'}"></i> <span>${p.isAgotado ? 'Cotizar Pieza' : 'Comprar Ahora'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Soporte de Touch Swipe en dispositivos móviles
        const galleryEl = document.getElementById("modalGalleryMain");
        if (galleryEl && hasMultiple) {
            let touchStartX = 0;
            galleryEl.addEventListener("touchstart", (e) => {
                if (e.touches && e.touches.length > 0) {
                    touchStartX = e.touches[0].clientX;
                }
            }, { passive: true });
            galleryEl.addEventListener("touchend", (e) => {
                if (e.changedTouches && e.changedTouches.length > 0) {
                    const touchEndX = e.changedTouches[0].clientX;
                    const diffX = touchEndX - touchStartX;
                    if (diffX > 40) {
                        window.prevModalImage();
                    } else if (diffX < -40) {
                        window.nextModalImage();
                    }
                }
            }, { passive: true });
        }

        modal.classList.remove("hidden");
    } catch(e) {
        console.error("openProductDetailModal error:", e);
    }
};

window.closeProductDetailModal = function() {
    try {
        const modal = document.getElementById("productDetailModal");
        if (modal) modal.classList.add("hidden");
    } catch(e) {}
};
