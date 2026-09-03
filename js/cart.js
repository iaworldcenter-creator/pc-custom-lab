// =========================================================================
// MOTOR DE CARRITO UNIFICADO DEL ECOSISTEMA (IAWC_MASTER_CART)
// PERSISTENCIA MULTI-TIENDA Y SINCRONIZACIÓN REACTIVA
// =========================================================================

(function() {
    'use strict';

    const STORAGE_KEY = 'IAWC_MASTER_CART';

    function getCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
            // Migración transparente de claves heredadas
            for (const legacyKey of ['ecosystem_global_cart', 'cart_items', 'pc_custom_cart']) {
                const leg = localStorage.getItem(legacyKey);
                if (leg) {
                    const parsed = JSON.parse(leg);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        saveCart(parsed);
                        return parsed;
                    }
                }
            }
            return [];
        } catch(e) {
            return [];
        }
    }

    function saveCart(cart) {
        try {
            const json = JSON.stringify(cart);
            localStorage.setItem(STORAGE_KEY, json);
            // Sincronización con claves legadas para compatibilidad con código existente
            localStorage.setItem('ecosystem_global_cart', json);
            localStorage.setItem('cart_items', json);
            localStorage.setItem('pc_custom_cart', json);
        } catch(e) {
            console.warn("Error persistiendo carrito IAWC:", e);
        }
        syncCartCounters();
        renderDrawerItems();
    }

    function syncCartCounters() {
        const cart = getCart();
        const totalCount = cart.reduce((acc, item) => acc + (parseInt(item.qty || item.quantity) || 1), 0);
        const totalNeto = cart.reduce((acc, item) => acc + ((parseFloat(item.price || item.precio) || 0) * (parseInt(item.qty || item.quantity) || 1)), 0);

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

    
    function isVolumetricItem(item) {
        if (!item) return false;
        if (item.isVolumetric === true || item.v === 1) return true;
        const sku = (item.sku || item.id || '').toUpperCase();
        if (sku.startsWith('GAB') || sku.startsWith('MON') || sku.startsWith('SER') || sku.startsWith('SIL') || sku.startsWith('CLIM')) return true;
        if (window.CT_CATALOG_DATA && Array.isArray(window.CT_CATALOG_DATA)) {
            const found = window.CT_CATALOG_DATA.find(p => (p.s === sku || p.sku === sku));
            if (found && (found.v === 1 || found.is_volumetric === true)) return true;
        }
        return false;
    }

    function renderDrawerItems() {
        const container = document.getElementById("drawer-cart-items");
        const countEl = document.getElementById("drawer-cart-count");
        const subtotalEl = document.getElementById("drawer-cart-subtotal");
        const ivaEl = document.getElementById("drawer-cart-iva");
        const totalEl = document.getElementById("drawer-cart-total");
        if (!container) return;

        const cart = getCart();
        const totalCount = cart.reduce((acc, item) => acc + (parseInt(item.qty || item.quantity) || 1), 0);
        const totalNeto = cart.reduce((acc, item) => acc + ((parseFloat(item.price || item.precio) || 0) * (parseInt(item.qty || item.quantity) || 1)), 0);
        const subtotalSinIva = totalNeto / 1.16;
        const iva = totalNeto - subtotalSinIva;

        const format = (val) => typeof window.formatPriceDisplay === 'function' 
            ? window.formatPriceDisplay(val) 
            : `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;

        const shippingBadgeEl = document.getElementById("drawer-shipping-badge");

        if (countEl) countEl.innerText = `${totalCount} ${totalCount === 1 ? 'artículo seleccionado' : 'artículos seleccionados'}`;
        if (subtotalEl) subtotalEl.innerText = format(subtotalSinIva);
        if (ivaEl) ivaEl.innerText = format(iva);
        if (totalEl) totalEl.innerText = format(totalNeto);

        if (cart.length === 0) {
            if (shippingBadgeEl) shippingBadgeEl.innerHTML = '';
            container.innerHTML = `
                <div class="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                    <div class="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 text-3xl shadow-inner">
                        <i class="fa-solid fa-cart-arrow-down"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-mono font-bold text-sm">Tu carrito está vacío</h3>
                        <p class="text-xs text-slate-400 font-mono mt-1">Listo para tu próximo ensamble o compra en el ecosistema</p>
                    </div>
                    <button type="button" onclick="window.toggleCartDrawer(false); window.scrollToDepartments();" class="btn-action mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow min-h-[40px]">
                        Explorar Vitrinas
                    </button>
                </div>
            `;
            return;
        }

        // Evaluación de la Matriz Logística / Reglas de Envío
        const hasVolumetric = cart.some(item => isVolumetricItem(item));
        if (shippingBadgeEl) {
            if (hasVolumetric) {
                // REGLA A: Artículos Volumétricos / Frágiles (Prohibida moto)
                shippingBadgeEl.innerHTML = `
                    <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 font-mono text-[11px] flex items-start gap-2.5 shadow-md mb-2">
                        <i class="fa-solid fa-box-open text-base text-amber-400 mt-0.5 shrink-0"></i>
                        <div>
                            <strong class="block font-bold text-amber-300 uppercase tracking-wide">📦 Paquetería Especializada Obligatoria</strong>
                            <span class="text-[10px] text-amber-300/90 leading-tight block mt-0.5">
                                Incluye piezas volumétricas/frágiles. Despacho exclusivo en vehículo seguro (no moto) con seguro de traslado.
                            </span>
                        </div>
                    </div>
                `;
            } else if (totalNeto >= 2000) {
                // REGLA B: Pedidos >= $2,000 MXN
                shippingBadgeEl.innerHTML = `
                    <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 font-mono text-[11px] flex items-start gap-2.5 shadow-md mb-2">
                        <i class="fa-solid fa-shield-halved text-base text-cyan-400 mt-0.5 shrink-0"></i>
                        <div>
                            <strong class="block font-bold text-cyan-300 uppercase tracking-wide">🛡️ Paquetería Asegurada Nacional</strong>
                            <span class="text-[10px] text-cyan-300/90 leading-tight block mt-0.5">
                                Envío asegurado contra mermas con guía rastreable y firma obligatoria de entrega.
                            </span>
                        </div>
                    </div>
                `;
            } else {
                // REGLA C: Pedidos < $2,000 MXN estándar
                shippingBadgeEl.innerHTML = `
                    <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] flex items-start gap-2.5 shadow-md mb-2">
                        <i class="fa-solid fa-motorcycle text-base text-emerald-400 mt-0.5 shrink-0"></i>
                        <div>
                            <strong class="block font-bold text-emerald-300 uppercase tracking-wide">🛵 Envío Exprés Local o Paquetería</strong>
                            <span class="text-[10px] text-emerald-300/90 leading-tight block mt-0.5">
                                Aplica despacho ágil en motocicleta o recolección directa en tienda Pedro Moreno 501 A.
                            </span>
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = cart.map(item => {
            const sku = item.sku || item.id || '';
            const title = (item.title || item.name || item.nombre || '').replace(/'/g, "&#39;");
            const price = parseFloat(item.price || item.precio) || 0;
            const qty = parseInt(item.qty || item.quantity) || 1;
            const itemSubtotal = price * qty;
            const storeName = item.storeName || item.tienda_origen || 'PC Custom Lab';
            const img = item.img || item.image || `assets/img/${sku}.webp`;

            return `
                <div class="py-3 flex items-start gap-3">
                    <div class="w-14 h-14 bg-slate-950 rounded-xl p-1 shrink-0 border border-slate-800 flex items-center justify-center">
                        <img src="${img}" alt="${title}" width="56" height="56" class="w-full h-full object-contain" onerror="this.src='./assets/img/placeholders/acc_placeholder.jpg'" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span class="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded">
                                ${storeName}
                            </span>
                            <span class="text-[9.5px] font-mono text-slate-400">SKU: ${sku}</span>
                            ${isVolumetricItem(item) ? `<span class="text-[8.5px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded flex items-center gap-0.5"><i class="fa-solid fa-box-open text-[8px]"></i> Volumétrico</span>` : ''}
                        </div>
                        <h4 class="text-xs font-bold text-white leading-snug line-clamp-2" title="${title}">
                            ${title}
                        </h4>
                        <div class="flex items-center justify-between mt-2">
                            <!-- Selector interactivo [ - ] [ Cantidad ] [ + ] -->
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
        const item = cart.find(i => (i.sku === sku || i.id === sku));
        if (!item) return;

        const currentQty = parseInt(item.qty || item.quantity) || 1;
        const newQty = currentQty + delta;
        item.qty = newQty;
        item.quantity = newQty;

        if (newQty <= 0) {
            cart = cart.filter(i => (i.sku !== sku && i.id !== sku));
        }
        saveCart(cart);
    };

    window.removeCartItem = function(sku) {
        let cart = getCart();
        cart = cart.filter(i => (i.sku !== sku && i.id !== sku));
        saveCart(cart);
    };

    window.getBoutiqueCart = getCart;
    window.saveBoutiqueCart = saveCart;
    window.syncBoutiqueCart = syncCartCounters;

    // SINCRONIZACIÓN REACTIVA MULTI-PESTAÑA Y MULTI-SITIO
    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY || e.key === 'ecosystem_global_cart' || e.key === 'cart_items') {
            syncCartCounters();
            renderDrawerItems();
        }
    });

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
