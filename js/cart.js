// =========================================================================
// CARRITO LATERAL DESLIZANTE (SLIDE-OVER DRAWER) & ENGINE DE COMPRAS
// PC CUSTOM LAB - ECOSYSTEM BAZAR NFL GDL
// =========================================================================

(function() {
    'use strict';

    function getCart() {
        try {
            const raw = localStorage.getItem('pc_custom_cart') || localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items');
            return raw ? JSON.parse(raw) : [];
        } catch(e) {
            return [];
        }
    }

    function saveCart(cart) {
        const json = JSON.stringify(cart);
        localStorage.setItem('pc_custom_cart', json);
        localStorage.setItem('ecosystem_global_cart', json);
        localStorage.setItem('cart_items', json);
        syncCartCounters();
        renderDrawerItems();
    }

    function syncCartCounters() {
        const cart = getCart();
        const totalCount = cart.reduce((acc, item) => acc + (parseInt(item.quantity || item.qty) || 1), 0);
        const totalNeto = cart.reduce((acc, item) => acc + ((parseFloat(item.price || item.precio) || 0) * (parseInt(item.quantity || item.qty) || 1)), 0);

        document.querySelectorAll('#boutique-cart-badge, .cart-badge, #cart-count').forEach(el => {
            el.textContent = totalCount.toString();
        });
        document.querySelectorAll('#boutique-cart-total, .cart-total').forEach(el => {
            if (typeof window.formatPriceDisplay === 'function') {
                el.textContent = window.formatPriceDisplay(totalNeto);
            } else {
                el.textContent = `$${totalNeto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
            }
        });
    }

    window.toggleCartDrawer = function(open) {
        const drawer = document.getElementById("cart-slide-drawer");
        const backdrop = document.getElementById("cart-backdrop");
        if (!drawer || !backdrop) return;

        if (open) {
            renderDrawerItems();
            backdrop.classList.remove("hidden");
            requestAnimationFrame(() => {
                backdrop.classList.remove("opacity-0");
                backdrop.classList.add("opacity-100");
                drawer.classList.remove("translate-x-full");
                drawer.classList.add("translate-x-0");
            });
            document.body.style.overflow = 'hidden';
        } else {
            drawer.classList.remove("translate-x-0");
            drawer.classList.add("translate-x-full");
            backdrop.classList.remove("opacity-100");
            backdrop.classList.add("opacity-0");
            setTimeout(() => {
                backdrop.classList.add("hidden");
                document.body.style.overflow = '';
            }, 300);
        }
    };

    function renderDrawerItems() {
        const container = document.getElementById("drawer-cart-items");
        const countEl = document.getElementById("drawer-cart-count");
        const subtotalEl = document.getElementById("drawer-cart-subtotal");
        const ivaEl = document.getElementById("drawer-cart-iva");
        const totalEl = document.getElementById("drawer-cart-total");
        if (!container) return;

        const cart = getCart();
        const totalCount = cart.reduce((acc, item) => acc + (parseInt(item.quantity || item.qty) || 1), 0);
        const totalNeto = cart.reduce((acc, item) => acc + ((parseFloat(item.price || item.precio) || 0) * (parseInt(item.quantity || item.qty) || 1)), 0);
        const subtotalSinIva = totalNeto / 1.16;
        const iva = totalNeto - subtotalSinIva;

        const format = (val) => typeof window.formatPriceDisplay === 'function' 
            ? window.formatPriceDisplay(val) 
            : `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;

        if (countEl) countEl.innerText = `${totalCount} ${totalCount === 1 ? 'artículo seleccionado' : 'artículos seleccionados'}`;
        if (subtotalEl) subtotalEl.innerText = format(subtotalSinIva);
        if (ivaEl) ivaEl.innerText = format(iva);
        if (totalEl) totalEl.innerText = format(totalNeto);

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                    <div class="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 text-3xl shadow-inner">
                        <i class="fa-solid fa-cart-arrow-down"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-mono font-bold text-sm">Tu carrito está vacío</h3>
                        <p class="text-xs text-slate-400 font-mono mt-1">Tu carrito está listo para tu próximo ensamble</p>
                    </div>
                    <button type="button" onclick="window.toggleCartDrawer(false); window.scrollToDepartments();" class="btn-action mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow min-h-[40px]">
                        Explorar Vitrinas
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = cart.map(item => {
            const sku = item.sku;
            const name = (item.name || item.nombre || '').replace(/'/g, "&#39;");
            const price = parseFloat(item.price || item.precio) || 0;
            const qty = parseInt(item.quantity || item.qty) || 1;
            const itemSubtotal = price * qty;
            const img = item.image || `assets/img/${sku}.webp`;

            return `
                <div class="py-3 flex items-center gap-3">
                    <div class="w-14 h-14 bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-800 flex items-center justify-center">
                        <img src="${img}" alt="${name}" width="56" height="56" class="w-full h-full object-contain" onerror="this.src='./assets/img/placeholders/acc_placeholder.jpg'" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-bold text-white leading-snug line-clamp-2" title="${name}">
                            ${name}
                        </h4>
                        <div class="text-[10px] font-mono text-cyan-300 font-bold mt-0.5">
                            SKU: ${sku}
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <!-- Selector de piezas interactivo [ - ] [ Cantidad ] [ + ] -->
                            <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                <button type="button" onclick="window.updateCartItemQty('${sku}', -1)" aria-label="Disminuir" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold transition cursor-pointer">
                                    -
                                </button>
                                <span class="w-8 text-center text-xs font-mono font-bold text-white">${qty}</span>
                                <button type="button" onclick="window.updateCartItemQty('${sku}', 1)" aria-label="Aumentar" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold transition cursor-pointer">
                                    +
                                </button>
                            </div>
                            <div class="text-right">
                                <div class="text-xs font-mono font-black text-emerald-400">${format(itemSubtotal)}</div>
                                <div class="text-[9px] font-mono text-slate-500">${format(price)} c/u</div>
                            </div>
                        </div>
                    </div>
                    <button type="button" onclick="window.removeCartItem('${sku}')" title="Eliminar partida" aria-label="Eliminar partida" class="text-slate-500 hover:text-red-400 p-1.5 transition cursor-pointer self-start">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    window.updateCartItemQty = function(sku, delta) {
        let cart = getCart();
        const item = cart.find(i => i.sku === sku);
        if (!item) return;

        item.quantity = (parseInt(item.quantity || item.qty) || 1) + delta;
        item.qty = item.quantity;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.sku !== sku);
        }
        saveCart(cart);
    };

    window.removeCartItem = function(sku) {
        let cart = getCart();
        cart = cart.filter(i => i.sku !== sku);
        saveCart(cart);
    };

    window.getBoutiqueCart = getCart;
    window.saveBoutiqueCart = saveCart;
    window.syncBoutiqueCart = syncCartCounters;

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.toggleCartDrawer(false);
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", syncCartCounters);
    } else {
        syncCartCounters();
    }
})();
