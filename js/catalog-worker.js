/**
 * CATALOG WEB WORKER - PC CUSTOM LAB
 * Procesa la carga de particiones JSON, búsquedas semánticas con scoring,
 * filtros de departamento, presupuesto y ordenamiento FUERA DEL HILO PRINCIPAL.
 * 
 * Resuelve rutas absolutas automáticamente según self.location para soportar
 * subcarpetas en GitHub Pages (ej. /pc-custom-lab/).
 */

let manifest = null;
const departmentCache = new Map(); // deptId -> Array of products
let allLoadedProducts = [];
let isAllLoaded = false;
let isLoadingAll = false;

// OBTENER RUTA BASE ABSOLUTA DESDE self.location
function getWorkerBaseUrl() {
    try {
        if (typeof self !== 'undefined' && self.location && self.location.href) {
            const href = self.location.href;
            const jsIdx = href.lastIndexOf('/js/');
            if (jsIdx !== -1) {
                return href.substring(0, jsIdx);
            }
            return href.substring(0, href.lastIndexOf('/'));
        }
    } catch(e) {}
    return '';
}

const WORKER_BASE_URL = getWorkerBaseUrl();

function resolveAssetUrl(relPath, explicitBaseUrl = '') {
    const base = (explicitBaseUrl || WORKER_BASE_URL || '').replace(/\/+$/, '');
    const cleanRel = String(relPath || '').replace(/^\/+/, '');
    return base ? `${base}/${cleanRel}` : cleanRel;
}

// DICCIONARIO DE SINÓNIMOS Y HERRAMIENTAS DE TEXTO
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

function stripAccents(text) {
    if (!text) return "";
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function cleanSearchTokens(query) {
    const qClean = stripAccents(query).replace(/[^a-z0-9\s]/g, ' ');
    const rawWords = qClean.split(' ').filter(w => w.length > 0);
    const filtered = rawWords.filter(w => !STOP_WORDS_SET.has(w));
    return filtered.length > 0 ? filtered : rawWords;
}

function normalizeProduct(p) {
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
    const imgs = (Array.isArray(p.k) && p.k.length > 0) 
        ? p.k 
        : (Array.isArray(p.imgs) && p.imgs.length > 0) 
            ? p.imgs 
            : [`assets/img/${sku}.webp`];
    const isVolumetric = (p.is_volumetric === true || p.v === 1);

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
}

// 1. CARGA DEL MANIFIESTO
async function loadManifest(baseUrl = '') {
    if (manifest) return manifest;
    try {
        const url = resolveAssetUrl('data/departments_manifest.json', baseUrl) + `?v=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} al solicitar ${url}`);
        manifest = await res.json();
        return manifest;
    } catch(e) {
        console.error("Worker loadManifest error:", e);
        return null;
    }
}

// 2. CARGA DE UN DEPARTAMENTO ESPECÍFICO
async function loadDepartment(deptId, baseUrl = '') {
    if (departmentCache.has(deptId)) {
        return departmentCache.get(deptId);
    }

    if (!manifest) await loadManifest(baseUrl);
    if (!manifest || !manifest.departments[deptId]) {
        // Fallback: intentar cargar directamente data/departments/{deptId}.json
        try {
            const fallbackUrl = resolveAssetUrl(`data/departments/${deptId}.json`, baseUrl) + '?v=20260904_chunk';
            const res = await fetch(fallbackUrl);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    departmentCache.set(deptId, data);
                    return data;
                }
            }
        } catch(e) {}
        return [];
    }

    const deptInfo = manifest.departments[deptId];
    const deptProducts = [];

    try {
        for (const relPath of deptInfo.files) {
            const url = resolveAssetUrl(relPath, baseUrl) + '?v=20260904_chunk';
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`[Worker] Error HTTP ${res.status} al descargar partición: ${url}`);
                continue;
            }
            const chunkData = await res.json();
            if (Array.isArray(chunkData)) {
                deptProducts.push(...chunkData);
            }
        }
    } catch(e) {
        console.error(`Worker loadDepartment error for ${deptId}:`, e);
    }

    departmentCache.set(deptId, deptProducts);
    return deptProducts;
}

// 3. CARGA GLOBAL PROGRESIVA EN HILO SECUNDARIO
async function loadAllDepartments(baseUrl = '') {
    if (isAllLoaded || isLoadingAll) return allLoadedProducts;
    isLoadingAll = true;

    if (!manifest) await loadManifest(baseUrl);
    if (!manifest) {
        isLoadingAll = false;
        return [];
    }

    const deptIds = Object.keys(manifest.departments);
    const accumulated = [];

    for (const dId of deptIds) {
        const prods = await loadDepartment(dId, baseUrl);
        accumulated.push(...prods);
    }

    allLoadedProducts = accumulated;
    isAllLoaded = true;
    isLoadingAll = false;

    // Notificar al hilo principal que el inventario global está 100% en memoria del Worker
    self.postMessage({
        action: 'ALL_LOADED',
        totalProducts: allLoadedProducts.length,
        departmentsCount: deptIds.length
    });

    return allLoadedProducts;
}

