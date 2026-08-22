import re
import os

TARGET_PATH = r'E:\sitios web\pc-custom-lab\index.html'
SYNC_PATH = r'C:\Users\nflgd\OneDrive\Documentos\ChatGPT\sitios web\pc-custom-lab\index.html'

with open(TARGET_PATH, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Inventory summary in Aside
print("1. Updating inventory count to 220 products and 11 pages in sidebar...")
text = re.sub(
    r'<div class="text-xl font-black text-amber-400">\s*200\s*<span class="text-xs text-slate-400 font-normal">productos</span></div>\s*<div class="text-\[10px\] text-slate-400 font-mono">10 páginas × 20 por página</div>',
    '<div class="text-xl font-black text-amber-400">220 <span class="text-xs text-slate-400 font-normal">productos</span></div>\n        <div class="text-[10px] text-slate-400 font-mono">11 páginas × 20 por página</div>',
    text
)

# Add Software y Licencias link to sidebar if not present
if "filterByCategory('software'" not in text:
    text = text.replace(
        '<li><a href="#productos" onclick="filterByCategory(\'perifericos\', event)"',
        '<li><a href="#productos" onclick="filterByCategory(\'software\', event)" class="text-xs text-slate-300 hover:text-pink-400 transition cursor-pointer flex items-center gap-1.5 bg-slate-900/60 lg:bg-transparent px-2.5 py-1 rounded lg:p-0 border border-slate-800 lg:border-none"><i class="hidden lg:inline fa-solid fa-chevron-right text-[8px] text-slate-400"></i> Software y Monitores Pro</a></li>\n                <li><a href="#productos" onclick="filterByCategory(\'perifericos\', event)"'
    )
    print("   Added Software y Monitores Pro to sidebar")

# 2. Add Página 11 button to #pagination-container
print("2. Adding Página 11 button to pagination container...")
btn_p10 = '<button onclick="changePage(10, this)" class="pagination-btn min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition font-bold text-sm shadow-md cursor-pointer active:scale-95">Página 10</button>'
btn_p11 = '<button onclick="changePage(10, this)" class="pagination-btn min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition font-bold text-sm shadow-md cursor-pointer active:scale-95">Página 10</button>\n<button onclick="changePage(11, this)" class="pagination-btn min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition font-bold text-sm shadow-md cursor-pointer active:scale-95">Página 11</button>'

if 'changePage(11, this)' not in text and btn_p10 in text:
    text = text.replace(btn_p10, btn_p11)
    print("   Added Página 11 button")

# 3. Update PAGE_TO_CATEGORY, CATEGORY_TO_PAGE, CATEGORY_NAMES, CATEGORY_ASSET_MAP
print("3. Updating category mappings and rotation sequence for Page 11...")
old_maps = '''const PAGE_TO_CATEGORY = {
    1: 'gpu',
    2: 'motherboards',
    3: 'ram',
    4: 'procesadores',
    5: 'almacenamiento',
    6: 'gabinetes',
    7: 'fuentes',
    8: 'enfriamiento',
    9: 'monitores',
    10: 'perifericos',
};

const CATEGORY_TO_PAGE = {
    'gpu': 1,
    'motherboards': 2,
    'ram': 3,
    'procesadores': 4,
    'almacenamiento': 5,
    'gabinetes': 6,
    'fuentes': 7,
    'enfriamiento': 8,
    'monitores': 9,
    'perifericos': 10,
};

const CATEGORY_NAMES = {
    'gpu': 'Tarjetas de Video (GPU)',
    'motherboards': 'Tarjetas Madre',
    'ram': 'Memoria RAM',
    'procesadores': 'Procesadores',
    'almacenamiento': 'Discos SSD/HDD',
    'gabinetes': 'Gabinetes',
    'fuentes': 'Fuentes de Poder',
    'enfriamiento': 'Sistemas de Enfriamiento',
    'monitores': 'Monitores',
    'perifericos': 'Periféricos (Teclado y Mouse)',
};'''

new_maps = '''const PAGE_TO_CATEGORY = {
    1: 'gpu',
    2: 'motherboards',
    3: 'ram',
    4: 'procesadores',
    5: 'almacenamiento',
    6: 'gabinetes',
    7: 'fuentes',
    8: 'enfriamiento',
    9: 'monitores',
    10: 'perifericos',
    11: 'software',
};

const CATEGORY_TO_PAGE = {
    'gpu': 1,
    'motherboards': 2,
    'ram': 3,
    'procesadores': 4,
    'almacenamiento': 5,
    'gabinetes': 6,
    'fuentes': 7,
    'enfriamiento': 8,
    'monitores': 9,
    'perifericos': 10,
    'software': 11,
    'monitores-software': 11,
};

const CATEGORY_NAMES = {
    'gpu': 'Tarjetas de Video (GPU)',
    'motherboards': 'Tarjetas Madre',
    'ram': 'Memoria RAM',
    'procesadores': 'Procesadores',
    'almacenamiento': 'Discos SSD/HDD',
    'gabinetes': 'Gabinetes',
    'fuentes': 'Fuentes de Poder',
    'enfriamiento': 'Sistemas de Enfriamiento',
    'monitores': 'Monitores Gamer & Productividad',
    'perifericos': 'Periféricos (Teclado y Mouse)',
    'software': 'Monitores Especiales & Software Profesional',
    'monitores-software': 'Monitores & Software',
};'''

if old_maps in text:
    text = text.replace(old_maps, new_maps)
    print("   Updated page maps with page 11 (software & monitores)")

# Ensure CATEGORY_ASSET_MAP has 4-item rotation for software / monitores-software
old_cat_asset_map = '''    monitores: [
        'assets/img/catalog/monitor_curvo_negro.webp?v=1.2.0',
        'assets/img/catalog/monitor_plano_blanco.webp?v=1.2.0',
        'assets/img/catalog/software_estante_madera.webp?v=1.2.0',
        'assets/img/catalog/software_estante_muro.webp?v=1.2.0'
    ],
    perifericos: [
        'assets/img/catalog/perifericos_combo_1.webp?v=1.2.0',
        'assets/img/catalog/perifericos_combo_2.webp?v=1.2.0'
    ]'''

new_cat_asset_map = '''    monitores: [
        'assets/img/catalog/monitor_curvo_negro.webp?v=1.2.0',
        'assets/img/catalog/monitor_plano_blanco.webp?v=1.2.0'
    ],
    perifericos: [
        'assets/img/catalog/perifericos_combo_1.webp?v=1.2.0',
        'assets/img/catalog/perifericos_combo_2.webp?v=1.2.0'
    ],
    software: [
        'assets/img/catalog/monitor_curvo_negro.webp?v=1.2.0',
        'assets/img/catalog/software_estante_madera.webp?v=1.2.0',
        'assets/img/catalog/monitor_plano_blanco.webp?v=1.2.0',
        'assets/img/catalog/software_estante_muro.webp?v=1.2.0'
    ],
    'monitores-software': [
        'assets/img/catalog/monitor_curvo_negro.webp?v=1.2.0',
        'assets/img/catalog/software_estante_madera.webp?v=1.2.0',
        'assets/img/catalog/monitor_plano_blanco.webp?v=1.2.0',
        'assets/img/catalog/software_estante_muro.webp?v=1.2.0'
    ]'''

if old_cat_asset_map in text:
    text = text.replace(old_cat_asset_map, new_cat_asset_map)
    print("   Updated CATEGORY_ASSET_MAP with 4-item rotation sequence")

# 4. Add 20 products for Page 11 into productCatalog
print("4. Appending 20 products for Page 11 to productCatalog...")
page_11_products = '''
    // ========== PÁGINA 11: MONITORES ESPECIALES & SOFTWARE PROFESIONAL — 20 modelos ==========
    {sku:'SFT-001',nombre:'Monitor Curvo Odyssey G9 49" Dual QHD 240Hz 1ms',imagen:'assets/img/catalog/monitor_curvo_negro.webp',precio:'28900',descripcion:'Pantalla curva ultra-wide de 49 pulgadas Dual QHD 5120x1440 con panel OLED/Quantum Mini-LED, 240Hz y tiempo de respuesta de 0.03ms.',categoria:'software'},
    {sku:'SFT-002',nombre:'Licencia Microsoft Windows 11 Pro OEM 64-Bit',imagen:'assets/img/catalog/software_estante_madera.webp',precio:'3200',descripcion:'Sistema operativo original Microsoft Windows 11 Pro de 64 bits con soporte de virtualización Hyper-V, cifrado BitLocker y seguridad avanzada.',categoria:'software'},
    {sku:'SFT-003',nombre:'Monitor ASUS ROG Swift 32" 4K OLED 240Hz Gaming',imagen:'assets/img/catalog/monitor_plano_blanco.webp',precio:'24500',descripcion:'Monitor gaming plano de 32 pulgadas 4K UHD 3840x2160 panel WOLED, tasa de refresco 240Hz, HDR10 y disipador térmico personalizado.',categoria:'software'},
    {sku:'SFT-004',nombre:'Suite Microsoft Office 365 Professional Plus (1 Año)',imagen:'assets/img/catalog/software_estante_muro.webp',precio:'1850',descripcion:'Paquete de productividad completo que incluye Word, Excel, PowerPoint, Outlook, Access y 1TB de almacenamiento en la nube OneDrive.',categoria:'software'},
    {sku:'SFT-005',nombre:'Monitor Curvo Alienware 34" QD-OLED WQHD 175Hz',imagen:'assets/img/catalog/monitor_curvo_negro.webp',precio:'21000',descripcion:'Monitor curvo 1800R con tecnología Quantum Dot OLED, resolución WQHD 3440x1440, cobertura de color 99.3% DCI-P3 y certificación G-SYNC Ultimate.',categoria:'software'},
    {sku:'SFT-006',nombre:'Antivirus & Endpoint Security Kaspersky Total 2026',imagen:'assets/img/catalog/software_estante_madera.webp',precio:'850',descripcion:'Protección integral contra ransomware, malware, phishing y ataques de día cero para 3 dispositivos por 1 año con VPN ilimitada.',categoria:'software'},
    {sku:'SFT-007',nombre:'Monitor LG UltraGear 27" QHD Nano IPS 180Hz HDR400',imagen:'assets/img/catalog/monitor_plano_blanco.webp',precio:'7900',descripcion:'Pantalla gaming de 27 pulgadas resolución 2560x1440, tiempo de respuesta 1ms GtG, compatible con NVIDIA G-SYNC y AMD FreeSync Premium.',categoria:'software'},
    {sku:'SFT-008',nombre:'Licencia Microsoft Windows Server 2025 Standard Core',imagen:'assets/img/catalog/software_estante_muro.webp',precio:'14500',descripcion:'Sistema operativo para servidores de alto rendimiento con soporte multinúcleo, clustering de conmutación por error y contenedores Windows.',categoria:'software'},
    {sku:'SFT-009',nombre:'Monitor BenQ MOBIUZ 27" IPS 165Hz HDRi Audio treVolo',imagen:'assets/img/catalog/monitor_curvo_negro.webp',precio:'6800',descripcion:'Monitor para entretenimiento y gaming con sensor inteligente de brillo HDRi, altavoces integrados treVolo 2.1 y control de espacio de color.',categoria:'software'},
    {sku:'SFT-010',nombre:'Suite Adobe Creative Cloud All Apps Anual Pro',imagen:'assets/img/catalog/software_estante_madera.webp',precio:'12900',descripcion:'Acceso completo a más de 20 aplicaciones creativas: Photoshop, Illustrator, Premiere Pro, After Effects, InDesign y almacenamiento en nube.',categoria:'software'},
    {sku:'SFT-011',nombre:'Monitor Curvo Samsung Odyssey Neo G7 32" 4K Mini-LED',imagen:'assets/img/catalog/monitor_plano_blanco.webp',precio:'19500',descripcion:'Monitor con curvatura 1000R, resolución 4K 3840x2160, iluminación Quantum Matrix Mini-LED HDR2000 y frecuencia de actualización 165Hz.',categoria:'software'},
    {sku:'SFT-012',nombre:'Autodesk AutoCAD 2026 Licencia Comercial Anual',imagen:'assets/img/catalog/software_estante_muro.webp',precio:'38500',descripcion:'Software líder en diseño y dibujo 2D/3D con conjuntos de herramientas especializadas para arquitectura, ingeniería mecánica y eléctrica.',categoria:'software'},
    {sku:'SFT-013',nombre:'Monitor ASUS ProArt 27" 4K Calibrado Delta E<2 IPS',imagen:'assets/img/catalog/monitor_curvo_negro.webp',precio:'11800',descripcion:'Monitor para diseñadores y fotógrafos con 100% sRGB, 100% Rec. 709, verificación Calman, conectividad USB-C con entrega de energía de 65W.',categoria:'software'},
    {sku:'SFT-014',nombre:'Licencia DaVinci Resolve Studio 19 Dongle / Key',imagen:'assets/img/catalog/software_estante_madera.webp',precio:'6200',descripcion:'Software profesional de edición de video, etalonaje de color, efectos visuales Fairlight y motor de inteligencia artificial DaVinci Neural Engine.',categoria:'software'},
    {sku:'SFT-015',nombre:'Monitor Curvo MSI Optix 34" UWQHD 144Hz 1ms HDR400',imagen:'assets/img/catalog/monitor_plano_blanco.webp',precio:'9500',descripcion:'Pantalla panorámica 21:9 UWQHD 3440x1440 con curvatura 1500R, panel VA con contraste 3000:1 y tecnología antiparpadeo y reducción de luz azul.',categoria:'software'},
    {sku:'SFT-016',nombre:'Licencia Red Hat Enterprise Linux Workstation 10',imagen:'assets/img/catalog/software_estante_muro.webp',precio:'4200',descripcion:'Plataforma empresarial de Linux para desarrollo de software, inteligencia artificial, cómputo científico y estaciones de trabajo de misión crítica.',categoria:'software'},
    {sku:'SFT-017',nombre:'Monitor Gigabyte M28U 28" 4K 144Hz KVM HDMI 2.1',imagen:'assets/img/catalog/monitor_curvo_negro.webp',precio:'10900',descripcion:'Monitor gaming 4K UHD con interruptor KVM integrado para controlar dos computadoras con un solo set de teclado y ratón, compatible con consolas PS5/Xbox.',categoria:'software'},
    {sku:'SFT-018',nombre:'Licencia VMware Workstation Pro 18 Comercial',imagen:'assets/img/catalog/software_estante_madera.webp',precio:'3900',descripcion:'Hipervisor de escritorio estándar para ejecutar múltiples máquinas virtuales x86 en entornos Windows y Linux con aceleración DirectX 12.',categoria:'software'},
    {sku:'SFT-019',nombre:'Monitor ViewSonic Elite 27" Fast IPS 240Hz G-SYNC',imagen:'assets/img/catalog/monitor_plano_blanco.webp',precio:'8400',descripcion:'Monitor de esports de alta velocidad con tiempo de respuesta de 0.5ms MPRT, iluminación ambiental RGB Elite y soporte ajustable en 3 ejes.',categoria:'software'},
    {sku:'SFT-020',nombre:'Licencia Microsoft Visual Studio Enterprise 2026',imagen:'assets/img/catalog/software_estante_muro.webp',precio:'22000',descripcion:'Entorno de desarrollo integrado de nivel empresarial con pruebas avanzadas de arquitectura, herramientas de diagnóstico en vivo y soporte para .NET 10 y C++.',categoria:'software'},
'''

# Find end of PER-020 in productCatalog
pos_per20 = text.find("{sku:'PER-020'")
if pos_per20 != -1:
    pos_per20_end = text.find('}', pos_per20)
    if pos_per20_end != -1:
        if 'SFT-001' not in text:
            text = text[:pos_per20_end+1] + ',' + page_11_products + text[pos_per20_end+1:]
            print("   Inserted 20 products for Page 11 into productCatalog")
        else:
            print("   Page 11 products already present")

# 5. Update pagination status text on statusEl and touch swipe bounds
text = re.sub(
    r'Mostrando página \$\{currentPage\} de 10 —',
    'Mostrando página ${currentPage} de 11 —',
    text
)
text = text.replace('if (currentPage < 10)', 'if (currentPage < 11)')

# Save to E:
with open(TARGET_PATH, 'w', encoding='utf-8') as f:
    f.write(text)
print(f"Saved to {TARGET_PATH}")

# Sync to C: if exists
if os.path.exists(os.path.dirname(SYNC_PATH)):
    with open(SYNC_PATH, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Synced to {SYNC_PATH}")

print("=== PAGE 11 INTEGRATION COMPLETED ===")
