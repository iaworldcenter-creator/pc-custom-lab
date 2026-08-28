import json
import os
from generate_all_catalog_pages import CATALOG_DATA

output_path = r"E:\sitios web\pc-custom-lab\catalogo.html"

# Generar JSON de todos los 220 productos para el catálogo interactivo
catalog_json = json.dumps(CATALOG_DATA, ensure_ascii=False, indent=2)

html_content = f"""<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo Maestro de Hardware (11 Secciones) — PC Custom Lab</title>
    <meta name="description" content="Explora las 11 secciones de componentes de PC Custom Lab: Tarjetas Madre, Procesadores, GPUs, RAM, Almacenamiento, Fuentes, Gabinetes, Enfriamiento, Periféricos, Redes y Monitores/Software.">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
        h1, h2, h3, .font-heading {{ font-family: 'Outfit', sans-serif; }}
    </style>
</head>
<body class="bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col selection:bg-cyan-500 selection:text-black">

    <!-- Header Navigation -->
    <header class="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <!-- Brand Logo -->
            <a href="index.html" class="flex items-center gap-3 group">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                    <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-black text-xl">
                        ⚡
                    </div>
                </div>
                <div>
                    <span class="text-lg font-black tracking-wider text-white flex items-center gap-1.5 font-heading">
                        PC CUSTOM LAB <span class="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">PRO</span>
                    </span>
                    <p class="text-[11px] text-slate-400 font-medium">Armado Profesional & Hardware de Vanguardia</p>
                </div>
            </a>

            <!-- Search Bar -->
            <div class="hidden md:flex flex-1 max-w-md mx-4 relative">
                <input type="text" id="catalogSearch" oninput="filtrarProductos()" placeholder="Buscar entre 220 componentes (RTX, Ryzen, DDR5, B650...)" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors">
                <span class="absolute right-3 top-2.5 text-slate-400">🔍</span>
            </div>

            <!-- Quick Links -->
            <nav class="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-300">
                <a href="index.html" class="hover:text-cyan-400 transition-colors">Inicio</a>
                <a href="catalogo-01-tarjetas-madre.html" class="text-cyan-400 font-bold">Catálogo (11 Secciones)</a>
                <a href="producto.html" class="hover:text-cyan-400 transition-colors">Configurador</a>
                <a href="checkout.html" class="hover:text-cyan-400 transition-colors">Carrito</a>
            </nav>

            <!-- Cart Trigger Button -->
            <button onclick="toggleCartDrawer()" class="relative px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500 text-white flex items-center gap-2.5 font-semibold text-sm transition-all shadow-md">
                <span>🛒 Carrito</span>
                <span id="cartCountBadge" class="w-5 h-5 rounded-full bg-cyan-500 text-black text-xs font-black flex items-center justify-center">0</span>
            </button>
        </div>
    </header>

    <!-- Top Category Tabs -->
    <section class="bg-slate-950/60 border-b border-slate-800/60 py-3.5 px-4 sticky top-20 z-30 backdrop-blur-md overflow-x-auto scrollbar-thin">
        <div class="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1" id="navTabsContainer">
            <!-- Rendered by JS -->
        </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <!-- Hero Section Header -->
        <div id="sectionHero" class="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div>
                <div id="heroBadge" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>🔲</span> SECCIÓN 1 DE 11
                </div>
                <h1 id="heroTitle" class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-heading">
                    Tarjetas Madre (Motherboards)
                </h1>
                <p id="heroSubtitle" class="text-sm md:text-base text-slate-400 max-w-2xl mt-1">
                    Placas base de alto rendimiento para sockets AMD AM5/AM4 e Intel LGA1700/1850
                </p>
            </div>
            <div class="flex items-center gap-3">
                <a id="dedicatedPageLink" href="catalogo-01-tarjetas-madre.html" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all">
                    🔗 Abrir Página Dedicada
                </a>
                <span class="text-sm font-bold text-white bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800">20 Productos (5x4)</span>
            </div>
        </div>

        <!-- 5 Columns x 4 Rows Products Grid -->
        <section id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 mb-12">
            <!-- Injected by JS -->
        </section>

        <!-- Pagination Section -->
        <section class="border-t border-slate-800/80 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onclick="cambiarPagina(currentSectionIdx - 1)" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all">
                ← Sección Anterior
            </button>

            <!-- Numbered Links 1..11 -->
            <div id="paginationButtons" class="flex items-center gap-1.5 flex-wrap justify-center">
                <!-- Rendered by JS -->
            </div>

            <button onclick="cambiarPagina(currentSectionIdx + 1)" class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all">
                Siguiente Sección →
            </button>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-950 border-t border-slate-800/80 py-10 px-4 mt-auto">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center font-black">⚡</div>
                <span class="font-bold text-white">PC CUSTOM LAB © 2026</span> — Armado y Distribución de Hardware
            </div>
            <div class="flex gap-6 text-xs text-slate-400">
                <span>📍 Guadalajara, Jalisco, México</span>
                <span>💬 WhatsApp: +52 33 1234 5678</span>
                <span>🛡️ Garantía Oficial en los 220 Productos</span>
            </div>
        </div>
    </footer>

    <!-- Quick View Modal -->
    <div id="quickViewModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl">
            <button onclick="cerrarDetalle()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold">✕</button>
            <div class="w-full h-56 bg-slate-950 rounded-2xl flex items-center justify-center p-4 mb-4 border border-slate-800">
                <img id="modalImg" src="" class="max-h-full max-w-full object-contain">
            </div>
            <span id="modalBrand" class="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase"></span>
            <h3 id="modalTitle" class="text-xl font-bold text-white mt-2 mb-3"></h3>
            <p class="text-xs text-slate-400 mb-4" id="modalSpecs"></p>
            <div class="flex items-center justify-between pt-4 border-t border-slate-800">
                <span id="modalPrice" class="text-2xl font-black text-emerald-400"></span>
                <button id="modalAddBtn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-95">
                    🛒 Agregar al Carrito
                </button>
            </div>
        </div>
    </div>

    <!-- Cart Drawer -->
    <div id="cartDrawer" class="fixed inset-y-0 right-0 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl z-50 translate-x-full transition-transform duration-300 flex flex-col">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">🛒 Tu Carrito de Cotización</h3>
            <button onclick="toggleCartDrawer()" class="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center">✕</button>
        </div>
        <div id="cartItemsList" class="flex-1 overflow-y-auto p-5 space-y-4"></div>
        <div class="p-5 border-t border-slate-800 bg-slate-900/60">
            <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-slate-400">Total Estimado:</span>
                <span id="cartTotalSum" class="text-xl font-black text-cyan-400">$0 MXN</span>
            </div>
            <a href="checkout.html" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-black text-center text-sm block shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-opacity">
                Proceder al Checkout / Cotizar por WhatsApp
            </a>
        </div>
    </div>

    <script>
        const CATALOG_SECTIONS = {catalog_json};
        let currentSectionIdx = 0;
        let cart = JSON.parse(localStorage.getItem('pccustom_cart') || '[]');

        function renderPage() {{
            const currentCat = CATALOG_SECTIONS[currentSectionIdx];

            // Render Hero
            document.getElementById('heroBadge').innerHTML = `<span>${{currentCat.icon}}</span> SECCIÓN ${{currentSectionIdx + 1}} DE 11`;
            document.getElementById('heroTitle').innerText = currentCat.title;
            document.getElementById('heroSubtitle').innerText = currentCat.subtitle;
            document.getElementById('dedicatedPageLink').href = currentCat.slug;

            // Render Top Tabs
            const tabsContainer = document.getElementById('navTabsContainer');
            tabsContainer.innerHTML = CATALOG_SECTIONS.map((cat, idx) => {{
                const isAct = idx === currentSectionIdx;
                const cls = isAct ? "bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30 scale-105 border-cyan-400" : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700/60";
                return `
                <button onclick="cambiarPagina(${{idx}})" class="px-3.5 py-2 rounded-xl text-xs md:text-sm border transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${{cls}}">
                    <span>${{cat.icon}}</span>
                    <span>${{idx + 1}}. ${{cat.title.split('(')[0].trim()}}</span>
                </button>
                `;
            }}).join('');

            // Render Grid (5x4 = 20 products)
            renderGrid(currentCat.products);

            // Render Pagination Buttons
            const pagContainer = document.getElementById('paginationButtons');
            pagContainer.innerHTML = CATALOG_SECTIONS.map((cat, idx) => {{
                const isAct = idx === currentSectionIdx;
                const cls = "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all " + (
                    isAct ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-110 border border-cyan-400" :
                    "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                );
                return `<button onclick="cambiarPagina(${{idx}})" class="${{cls}}">${{idx + 1}}</button>`;
            }}).join('');
        }}

        function renderGrid(products) {{
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = products.map(p => {{
                const specsBadges = p.specs.map(s => `<span class="px-2 py-0.5 rounded-md bg-slate-800/80 text-cyan-300 border border-slate-700/50 text-[11px] font-medium">${{s}}</span>`).join('');
                
                let typeBadge = '';
                if (p.type === 'monitor') {{
                    typeBadge = '<span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider">🖥️ MONITOR</span>';
                }} else if (p.type === 'software') {{
                    typeBadge = '<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-bold uppercase tracking-wider">💿 SOFTWARE</span>';
                }} else {{
                    typeBadge = `<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">${{p.brand}}</span>`;
                }}

                const safeTitle = p.model.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                const specsStr = p.specs.join(', ').replace(/'/g, "&#39;");

                return `
                <div class="group bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 hover:border-cyan-500/60 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all"></div>
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            ${{typeBadge}}
                            <span class="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Stock: ${{p.stock}}
                            </span>
                        </div>
                        <div class="w-full h-44 rounded-xl bg-slate-950/80 border border-slate-800/50 flex items-center justify-center p-3 mb-3 relative overflow-hidden group-hover:border-cyan-500/30">
                            <img src="${{p.image}}" alt="${{safeTitle}}" class="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" loading="lazy" onerror="this.onerror=null; this.src='assets/img/fachada-oficial.webp';">
                        </div>
                        <div class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">${{p.brand}}</div>
                        <h3 class="text-sm font-bold text-white leading-snug line-clamp-2 mb-2.5 group-hover:text-cyan-200 transition-colors" title="${{safeTitle}}">
                            ${{p.model}}
                        </h3>
                        <div class="flex flex-wrap gap-1 mb-4">
                            ${{specsBadges}}
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-800/60 flex flex-col gap-2.5">
                        <div class="flex items-baseline justify-between">
                            <span class="text-xs text-slate-400 font-medium">Precio contado:</span>
                            <span class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                                $${{p.price.toLocaleString()}} <span class="text-xs text-slate-300 font-normal">MXN</span>
                            </span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="verDetalle('${{p.id}}', '${{safeTitle}}', '${{p.brand}}', ${{p.price}}, '${{p.image}}', '${{specsStr}}')" class="px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center justify-center gap-1">
                                👁️ Detalle
                            </button>
                            <button onclick="agregarAlCarrito('${{p.id}}', '${{safeTitle}}', ${{p.price}}, '${{p.image}}')" class="px-2.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1">
                                🛒 Cotizar
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }}).join('');
        }}

        function cambiarPagina(idx) {{
            if (idx < 0) idx = 0;
            if (idx >= CATALOG_SECTIONS.length) idx = CATALOG_SECTIONS.length - 1;
            currentSectionIdx = idx;
            renderPage();
            window.scrollTo({{ top: 0, behavior: 'smooth' }});
        }}

        function filtrarProductos() {{
            const term = document.getElementById('catalogSearch').value.toLowerCase().trim();
            if (!term) {{
                renderGrid(CATALOG_SECTIONS[currentSectionIdx].products);
                return;
            }}
            // Buscar en todos los productos de todas las secciones si hay búsqueda
            let matches = [];
            CATALOG_SECTIONS.forEach(cat => {{
                cat.products.forEach(p => {{
                    if (p.model.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term) || p.specs.some(s => s.toLowerCase().includes(term))) {{
                        matches.push(p);
                    }}
                }});
            }});
            renderGrid(matches);
        }}

        function updateCartUI() {{
            const badge = document.getElementById('cartCountBadge');
            const list = document.getElementById('cartItemsList');
            const totalEl = document.getElementById('cartTotalSum');
            
            const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
            badge.innerText = totalQty;
            
            if (cart.length === 0) {{
                list.innerHTML = '<div class="text-center py-12 text-slate-500 text-sm">Tu carrito está vacío.<br>Agrega componentes para cotizar.</div>';
                totalEl.innerText = '$0 MXN';
                return;
            }}
            
            let total = 0;
            list.innerHTML = cart.map((item, idx) => {{
                total += item.price * item.qty;
                return `
                <div class="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <img src="${{item.img}}" class="w-12 h-12 object-contain bg-slate-950 rounded-lg p-1">
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-bold text-white truncate">${{item.title}}</h4>
                        <div class="text-xs text-cyan-400 font-bold">$${{item.price.toLocaleString()}} MXN</div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="cambiarQty(${{idx}}, -1)" class="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center">-</button>
                        <span class="text-xs font-bold text-white px-1">${{item.qty}}</span>
                        <button onclick="cambiarQty(${{idx}}, 1)" class="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center">+</button>
                    </div>
                </div>
                `;
            }}).join('');
            
            totalEl.innerText = '$' + total.toLocaleString() + ' MXN';
            localStorage.setItem('pccustom_cart', JSON.stringify(cart));
        }}

        function agregarAlCarrito(id, title, price, img) {{
            const existing = cart.find(x => x.id === id);
            if (existing) {{
                existing.qty += 1;
            }} else {{
                cart.push({{ id, title, price, img, qty: 1 }});
            }}
            updateCartUI();
            toggleCartDrawer(true);
        }}

        function cambiarQty(idx, delta) {{
            cart[idx].qty += delta;
            if (cart[idx].qty <= 0) cart.splice(idx, 1);
            updateCartUI();
        }}

        function toggleCartDrawer(open = null) {{
            const drawer = document.getElementById('cartDrawer');
            if (open === true) drawer.classList.remove('translate-x-full');
            else if (open === false) drawer.classList.add('translate-x-full');
            else drawer.classList.toggle('translate-x-full');
        }}

        function verDetalle(id, title, brand, price, img, specs) {{
            document.getElementById('modalImg').src = img;
            document.getElementById('modalBrand').innerText = brand;
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalSpecs').innerText = 'Especificaciones clave: ' + specs;
            document.getElementById('modalPrice').innerText = '$' + price.toLocaleString() + ' MXN';
            document.getElementById('modalAddBtn').onclick = () => {{
                agregarAlCarrito(id, title, price, img);
                cerrarDetalle();
            }};
            document.getElementById('quickViewModal').classList.remove('hidden');
            document.getElementById('quickViewModal').classList.add('flex');
        }}

        function cerrarDetalle() {{
            document.getElementById('quickViewModal').classList.add('hidden');
            document.getElementById('quickViewModal').classList.remove('flex');
        }}

        // Iniciar
        renderPage();
        updateCartUI();
    </script>
</body>
</html>
"""

with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Catálogo maestro generado en: {output_path}")
