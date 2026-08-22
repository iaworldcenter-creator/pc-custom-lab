import re
import os

TARGET_PATH = r'E:\sitios web\pc-custom-lab\index.html'
SYNC_PATH = r'C:\Users\nflgd\OneDrive\Documentos\ChatGPT\sitios web\pc-custom-lab\index.html'

with open(TARGET_PATH, 'r', encoding='utf-8') as f:
    text = f.read()

print("=== 1. FIX FORM LABELS & ARIA-LABELS ===")

# cotizador-slider
text = re.sub(
    r'<input type="range" id="cotizador-slider"([^>]*)>',
    r'<input type="range" id="cotizador-slider" aria-label="Control deslizante de presupuesto" \1>',
    text
)

# siteSearch
text = re.sub(
    r'<input([^>]*id="siteSearch"[^>]*)>',
    lambda m: m.group(0) if 'aria-label' in m.group(0) else m.group(0).replace('<input', '<input aria-label="¿Qué deseas buscar hoy?"'),
    text
)

# chat-input
text = re.sub(
    r'<input([^>]*id="chat-input"[^>]*)>',
    lambda m: m.group(0) if 'aria-label' in m.group(0) else m.group(0).replace('<input', '<input aria-label="Escribe tu mensaje o consulta"'),
    text
)

# lealtad-email & lealtad-phone
text = re.sub(
    r'<input([^>]*id="lealtad-email"[^>]*)>',
    lambda m: m.group(0) if 'aria-label' in m.group(0) else m.group(0).replace('<input', '<input aria-label="Correo electrónico para lealtad"'),
    text
)
text = re.sub(
    r'<input([^>]*id="lealtad-phone"[^>]*)>',
    lambda m: m.group(0) if 'aria-label' in m.group(0) else m.group(0).replace('<input', '<input aria-label="WhatsApp para lealtad"'),
    text
)

# Delivery modal inputs & labels
del_inputs = [
    ("del-nombre", "Nombre Completo"),
    ("del-telefono", "Teléfono de Contacto"),
    ("del-email", "Correo Electrónico"),
    ("del-calle", "Calle y Número"),
    ("del-colonia", "Colonia"),
    ("del-ciudad", "Ciudad"),
]
for inp_id, label_text in del_inputs:
    text = re.sub(
        rf'<label class="block text-\[10px\] font-mono text-slate-400 uppercase mb-1 font-bold">{label_text}</label>\s*<input class="([^"]*)" id="{inp_id}"',
        rf'<label for="{inp_id}" class="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">{label_text}</label>\n<input for="{inp_id}" aria-label="{label_text}" class="\1" id="{inp_id}"',
        text
    )

# Payment modal card inputs & labels
card_inputs = [
    ("card-num", "Número de Tarjeta"),
    ("card-exp", "Vencimiento"),
    ("card-cvv", "CVV"),
    ("card-name", "Nombre del Titular"),
]
for inp_id, label_text in card_inputs:
    text = re.sub(
        rf'<label class="text-slate-400 font-bold">{label_text}</label>\s*<input class="([^"]*)" id="{inp_id}"',
        rf'<label for="{inp_id}" class="text-slate-400 font-bold">{label_text}</label>\n<input aria-label="{label_text}" class="\1" id="{inp_id}"',
        text
    )

# Cotizador selects labels - ensure every select has matching for and aria-label
cot_selects = [
    ("select-nivel-filtro", "Nivel de Ensamble"),
    ("select-gabinete", "Gabinete"),
    ("select-psu", "Fuente de Poder"),
    ("select-cpu", "Procesador"),
    ("select-cooling", "Sistema de Enfriamiento"),
    ("select-mobo", "Tarjeta Madre"),
    ("select-gpu", "Tarjeta de Video"),
    ("select-ram", "Memoria RAM"),
    ("select-ssd", "Almacenamiento SSD"),
    ("select-teclado", "Teclado"),
    ("select-mouse", "Mouse"),
    ("select-monitor", "Monitor"),
    ("select-software", "Sistema Operativo"),
]
for s_id, s_name in cot_selects:
    text = re.sub(
        rf'<select id="{s_id}"([^>]*)>',
        rf'<select id="{s_id}" aria-label="{s_name}"\1>',
        text
    )

print("=== 2. FIX COLOR CONTRAST (WCAG AA >= 4.5:1) ===")
# Replace text-slate-500 and text-slate-600 on readable text with text-slate-400 / text-slate-300
text = text.replace('text-slate-500', 'text-slate-400')
text = text.replace('text-slate-600', 'text-slate-400')

print("=== 3. FIX TAP TARGETS (>= 44x44px) ===")
# Slider arrows
text = re.sub(
    r'class="hero-slider-control absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full',
    'class="hero-slider-control absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 min-w-[48px] min-h-[48px] rounded-full',
    text
)
text = re.sub(
    r'class="hero-slider-control absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full',
    'class="hero-slider-control absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 min-w-[48px] min-h-[48px] rounded-full',
    text
)

