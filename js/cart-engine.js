// =========================================================================
// MOTOR UNIVERSAL DE CARRITO Y CONTROLES UI - BAZAR NFL.GDL (ECOSISTEMA UNIFICADO)
// =========================================================================

const CART_STORAGE_KEY = 'ecosystem_global_cart';
const LEGACY_STORAGE_KEY = 'cart_items';

function getCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!raw) return [];
        const items = JSON.parse(raw);
        // Normalizar propiedades para compatibilidad total
        return items.map(item => ({
            sku: item.sku || '',
            nombre: item.nombre || item.title || 'Producto',
            title: item.title || item.nombre || 'Producto',
            precio: parseFloat(item.precio || item.price) || 0,
            price: parseFloat(item.price || item.precio) || 0,
            quantity: parseInt(item.quantity || item.qty) || 1,
            qty: parseInt(item.qty || item.quantity) || 1,
            imagen: item.imagen || item.image || item.img || 'assets/img/mascota_tigre_thumb.webp',
            image: item.image || item.imagen || item.img || 'assets/img/mascota_tigre_thumb.webp',
            categoria: item.categoria || item.category || ''
        }));
    } catch(e) {
        console.error('Error al leer el carrito:', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(cart));
    } catch(e) {}
    updateCartCounter();
    renderCartDrawer();
}

function updateCartCounter() {
    const cart = getCart();
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0);
    const subtotal = cart.reduce((acc, item) => acc + ((item.precio || item.price) * (item.quantity || item.qty || 1)), 0);

    // Actualizar todos los badges de conteo en la interfaz
    document.querySelectorAll('#boutique-cart-badge, .cart-badge, #cart-count, .cart-counter').forEach(el => {
        el.textContent = totalCount;
        if (el.id === 'boutique-cart-badge') {
            el.style.display = 'flex';
        } else {
            el.style.display = totalCount > 0 ? 'inline-flex' : 'none';
        }
    });

    // Actualizar textos de total en cabecera
    document.querySelectorAll('#boutique-cart-total, .cart-header-total').forEach(el => {
        el.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`;
    });
}

function changeQty(sku, delta) {
    let cart = getCart();
    const item = cart.find(i => i.sku === sku);
    if (!item) return;

    item.quantity = (item.quantity || 1) + delta;
    item.qty = item.quantity;

    if (item.quantity <= 0) {
        cart = cart.filter(i => i.sku !== sku);
    }

    saveCart(cart);
}

function removeCartItem(sku) {
    let cart = getCart();
    cart = cart.filter(i => i.sku !== sku);
    saveCart(cart);
}

function deleteItem(sku) {
    removeCartItem(sku);
}

function changeItemQty(sku, delta) {
    changeQty(sku, delta);
}

function renderCartDrawer() {
    const cartContainers = document.querySelectorAll('#boutique-cart-items, #cart-items-container, .cart-list');
    const subtotalElements = document.querySelectorAll('#drawer-subtotal, #chk-subtotal');
    const cashbackElements = document.querySelectorAll('#drawer-cashback');
    const totalElements = document.querySelectorAll('#drawer-total, #cart-total-val, #chk-total, .total-precio');

    const cart = getCart();
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const subtotal = cart.reduce((acc, item) => acc + ((item.precio || item.price) * (item.quantity || 1)), 0);
    const cashback = subtotal * 0.05;

    // Actualizar subtotales y totales
    subtotalElements.forEach(el => el.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`);
    cashbackElements.forEach(el => el.textContent = `$${cashback.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`);
    totalElements.forEach(el => el.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`);

    if (cartContainers.length === 0) return;

    if (cart.length === 0) {
        cartContainers.forEach(container => {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-400 font-mono">
                    <i class="fa-solid fa-cart-shopping text-2xl text-slate-500 mb-2 block"></i>
                    <p class="text-xs font-bold text-slate-300">Tu canasta está vacía</p>
                    <small class="text-slate-500">Agrega productos desde el catálogo</small>
                </div>`;
        });
        return;
    }

    const itemsHtml = cart.map(item => {
        const itemTotal = (item.precio || item.price) * (item.quantity || 1);
        const imgSrc = item.imagen || item.image || 'assets/img/mascota_tigre_thumb.webp';

        return `
        <div class="flex items-center justify-between p-3 mb-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-md gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <img src="${imgSrc}" alt="${item.nombre}" class="w-12 h-12 object-contain bg-slate-900 rounded-xl p-1 shrink-0" onerror="this.onerror=null;this.src='assets/img/mascota_tigre_thumb.webp';">
                <div class="min-w-0 flex-1">
                    <h5 class="text-xs font-bold text-white truncate" title="${item.nombre}">${item.nombre}</h5>
                    <span class="text-[11px] font-mono text-amber-400 font-bold block">$${Number(item.precio || item.price).toLocaleString('es-MX', {minimumFractionDigits: 2})} c/u</span>
                </div>
            </div>
            
            <div class="flex items-center gap-1.5 shrink-0">
                <div class="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                    <button onclick="changeQty('${item.sku}', -1)" aria-label="Disminuir cantidad" class="w-7 h-7 bg-transparent border-0 text-slate-300 hover:text-white font-bold cursor-pointer text-sm flex items-center justify-center active:scale-90">-</button>
                    <span class="min-w-[20px] text-center font-mono text-xs font-black text-white px-1">${item.quantity || item.qty || 1}</span>
                    <button onclick="changeQty('${item.sku}', 1)" aria-label="Aumentar cantidad" class="w-7 h-7 bg-transparent border-0 text-slate-300 hover:text-white font-bold cursor-pointer text-sm flex items-center justify-center active:scale-90">+</button>
                </div>

                <button onclick="removeCartItem('${item.sku}')" aria-label="Eliminar del carrito" title="Eliminar del carrito" class="w-8 h-8 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/60 hover:text-red-200 cursor-pointer flex items-center justify-center transition active:scale-90 ml-1">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        </div>`;
    }).join('');

    cartContainers.forEach(container => {
        container.innerHTML = itemsHtml;
    });
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    renderCartDrawer();
});
