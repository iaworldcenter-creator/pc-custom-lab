/**
 * CHUNK CATALOG DEPARTMENTS
 * Divide el catálogo masivo de PC Custom Lab (17,490 productos) en particiones JSON
 * ligeras por departamento (< 350 KB, límite estricto 400 KB) para permitir descargas y consultas
 * en segundo plano a través de Web Workers.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT_DIR, 'js', 'ct-catalog-data.js');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data', 'departments');
const MANIFEST_PATH = path.join(ROOT_DIR, 'data', 'departments_manifest.json');

console.log('='.repeat(70));
console.log('INICIANDO PARTICIONADO DE DATOS (DATA CHUNKING POR DEPARTAMENTO)');
console.log('='.repeat(70));

// 1. Cargar datos del catálogo
global.window = global;
const rawContent = fs.readFileSync(CATALOG_PATH, 'utf8');
eval(rawContent);

const deptsList = window.PC_DEPARTAMENTOS || [];
const allProducts = window.CT_CATALOG_DATA || [];

console.log(`Departamentos oficiales detectados: ${deptsList.length}`);
console.log(`Total productos en catálogo maestro: ${allProducts.length.toLocaleString('es-MX')}`);

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Limpiar archivos JSON previos en la carpeta
const existingFiles = fs.readdirSync(OUTPUT_DIR);
for (const f of existingFiles) {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(OUTPUT_DIR, f));
}

// 2. Agrupar productos por departamento
const deptMap = {};
for (const d of deptsList) {
    deptMap[d.id] = [];
}

const unassigned = [];
for (const p of allProducts) {
    const cat = (p.categoria_clasificada || p.c || 'accesorios_perifericos').toLowerCase();
    if (deptMap[cat]) {
        deptMap[cat].push(p);
    } else {
        const matched = Object.keys(deptMap).find(k => k.toLowerCase() === cat);
        if (matched) {
            deptMap[matched].push(p);
        } else {
            unassigned.push(p);
        }
    }
}

if (unassigned.length > 0) {
    console.log(`Asignando ${unassigned.length} productos sin departamento a 'accesorios_perifericos'...`);
    if (!deptMap['accesorios_perifericos']) deptMap['accesorios_perifericos'] = [];
    deptMap['accesorios_perifericos'].push(...unassigned);
}

// 3. Escribir particiones asegurando que NINGÚN archivo exceda 320 KB (< 400 KB estricto)
const MAX_CHUNK_BYTES = 320 * 1024; // 320 KB límite objetivo
const manifest = {
    generatedAt: new Date().toISOString(),
    totalProducts: allProducts.length,
    departmentsCount: deptsList.length,
    departments: {}
};

let totalWrittenFiles = 0;
let totalWrittenProducts = 0;

for (const d of deptsList) {
    const items = deptMap[d.id] || [];
    const deptInfo = {
        id: d.id,
        name: d.name,
        icon: d.icon,
        order: d.order,
        count: items.length,
        files: []
    };

    if (items.length === 0) {
        manifest.departments[d.id] = deptInfo;
        continue;
    }

    const fullJson = JSON.stringify(items);
    const fullSize = Buffer.byteLength(fullJson, 'utf8');

    if (fullSize <= MAX_CHUNK_BYTES) {
        // Un solo archivo para este departamento
        const filename = `${d.id}.json`;
        const filepath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filepath, fullJson, 'utf8');
        deptInfo.files.push(`data/departments/${filename}`);
        totalWrittenFiles++;
        totalWrittenProducts += items.length;
    } else {
        // Particionar acumulando elementos por tamaño real de bytes
        let currentChunk = [];
        let currentBytes = 2; // "[]"
        let partIndex = 1;

        for (let i = 0; i < items.length; i++) {
            const itemStr = JSON.stringify(items[i]);
            const itemBytes = Buffer.byteLength(itemStr, 'utf8') + 1; // coma o corchete

            if (currentBytes + itemBytes > MAX_CHUNK_BYTES && currentChunk.length > 0) {
                const filename = `${d.id}_part_${partIndex}.json`;
                const filepath = path.join(OUTPUT_DIR, filename);
                fs.writeFileSync(filepath, JSON.stringify(currentChunk), 'utf8');
                deptInfo.files.push(`data/departments/${filename}`);
                totalWrittenFiles++;
                totalWrittenProducts += currentChunk.length;

                partIndex++;
                currentChunk = [items[i]];
                currentBytes = 2 + itemBytes;
            } else {
                currentChunk.push(items[i]);
                currentBytes += itemBytes;
            }
        }

        if (currentChunk.length > 0) {
            const filename = `${d.id}_part_${partIndex}.json`;
            const filepath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(filepath, JSON.stringify(currentChunk), 'utf8');
            deptInfo.files.push(`data/departments/${filename}`);
            totalWrittenFiles++;
            totalWrittenProducts += currentChunk.length;
        }

        console.log(`  [PARTICIÓN DINÁMICA] ${d.id} (${(fullSize / 1024).toFixed(1)} KB) -> dividido en ${deptInfo.files.length} archivos`);
    }

    manifest.departments[d.id] = deptInfo;
}

// 4. Guardar manifiesto maestro
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

console.log('='.repeat(70));
console.log('RESUMEN DE PARTICIONADO:');
console.log(`Archivos JSON generados: ${totalWrittenFiles}`);
console.log(`Total productos distribuidos: ${totalWrittenProducts.toLocaleString('es-MX')} de ${allProducts.length.toLocaleString('es-MX')}`);
console.log(`Manifiesto escrito en: data/departments_manifest.json`);

// Comprobación de límites estrictos (< 400 KB)
const writtenFiles = fs.readdirSync(OUTPUT_DIR);
let violations = 0;
let maxFileSize = 0;
let maxFileName = '';
for (const file of writtenFiles) {
    const fPath = path.join(OUTPUT_DIR, file);
    const sz = fs.statSync(fPath).size;
    if (sz > maxFileSize) {
        maxFileSize = sz;
        maxFileName = file;
    }
    if (sz > 400 * 1024) {
        console.error(`ALERTA: El archivo ${file} supera 400 KB (${(sz / 1024).toFixed(1)} KB)`);
        violations++;
    }
}

console.log(`Archivo más pesado: ${maxFileName} con ${(maxFileSize / 1024).toFixed(1)} KB (Límite máximo permitido: 400 KB).`);

if (violations === 0 && totalWrittenProducts === allProducts.length) {
    console.log('✅ ÉXITO TOTAL: 100% de los 17,490 productos particionados y todos los archivos < 400 KB.');
} else {
    console.error(`❌ Se detectaron fallos en el particionado.`);
    process.exit(1);
}