# Slider dots
text = re.sub(
    r'<button aria-label="Botón de acción interactiva" class="hero-dot w-3 h-3 rounded-full bg-blue-500 transition-all duration-300" onclick="goToSlide\(0\)"></button>',
    '<button aria-label="Ir a diapositiva 1" class="hero-dot min-w-[44px] min-h-[44px] p-3 flex items-center justify-center cursor-pointer" onclick="goToSlide(0)"><span class="w-3 h-3 rounded-full bg-blue-500 transition-all duration-300 block"></span></button>',
    text
)
text = re.sub(
    r'<button aria-label="Botón de acción interactiva" class="hero-dot w-3 h-3 rounded-full bg-slate-600 transition-all duration-300" onclick="goToSlide\(1\)"></button>',
    '<button aria-label="Ir a diapositiva 2" class="hero-dot min-w-[44px] min-h-[44px] p-3 flex items-center justify-center cursor-pointer" onclick="goToSlide(1)"><span class="w-3 h-3 rounded-full bg-slate-400 transition-all duration-300 block"></span></button>',
    text
)
text = re.sub(
    r'<button aria-label="Botón de acción interactiva" class="hero-dot w-3 h-3 rounded-full bg-slate-600 transition-all duration-300" onclick="goToSlide\(2\)"></button>',
    '<button aria-label="Ir a diapositiva 3" class="hero-dot min-w-[44px] min-h-[44px] p-3 flex items-center justify-center cursor-pointer" onclick="goToSlide(2)"><span class="w-3 h-3 rounded-full bg-slate-400 transition-all duration-300 block"></span></button>',
    text
)

# Pagination buttons
text = text.replace(
    'class="pagination-btn px-4 py-2.5 rounded-lg',
    'class="pagination-btn min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-lg flex items-center justify-center'
)

# Quantity buttons in cart drawer (+ / -)
text = re.sub(
    r'<button onclick="changeCartQty\(\$\{i\}, -1\)" class="([^"]*)"',
    r'<button onclick="changeCartQty(${i}, -1)" aria-label="Disminuir cantidad" class="\1 min-w-[44px] min-h-[44px] flex items-center justify-center"',
    text
)
text = re.sub(
    r'<button onclick="changeCartQty\(\$\{i\}, 1\)" class="([^"]*)"',
    r'<button onclick="changeCartQty(${i}, 1)" aria-label="Aumentar cantidad" class="\1 min-w-[44px] min-h-[44px] flex items-center justify-center"',
    text
)

# Close modal / drawer buttons
text = re.sub(
    r'<button class="text-2xl text-slate-400 hover:text-white cursor-pointer" onclick="closeCartDrawer\(\)">',
    '<button class="text-2xl text-slate-400 hover:text-white cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Cerrar carrito" onclick="closeCartDrawer()">',
    text
)

print("=== 4. FIX HEADING HIERARCHY (H1 -> H2 -> H3 -> H4) ===")

# Drawer title: h3 -> h2
text = text.replace(
    '<h3 class="text-lg font-black text-white flex items-center gap-2">',
    '<h2 class="text-lg font-black text-white flex items-center gap-2">'
).replace(
    '</h3>\n            <button class="text-2xl text-slate-400',
    '</h2>\n            <button class="text-2xl text-slate-400'
)

# Payment modal title: h3 -> h2
text = text.replace(
    '<h3 class="text-lg font-black text-white mb-4 flex items-center gap-2">',
    '<h2 class="text-lg font-black text-white mb-4 flex items-center gap-2">'
)
# Payment modal options: h4 -> h3
text = text.replace(
    '<h4 class="text-white font-bold text-sm">Efectivo contra entrega (Uber)</h4>',
    '<h3 class="text-white font-bold text-sm">Efectivo contra entrega (Uber)</h3>'
).replace(
    '<h4 class="text-white font-bold text-sm">Tarjeta de Crédito / Débito</h4>',
    '<h3 class="text-white font-bold text-sm">Tarjeta de Crédito / Débito</h3>'
).replace(
    '<h4 class="text-white font-bold text-sm">Transferencia SPEI</h4>',
    '<h3 class="text-white font-bold text-sm">Transferencia SPEI</h3>'
)

# Orders modal title: h3 -> h2
text = text.replace(
    '<h3 class="text-xl font-bold text-white flex items-center gap-2">',
    '<h2 class="text-xl font-bold text-white flex items-center gap-2">'
)

# Niveles section: h4 tier titles -> h3
tier_titles = [
    "PC Básica Hogar & Oficina",
    "PC Completa Gama Media / Estudiantes",
    "Gama Alta / Render & Oficina Pro",
    "Categoría Entusiasta / IA & Streaming",
    "Topping Extreme / Flagship 2026",
]
for tt in tier_titles:
    text = re.sub(
        rf'<h4 class="([^"]*)">{re.escape(tt)}</h4>',
        rf'<h3 class="\1">{tt}</h3>',
        text
    )

# Product cards in JS template: h4 -> h3
text = text.replace(
    '<h4 class="text-xs md:text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-blue-400 transition" title="${p.nombre}">${p.nombre}</h4>',
    '<h3 class="text-xs md:text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-blue-400 transition" title="${p.nombre}">${p.nombre}</h3>'
)
text = text.replace(
    '<h4 class="text-white font-bold text-xs truncate max-w-[170px]">${item.nombre}</h4>',
    '<h3 class="text-white font-bold text-xs truncate max-w-[170px]">${item.nombre}</h3>'
)

# Footer column titles: h4 -> h3
footer_titles = [
    "Contacto Local",
    "Políticas de Compra",
    "Ahorro y Cashback",
]
for ft in footer_titles:
    text = re.sub(
        rf'<h4 class="([^"]*)">\s*<i class="([^"]*)"></i>\s*{re.escape(ft)}\s*</h4>',
        rf'<h3 class="\1"><i class="\2"></i> {ft}</h3>',
        text
    )

# Save to E:
with open(TARGET_PATH, 'w', encoding='utf-8') as f:
    f.write(text)
print(f"Saved optimized HTML to {TARGET_PATH}")

# Sync to C: if exists
if os.path.exists(os.path.dirname(SYNC_PATH)):
    with open(SYNC_PATH, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Synced optimized HTML to {SYNC_PATH}")

print("=== ALL 4 ACCESSIBILITY ENHANCEMENTS APPLIED ===")