// 4. ALGORITMO DE BÚSQUEDA Y SCORING OFF-MAIN-THREAD
function executeScoredSearch(query, pool) {
    const rawQuery = (query || '').trim();
    if (!rawQuery) return pool;

    const tokens = cleanSearchTokens(rawQuery);
    if (!tokens || tokens.length === 0) return pool;

    const scoredResults = [];

    for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        const item = normalizeProduct(p);
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

// 5. MANEJADOR PRINCIPAL DE MENSAJES (IPC WORKER <-> MAIN THREAD)
self.onmessage = async function(e) {
    const { id, action, payload = {} } = e.data || {};
    const baseUrl = payload.baseUrl || '';

    try {
        switch(action) {
            case 'INIT': {
                await loadManifest(baseUrl);
                // Iniciar precarga progresiva en background (Off-Main-Thread)
                loadAllDepartments(baseUrl);
                self.postMessage({
                    id,
                    action,
                    success: true,
                    data: { manifestReady: !!manifest, totalDepts: manifest ? manifest.departmentsCount : 0 }
                });
                break;
            }

            case 'PREDICTIVE_SEARCH': {
                const { query, limit = 6 } = payload;
                let pool = allLoadedProducts;
                if (pool.length === 0) {
                    for (const cached of departmentCache.values()) {
                        pool.push(...cached);
                    }
                }
                const matches = executeScoredSearch(query, pool);
                const topSlice = matches.slice(0, limit).map(p => normalizeProduct(p));
                self.postMessage({
                    id,
                    action,
                    success: true,
                    data: { matches: topSlice, totalMatches: matches.length, query }
                });
                break;
            }

            case 'FILTER_DEPT':
            case 'QUERY_CATALOG': {
                const {
                    query = '',
                    category = payload.deptId || 'Todas',
                    deptId,
                    chip = 'Todos',
                    minPrice = 0,
                    maxPrice = Infinity,
                    sort = 'destacados',
                    page = 1,
                    pageSize = 24
                } = payload;

                const targetDept = deptId || category || 'Todas';
                let pool = [];

                if (targetDept !== 'Todas') {
                    pool = await loadDepartment(targetDept, baseUrl);
                } else {
                    if (isAllLoaded) {
                        pool = allLoadedProducts;
                    } else {
                        pool = allLoadedProducts.length > 0 ? allLoadedProducts : [];
                        if (pool.length === 0) {
                            for (const cached of departmentCache.values()) pool.push(...cached);
                        }
                    }
                }

                // 1. Filtro de búsqueda
                let filtered = query ? executeScoredSearch(query, pool) : [...pool];

                // 2. Filtro de Subchip
                if (chip && chip !== 'Todos') {
                    filtered = filtered.filter(p => {
                        const sub = (p.subgrupo_label || '');
                        return sub.toLowerCase() === chip.toLowerCase();
                    });
                }

                // 3. Filtro de Presupuesto
                if (minPrice > 0 || maxPrice < Infinity) {
                    filtered = filtered.filter(p => {
                        const price = p.precio_mxn || p.p || p.precio || 0;
                        return price >= minPrice && price <= maxPrice;
                    });
                }

                // 4. Ordenamiento
                if (sort === 'precio_asc') {
                    filtered.sort((a, b) => (a.precio_mxn || a.p || 0) - (b.precio_mxn || b.p || 0));
                } else if (sort === 'precio_desc') {
                    filtered.sort((a, b) => (b.precio_mxn || b.p || 0) - (a.precio_mxn || a.p || 0));
                } else if (sort === 'alfabetico') {
                    filtered.sort((a, b) => (a.nombre || a.n || '').localeCompare(b.nombre || b.n || ''));
                }

                // 5. Paginación
                const totalCount = filtered.length;
                const totalPages = Math.ceil(totalCount / pageSize) || 1;
                const safePage = Math.max(1, Math.min(page, totalPages));
                const startIdx = (safePage - 1) * pageSize;
                const pageItems = filtered.slice(startIdx, startIdx + pageSize).map(p => normalizeProduct(p));

                // Extraer subchips disponibles para el departamento
                let availableSubs = [];
                if (targetDept !== 'Todas') {
                    availableSubs = Array.from(new Set(pool.map(p => p.subgrupo_label).filter(Boolean)));
                }

                self.postMessage({
                    id,
                    action,
                    success: true,
                    data: {
                        items: pageItems,
                        totalCount,
                        totalPages,
                        currentPage: safePage,
                        availableSubs,
                        category: targetDept,
                        deptId: targetDept,
                        query
                    }
                });
                break;
            }

            default:
                self.postMessage({ id, action, success: false, error: 'Acción no reconocida' });
        }
    } catch(err) {
        console.error("Worker onmessage error:", err);
        self.postMessage({ id, action, success: false, error: err.message });
    }
};
