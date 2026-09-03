import os
import io
import json
import urllib.request
import ssl
from PIL import Image, ImageChops

BASE_DIR = r"E:\sitios web\pc-custom-lab"
IMG_OUT_DIR = os.path.join(BASE_DIR, "assets", "img")
COMPACT_JSON = os.path.join(BASE_DIR, "data", "catalogo_maestro_compact.json")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
}

def autocrop_to_1080(img_bytes, target_size=1080, fill_ratio=0.90):
    try:
        img = Image.open(io.BytesIO(img_bytes))
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
            alpha = img.split()[-1]
            bbox = alpha.getbbox()
        else:
            img = img.convert('RGB')
            bg = Image.new('RGB', img.size, (255, 255, 255))
            diff = ImageChops.difference(img, bg)
            diff_gray = diff.convert('L')
            diff_thresh = diff_gray.point(lambda p: 255 if p > 12 else 0)
            bbox = diff_thresh.getbbox() or diff.getbbox()

        if bbox:
            cropped = img.crop(bbox)
        else:
            cropped = img

        max_inner = int(target_size * fill_ratio)
        w, h = cropped.size
        ratio = w / h
        if ratio > 1:
            new_w = max_inner
            new_h = max(1, int(new_w / ratio))
        else:
            new_h = max_inner
            new_w = max(1, int(new_h * ratio))

        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        canvas = Image.new('RGB', (target_size, target_size), (255, 255, 255))
        offset_x = (target_size - new_w) // 2
        offset_y = (target_size - new_h) // 2

        if resized.mode == 'RGBA':
            canvas.paste(resized, (offset_x, offset_y), mask=resized.split()[3])
        else:
            canvas.paste(resized, (offset_x, offset_y))

        out_io = io.BytesIO()
        canvas.save(out_io, format='WEBP', quality=88, method=6)
        return out_io.getvalue()
    except Exception as e:
        return None

def fetch_image_bytes(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            if resp.status == 200:
                data = resp.read()
                if len(data) > 1500:
                    img = Image.open(io.BytesIO(data))
                    if img.width >= 250 and img.height >= 250:
                        return data
    except Exception:
        pass
    return None

TARGET_SPECIFIC_ASSETS = {
    # 1. Intel NUC Kit BOXNUC7CJYHN (MBDINT4090)
    'MBDINT4090': [
        'https://images.pcel.com/1600/Computadoras-Desktops-Intel-BOXNUC7CJYHN-469324-nXmcjHLN34G2w6WI.jpg',
        'https://c1.neweggimages.com/productimage/nb640/A6ZPD2206090ZAZIAD2.jpg',
        'https://compusales.com.mx/33266-tm_thickbox_default/intel-nuc-nuc7cjyhn-ucff-negro-j4005-2-ghz.jpg'
    ],
    # 2. Intel NUC Kit BOXNUC7PJYH1 (MBDINT3970)
    'MBDINT3970': [
        'https://c1.neweggimages.com/productimage/nb640/56-102-204-V01.jpg',
        'https://www.ascendtech.com/images/products/BOXNUC7PJYH1-01.jpg',
        'https://compusales.com.mx/33266-tm_thickbox_default/intel-nuc-nuc7cjyhn-ucff-negro-j4005-2-ghz.jpg'
    ],
    # 3. Intel NUC 11 Pro BNUC11TNHI70001 (MBDINT4040)
    'MBDINT4040': [
        'https://images.pcel.com/1600/Computadoras-Desktops-Intel-BNUC11TNHI70001-409648-83mPjSs1sxtNmGIO.jpg',
        'https://c1.neweggimages.com/productimage/nb640/56-102-292-V01.jpg',
        'https://ik.imagekit.io/intercompras/images/product/INTEL_BNUC11TNHI70001.jpg'
    ]
}

def harvest_product_gallery(sku, cat, name):
    saved_paths = []
    urls = TARGET_SPECIFIC_ASSETS.get(sku, [])
    cdn_urls = [
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_full.jpg",
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_1_full.jpg",
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_2_full.jpg",
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_3_full.jpg",
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_4_full.jpg",
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_1.jpg",
        f"https://static.ctonline.mx/imagenes/{sku}/{sku}_2.jpg"
    ]
    all_candidate_urls = urls + [u for u in cdn_urls if u not in urls]

    idx = 0
    for u in all_candidate_urls:
        if len(saved_paths) >= 5:
            break
        raw = fetch_image_bytes(u)
        if raw:
            webp = autocrop_to_1080(raw)
            if webp:
                shot_name = f"{sku}_{idx}.webp"
                shot_path = os.path.join(IMG_OUT_DIR, shot_name)
                with open(shot_path, 'wb') as f:
                    f.write(webp)
                saved_paths.append(f"assets/img/{shot_name}")
                if idx == 0:
                    base_path = os.path.join(IMG_OUT_DIR, f"{sku}.webp")
                    with open(base_path, 'wb') as f:
                        f.write(webp)
                idx += 1

    base_path = os.path.join(IMG_OUT_DIR, f"{sku}.webp")
    if len(saved_paths) == 0 and os.path.exists(base_path) and os.path.getsize(base_path) > 1000:
        with open(base_path, 'rb') as f:
            raw = f.read()
        webp = autocrop_to_1080(raw)
        if webp:
            shot_0 = os.path.join(IMG_OUT_DIR, f"{sku}_0.webp")
            with open(shot_0, 'wb') as f:
                f.write(webp)
            with open(base_path, 'wb') as f:
                f.write(webp)
            saved_paths.append(f"assets/img/{sku}_0.webp")

    return sku, saved_paths

def main():
    print("=" * 80)
    print("IMAGE HARVESTER: EXTRACCIÓN MULTI-IMAGEN HD Y RETIRO DE PLACEHOLDERS")
    print("=" * 80)

    for sku in TARGET_SPECIFIC_ASSETS.keys():
        s, paths = harvest_product_gallery(sku, 'mini_pcs_nuc', '')
        print(f"[EXITO] {sku} -> {len(paths)} fotografías HD AutoCrop 1080x1080:")
        for p in paths:
            print(f"   -> {p}")

    with open(COMPACT_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)

    mbd_products = [p for p in products if p.get('c') == 'tarjetas_madre']
    print(f"\nAuditando {len(mbd_products)} tarjetas madre en catálogo...")
    
    harvested = 0
    for p in mbd_products:
        sku = p['s']
        shot_0 = os.path.join(IMG_OUT_DIR, f"{sku}_0.webp")
        shot_1 = os.path.join(IMG_OUT_DIR, f"{sku}_1.webp")
        if not (os.path.exists(shot_0) and os.path.exists(shot_1)):
            s, paths = harvest_product_gallery(sku, 'tarjetas_madre', p.get('n', ''))
            if len(paths) >= 2:
                harvested += 1
                print(f"[RECOLECTADO] Motherboard {sku}: {len(paths)} tomas")

    print(f"\nProceso finalizado. {harvested} placas base actualizadas con galería multi-imagen.")

if __name__ == '__main__':
    main()
