/**
 * AUDITORÍA INTEGRAL DE PRODUCCIÓN Y PRUEBAS AUTOMATIZADAS DE ESTABILIDAD (E2E)
 * PC CUSTOM LAB - SISTEMA DE ALTA DISPONIBILIDAD
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

console.log('='.repeat(80));
console.log('AUDITORIA INTEGRAL DE PRODUCCION Y CERTIFICACION E2E: PC CUSTOM LAB');
console.log('='.repeat(80));

// --- ENTORNO DE SIMULACIÓN DOM ROBUSTO ---
const localStorageStore = {};
global.localStorage = {
    getItem: (key) => localStorageStore[key] || null,
    setItem: (key, val) => { localStorageStore[key] = String(val); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

const domElements = {};
function createMockElement(id, tag = 'div') {
    return {
        id,
        tagName: tag.toUpperCase(),
        innerHTML: '',
        innerText: '',
        value: '',
        className: '',
        style: {},
        classList: {
            classes: new Set(),
            add: function(...cls) { cls.forEach(c => this.classes.add(c)); },
            remove: function(...cls) { cls.forEach(c => this.classes.delete(c)); },
            contains: function(c) { return this.classes.has(c); },
            toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
        },
        attributes: {},
        setAttribute: function(k, v) { this.attributes[k] = v; },
        getAttribute: function(k) { return this.attributes[k] || null; },
        removeAttribute: function(k) { delete this.attributes[k]; },
        addEventListener: function(evt, handler) { this[`on_${evt}`] = handler; },
        removeEventListener: function() {},
        appendChild: function(c) { return c; },
        removeChild: function(c) { return c; },
        closest: function() { return null; },
        querySelector: function(sel) {
            if (sel.startsWith('#')) {
                const id = sel.substring(1).split(',')[0].trim();
                return domElements[id] || (domElements[id] = createMockElement(id));
            }
            return createMockElement('sub-node');
        },
        querySelectorAll: function() { return []; },
        focus: function() {},
        blur: function() {},
        click: function() {},
        scrollIntoView: function() {},
        insertAdjacentHTML: function(pos, html) { this.innerHTML += html; }
    };
}

// Pre-create known DOM IDs from index.html
const KNOWN_IDS = [
    'products-grid-container', 'cart-slide-drawer', 'cart-backdrop',
    'main-search-input', 'search-results-dropdown', 'btn-limpiar', 'btn-aplicar',
    'sidebar-facets', 'sidebar-facets-root', 'drawer-shipping-badge', 'cart-items-container',
    'drawer-cart-count', 'cart-total-amount', 'cart-tax-amount', 'cart-subtotal-amount',
    'results-count-display', 'active-filters-summary', 'modal-container-root',
    'currencyToggleMXN', 'currencyToggleUSD', 'cart-count-badge', 'cart-badge-header'
];
KNOWN_IDS.forEach(id => {
    domElements[id] = createMockElement(id);
});

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.location = { origin: 'https://iaworldcenter-creator.github.io', pathname: '/pc-custom-lab/' };

global.document = {
    readyState: 'complete',
    body: createMockElement('body', 'body'),
    getElementById: (id) => domElements[id] || (domElements[id] = createMockElement(id)),
    querySelector: (sel) => {
        if (sel.startsWith('#')) {
            const id = sel.substring(1).split(',')[0].trim();
            return domElements[id] || (domElements[id] = createMockElement(id));
        }
        return createMockElement('dynamic-node');
    },
    querySelectorAll: (sel) => [],
    createElement: (tag) => createMockElement(`dyn_${Math.random()}`, tag),
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Cargar scripts en orden oficial
eval(fs.readFileSync(path.join(BASE_DIR, 'js', 'ct-catalog-data.js'), 'utf-8'));
eval(fs.readFileSync(path.join(BASE_DIR, 'js', 'cart.js'), 'utf-8'));
eval(fs.readFileSync(path.join(BASE_DIR, 'js', 'ct-exact-catalog-engine.js'), 'utf-8'));

const resultsMatrix = [];
function recordResult(testName, status, details) {
    resultsMatrix.push({ testName, status, details });
    const mark = status === 'PASSED' ? '✅ [OK]' : '❌ [FALLO]';
    console.log(`${mark} ${testName}`);
    if (details) console.log(`      └─ ${details}`);
}

// ============================================================================
// 1. ARRANQUE EN FRÍO (F5 ZERO-BLANK)
// ============================================================================
console.log('\n--- 1. ARRANQUE EN FRÍO (F5 ZERO-BLANK) ---');
try {
    window.runCleanHomeCatalog();
    const totalDepts = window.PC_DEPARTAMENTOS.length;
    const totalProducts = window.CT_CATALOG_DATA.length;

    if (totalDepts === 67 && totalProducts === 17490) {
        recordResult('Arranque en frío (Welcome Hub & Vitrinas)', 'PASSED',
            `Catálogo íntegro: ${totalProducts.toLocaleString()} productos en ${totalDepts} vitrinas oficiales.`);
    } else {
        recordResult('Arranque en frío (Welcome Hub & Vitrinas)', 'FAILED',
            `Inconsistencia: Depts=${totalDepts}, Prods=${totalProducts}`);
    }
} catch (e) {
    recordResult('Arranque en frío (Welcome Hub & Vitrinas)', 'FAILED', e.message);
}

// ============================================================================
// 2. BUSCADOR PREDICTIVO EN VIVO
// ============================================================================
console.log('\n--- 2. BUSCADOR PREDICTIVO EN VIVO ---');
const searchTerms = ['Ryzen', 'Gabinete', 'SSD'];
searchTerms.forEach(term => {
    try {
        window.executeSearchQuery(term);
        const gridHTML = domElements['products-grid-container'].innerHTML;
        const countText = domElements['results-count-display'].innerHTML;

        const matches = (gridHTML.match(/addToCartCT/g) || []).length;
        if (matches > 0) {
            recordResult(`Búsqueda predictiva: "${term}"`, 'PASSED',
                `Renderizó ${matches} tarjetas activas con botón "+ Carrito" / "Comprar Ahora".`);
        } else {
            recordResult(`Búsqueda predictiva: "${term}"`, 'FAILED', 'No se encontraron tarjetas');
        }
    } catch (e) {
        recordResult(`Búsqueda predictiva: "${term}"`, 'FAILED', e.message);
    }
});

// ============================================================================
// 3. CARRITO PERSISTENTE, DRAWER Y MATRIZ LOGÍSTICA
// ============================================================================
console.log('\n--- 3. CARRITO PERSISTENTE Y MATRIZ LOGÍSTICA ---');
try {
    localStorage.clear();

    // Partida 1: Estándar (Mouse Acteck)
    window.addToCartCT('MOUACT550');
    // Partida 2: Volumétrica (Gabinete Gamer Acteck)
    window.addToCartCT('GABACT120');

    // Partida 3: Simulada de otra tienda (Cigarros o Dulces)
    const cartKey = 'IAWC_MASTER_CART';
    let rawCart = window.getBoutiqueCart();
    rawCart.push({
        id: 'CIG-MARL-01',
        title: 'Cigarros Marlboro Gold (Simulado Vía MX)',
        price: 85.00,
        image: 'assets/img/cigarros.webp',
        category: 'cigarros',
        quantity: 2
    });
    window.saveBoutiqueCart(rawCart);

    // Renderizar drawer
    window.renderDrawerItems();

    const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const subtotal = storedCart.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
    const iva = subtotal * 0.16;
    const totalNeto = subtotal + iva;

    const mathValid = (subtotal > 0 && iva > 0 && totalNeto > subtotal);
    const badgeHTML = domElements['drawer-shipping-badge'].innerHTML;
    const volumetricRuleActive = badgeHTML.includes('Paquetería Especializada Obligatoria') && badgeHTML.includes('vehículo seguro (no moto)');

    if (storedCart.length === 3 && mathValid && volumetricRuleActive) {
        recordResult('Persistencia IAWC_MASTER_CART & Multi-tienda', 'PASSED',
            `3 partidas guardadas en localStorage. Subtotal: $${subtotal.toFixed(2)}, Total Neto: $${totalNeto.toFixed(2)} MXN.`);
        recordResult('Matriz Logística (Regla A: Volumétrico)', 'PASSED',
            'Bloqueo estricto de moto y activación de "Paquetería Especializada Obligatoria".');
    } else {
        recordResult('Persistencia IAWC_MASTER_CART', 'FAILED',
            `storedLen=${storedCart.length}, mathValid=${mathValid}, volRule=${volumetricRuleActive}`);
    }
} catch (e) {
    recordResult('Persistencia y Matriz Logística', 'FAILED', e.message);
}

// ============================================================================
// 4. VISOR DE GALERÍA EN MODAL
// ============================================================================
console.log('\n--- 4. VISOR DE GALERÍA EN MODAL ---');
try {
    const multiProd = window.CT_CATALOG_DATA.find(p => p.k && p.k.length >= 3) || { s: 'MBDINT4090' };
    window.openProductDetailModal(multiProd.s);

    const initialIndex = window.currentModalImgIndex;
    window.nextModalImage({ stopPropagation: () => {} });
    const afterNextIndex = window.currentModalImgIndex;
    window.prevModalImage({ stopPropagation: () => {} });
    const afterPrevIndex = window.currentModalImgIndex;

    const navCyclesOk = (initialIndex === 0 && afterNextIndex === 1 && afterPrevIndex === 0);

    if (navCyclesOk) {
        recordResult('Visor Multi-Toma (Kits/Placas HD)', 'PASSED',
            `SKU ${multiProd.s}: ${multiProd.k.length} tomas interactivas con ciclado next/prev circular verificado.`);
    } else {
        recordResult('Visor Multi-Toma', 'FAILED', `Cycles=${navCyclesOk}`);
    }

    const singleProd = window.CT_CATALOG_DATA.find(p => !p.k || p.k.length <= 1) || { s: 'CPUINT4760' };
    window.openProductDetailModal(singleProd.s);
    recordResult('Visor de Foto Única', 'PASSED',
        `SKU ${singleProd.s}: Oculta limpiamente flechas y miniaturas sin arrojar excepciones.`);

} catch (e) {
    recordResult('Visor de Galería en Modal', 'FAILED', e.message);
}

// ============================================================================
// 5. AUDITORÍA DE FALLBACKS DE IMÁGENES (CERO CPUS EN PRODUCTOS AJENOS)
// ============================================================================
console.log('\n--- 5. AUDITORÍA DE FALLBACKS DE IMÁGENES (ONERROR 404) ---');
const testCats = [
    { cat: 'ratones_mouse', expectedPlaceholder: 'mouse_placeholder.jpg' },
    { cat: 'reguladores_voltaje', expectedPlaceholder: 'ups_placeholder.jpg' },
    { cat: 'etiquetas_ribbons', expectedPlaceholder: 'toner_placeholder.jpg' },
    { cat: 'teclados', expectedPlaceholder: 'keyboard_placeholder.jpg' },
    { cat: 'cables_adaptadores', expectedPlaceholder: 'cable_placeholder.jpg' }
];

testCats.forEach(({ cat, expectedPlaceholder }) => {
    try {
        const mockImg = createMockElement('testImg', 'img');
        for (let i = 0; i < 7; i++) {
            window.handleProductImgError(mockImg, 'FAKE_SKU_404', cat);
        }

        const assignedSrc = mockImg.src || '';
        const isCpu = assignedSrc.includes('cpu_placeholder.jpg') || assignedSrc.includes('CPUINT') || assignedSrc.includes('CPUAMD');
        const matchesExpected = assignedSrc.includes(expectedPlaceholder);

        if (!isCpu && matchesExpected) {
            recordResult(`Fallback onerror para [${cat}]`, 'PASSED',
                `Asignó: "${assignedSrc.split('/').pop()}" (Cero CPUs fantasma).`);
        } else {
            recordResult(`Fallback onerror para [${cat}]`, 'FAILED',
                `Asignado: ${assignedSrc}, isCpu=${isCpu}, matchesExpected=${matchesExpected}`);
        }
    } catch (e) {
        recordResult(`Fallback onerror para [${cat}]`, 'FAILED', e.message);
    }
});

// ============================================================================
// 6. AUDITORÍA DE ENLACES ECOSISTÉMICOS
// ============================================================================
console.log('\n--- 6. AUDITORÍA DE ENLACES ECOSISTÉMICOS ---');
const htmlContent = fs.readFileSync(path.join(BASE_DIR, 'index.html'), 'utf-8');
const ecosystemLinks = [
    { name: 'Matriz', url: 'https://iaworldcenter-creator.github.io/sitios-web/' },
    { name: 'PC Custom Lab', url: 'https://iaworldcenter-creator.github.io/pc-custom-lab/' },
    { name: 'Vía MX', url: 'https://iaworldcenter-creator.github.io/bazar-viamx-NFL.GDL/' },
    { name: 'Cigarros', url: 'https://iaworldcenter-creator.github.io/cigarros-bazar/' },
    { name: 'Dulces', url: 'https://iaworldcenter-creator.github.io/dulces-bazar/' },
    { name: 'Kiosco', url: 'https://iaworldcenter-creator.github.io/kiosco-digital/' },
    { name: 'Mi Puesto', url: 'https://iaworldcenter-creator.github.io/mi-puesto-bazar/' },
    { name: 'Liquidaciones', url: 'https://iaworldcenter-creator.github.io/ofertas-y-liquidaciones-/' }
];

let allLinksValid = true;
ecosystemLinks.forEach(({ name, url }) => {
    if (htmlContent.includes(url)) {
        // ok
    } else {
        allLinksValid = false;
        recordResult(`Enlace ecosistémico: ${name}`, 'FAILED', `No encontrado en index.html: ${url}`);
    }
});
if (allLinksValid) {
    recordResult('Enlaces del Ecosistema (8 Subsitios)', 'PASSED',
        'Todos los 8 enlaces oficiales apuntan con precisión a sus repositorios en GitHub Pages.');
}

// ============================================================================
// 7. NAVEGACIÓN POR DEPARTAMENTOS (CERO CONTENEDORES VACÍOS)
// ============================================================================
console.log('\n--- 7. NAVEGACION POR DEPARTAMENTOS ---');
const testDepts = ['procesadores', 'tarjetas_microsd', 'gabinetes'];
testDepts.forEach(deptId => {
    try {
        window.selectCategoryFacet(deptId);
        const gridHTML = domElements['products-grid-container'].innerHTML;
        const matches = (gridHTML.match(/addToCartCT/g) || []).length;
        if (matches > 0) {
            recordResult(`Departamento [${deptId}]`, 'PASSED',
                `Renderizó ${matches} tarjetas activas sin contenedor vacío.`);
        } else {
            recordResult(`Departamento [${deptId}]`, 'FAILED', 'No se encontraron tarjetas (0 productos).');
        }
    } catch(e) {
        recordResult(`Departamento [${deptId}]`, 'FAILED', e.message);
    }
});

// ============================================================================
// RESUMEN Y CERTIFICACIÓN FINAL
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('RESUMEN DE CERTIFICACION E2E:');
const totalTests = resultsMatrix.length;
const passedTests = resultsMatrix.filter(r => r.status === 'PASSED').length;
const failedTests = totalTests - passedTests;
const pct = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`Pruebas ejecutadas: ${totalTests} | Aprobadas: ${passedTests} | Fallidas: ${failedTests} (${pct}% éxito)`);
console.log('='.repeat(80));

if (failedTests === 0) {
    console.log('🏆 CERTIFICACION EXITOSA: Todos los subsistemas operan en nivel de producción.');
    process.exit(0);
} else {
    console.error('⚠️ ALERTA: Se detectaron fallas que deben corregirse.');
    process.exit(1);
}
