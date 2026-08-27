// MOTOR DE GESTIÓN DE CARRITO Y CONTROLES UI (SIN BLOQUEOS NI DRAWERS FANTASMA)
function getCart() {
    try {
        const raw = localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items');
        if (!raw) return [];
        return JSON.parse(raw);
    } catch(e) { return []; }
}

function saveCart(cart) {
    try {
        localStorage.setItem('ecosystem_global_cart', JSON.stringify(cart));
        localStorage.setItem('cart_items', JSON.stringify(cart));
    } catch(e) {}
    updateCartCounter();
}

function updateCartCounter() {
    const cart = getCart();
    const totalCount = cart.reduce((acc, item) => acc + (parseInt(item.quantity || item.qty) || 1), 0);
    const subtotal = cart.reduce((acc, item) => acc + ((parseFloat(item.precio || item.price) || 0) * (parseInt(item.quantity || item.qty) || 1)), 0);

    document.querySelectorAll('#boutique-cart-badge, .cart-badge, #cart-count').forEach(el => {
        el.textContent = totalCount;
    });

    document.querySelectorAll('#boutique-cart-total').forEach(el => {
        el.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`;
    });
}

function changeQty(sku, delta) {
    let cart = getCart();
    const item = cart.find(i => i.sku === sku);
    if (!item) return;

    item.quantity = (parseInt(item.quantity || item.qty) || 1) + delta;
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

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
});
window.addEventListener('storage', () => {
    updateCartCounter();
});
