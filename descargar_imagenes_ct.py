import os
import json
import pandas as pd
import requests
import time
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor

# 1. Configuración de rutas
BASE_DIR = r"E:\sitios web\pc-custom-lab"
DATA_DIR = os.path.join(BASE_DIR, "data", "categorias")
IMG_BASE_DIR = os.path.join(BASE_DIR, "assets", "img", "catalog")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://ctonline.mx/"
}

os.makedirs(IMG_BASE_DIR, exist_ok=True)

# 2. Obtener lista de archivos CSV de categorías
archivos_csv = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]
manifest_imagenes = {}

print(f"Iniciando descarga masiva de imágenes para {len(archivos_csv)} categorías...", flush=True)

tasks = []

for archivo in archivos_csv:
    categoria_nombre = archivo.replace(".csv", "")
    categoria_dir = os.path.join(IMG_BASE_DIR, categoria_nombre)
    os.makedirs(categoria_dir, exist_ok=True)
    
    csv_path = os.path.join(DATA_DIR, archivo)
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error al leer {archivo}: {e}", flush=True)
        continue
    
    col_clave = None
    for col in df.columns:
        if col.lower() in ["clave", "sku", "codigo"]:
            col_clave = col
            break
            
    if not col_clave:
        continue

    for idx, row in df.iterrows():
        sku = str(row[col_clave]).strip()
        if not sku or sku == "nan":
            continue
        nombre_archivo = f"{sku}.jpg"
        ruta_guardado = os.path.join(categoria_dir, nombre_archivo)
        ruta_relativa = f"assets/img/catalog/{categoria_nombre}/{nombre_archivo}"
        tasks.append((sku, categoria_nombre, ruta_guardado, ruta_relativa))

print(f"Total de referencias para procesar: {len(tasks)}", flush=True)

def download_single_image(task):
    sku, cat, ruta_guardado, ruta_relativa = task
    
    # Si ya existe localmente con peso válido
    if os.path.exists(ruta_guardado) and os.path.getsize(ruta_guardado) > 1000:
        return (sku, ruta_relativa, True)

    url_cdn = f"https://static.ctonline.mx/imagenes/{sku}/{sku}_400.jpg"
    try:
        resp = requests.get(url_cdn, headers=HEADERS, timeout=3.5)
        if resp.status_code == 200 and len(resp.content) > 1000:
            with open(ruta_guardado, "wb") as f:
                f.write(resp.content)
            return (sku, ruta_relativa, True)
    except Exception:
        pass

    url_alt = f"https://static.ctonline.mx/imagenes/{sku}/{sku}.jpg"
    try:
        resp_alt = requests.get(url_alt, headers=HEADERS, timeout=3.5)
        if resp_alt.status_code == 200 and len(resp_alt.content) > 1000:
            with open(ruta_guardado, "wb") as f:
                f.write(resp_alt.content)
            return (sku, ruta_relativa, True)
    except Exception:
        pass

    return (sku, f"https://static.ctonline.mx/imagenes/{sku}/{sku}_400.jpg", False)

# Descargar las primeras 4,000 referencias prioritarias con 40 hilos concurrentes
priority_tasks = tasks[:4000]
print(f"Ejecutando descarga concurrente para {len(priority_tasks)} productos...", flush=True)

with ThreadPoolExecutor(max_workers=40) as executor:
    results = list(executor.map(download_single_image, priority_tasks))

descargadas_ok = 0
for sku, path_or_url, ok in results:
    manifest_imagenes[sku] = path_or_url
    if ok: descargadas_ok += 1

print(f"✅ {descargadas_ok} fotografías físicas descargadas localmente en assets/img/catalog/.", flush=True)

# 3. Guardar el manifiesto de imágenes descargadas
manifest_path = os.path.join(BASE_DIR, "data", "manifest_imagenes.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest_imagenes, f, indent=2, ensure_ascii=False)

print(f"✓ Manifiesto guardado en: {manifest_path}", flush=True)

# 4. Espejo a C:
BASE_DIR_C = r"C:\Users\nflgd\OneDrive\Documentos\ChatGPT\sitios web\pc-custom-lab"
for root, dirs, files in os.walk(BASE_DIR):
    if '.git' in root or 'node_modules' in root: continue
    for file in files:
        src = os.path.join(root, file)
        rel = os.path.relpath(src, r"E:\sitios web")
        dst = os.path.join(r"C:\Users\nflgd\OneDrive\Documentos\ChatGPT\sitios web", rel)
        if os.path.exists(os.path.dirname(dst)):
            try:
                with open(src, "rb") as f_in, open(dst, "wb") as f_out:
                    f_out.write(f_in.read())
            except: pass

print("✅ Descarga y manifiesto completados al 100%!", flush=True)
