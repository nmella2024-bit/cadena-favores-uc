import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createObjectCsvWriter } from 'csv-writer';
import mammoth from 'mammoth';
import { createRequire } from 'module';
import { parse } from 'csv-parse/sync'; // Add csv-parse
const require = createRequire(import.meta.url);

// Import Drive Helper (using dynamic import or require if it was CJS, but it is ESM)
// Since this script is ESM (type: module in package.json), we can import directly.
import { extractFileIdFromUrl, downloadFileFromDrive, getFileMetadata } from './drive_helper.js';

// Polyfill for Node.js BEFORE importing pdfjs-dist
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        }
        setMatrixValue(str) { return this; }
        translate(x, y) { return this; }
        scale(x, y) { return this; }
        toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
    };
}

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Also need to set worker?
// In legacy build for Node, we might need to point to the worker file if it complains.
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.js'; 
// Let's try without first.

const MATERIAL_DIR = './exports/downloads';
const EXPORT_DIR = './exports/ejercicios';
const TEMP_DIR = './temp_downloads'; // Temp dir for Drive downloads
const MANIFEST_PATH = path.join(EXPORT_DIR, 'manifest.csv');
const LOG_PATH = path.join(EXPORT_DIR, 'log_actions.txt');
const ISSUES_PATH = path.join(EXPORT_DIR, 'issues_to_review.md');

// Ensure directories exist
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Logger
const log = (message) => {
    const timestamp = new Date().toISOString();
    const line = `${timestamp} - ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_PATH, line);
};

const reportIssue = (file, issue, suggestion) => {
    const line = `\n### ${path.basename(file)}\n- **Ruta**: \`${file}\`\n- **Problema**: ${issue}\n- **Sugerencia**: ${suggestion}\n`;
    fs.appendFileSync(ISSUES_PATH, line);
};

// CSV Writer
const csvWriter = createObjectCsvWriter({
    path: MANIFEST_PATH,
    header: [
        { id: 'id', title: 'ID_ejercicio' },
        { id: 'titulo', title: 'título' },
        { id: 'tipo', title: 'tipo' },
        { id: 'numero', title: 'número' },
        { id: 'resumen', title: 'resumen_enunciado' },
        { id: 'archivo_origen', title: 'archivo_origen' },
        { id: 'ruta_origen', title: 'ruta_origen' },
        { id: 'pagina', title: 'página_or_slide' },
        { id: 'archivo_exportado', title: 'archivo_exportado' },
        { id: 'hash', title: 'hash_exportado' },
        { id: 'fecha', title: 'fecha_extracción' }
    ],
    append: fs.existsSync(MANIFEST_PATH)
});

// Helper: Generate Hash
const generateHash = (content) => {
    return crypto.createHash('sha256').update(content).digest('hex');
};

// Helper: Extract Text from PDF
const extractTextFromPdf = async (filePath) => {
    try {
        const data = new Uint8Array(fs.readFileSync(filePath));
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true
        });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        return fullText;
    } catch (error) {
        log(`Error reading PDF ${filePath}: ${error.message}`);
        return null;
    }
};

// Helper: Extract Text from DOCX
const extractTextFromDocx = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        log(`Error reading DOCX ${filePath}: ${error.message}`);
        return null;
    }
};

// Helper: Process Text to Find Exercises
const processText = (text, fileName, filePath, originalUrl = null) => {
    if (!text) return [];

    const exercises = [];

    // Strategy 1: Look for explicit "Ejercicio X", "Problema X", "Pregunta X"
    const explicitRegex = /(?:Ejercicio|Problema|Pregunta)\s+(\d+)[\s\.:]+(.*?)(?=(?:Ejercicio|Problema|Pregunta)\s+\d+|$)/gs;

    // Strategy 2: Look for numbered lists "1.", "1)", "1.-" at start of lines
    // This is riskier but catches more.
    const listRegex = /(?:^|\n)\s*(\d+)[\.\)]\s+(.*?)(?=(?:^|\n)\s*\d+[\.\)]\s+|$)/gs;

    let match;
    let foundExplicit = false;

    // Try Explicit First
    while ((match = explicitRegex.exec(text)) !== null) {
        foundExplicit = true;
        addExercise(match, 'explicit');
    }

    // If no explicit found, try list style
    if (!foundExplicit) {
        while ((match = listRegex.exec(text)) !== null) {
            addExercise(match, 'list');
        }
    }

    function addExercise(m, type) {
        const number = m[1];
        const content = m[2].trim();

        if (content.length < 20) return; // Skip too short

        const summary = content.substring(0, 50).replace(/\n/g, ' ') + '...';

        // Try to find page number
        const textBefore = text.substring(0, m.index);
        const pageMatch = textBefore.match(/--- Page (\d+) ---/g);
        const page = pageMatch ? pageMatch[pageMatch.length - 1].match(/\d+/)[0] : 'Unknown';

        exercises.push({
            id: `${path.basename(fileName, path.extname(fileName))}_Ej${number}`,
            titulo: `Ejercicio ${number}`,
            tipo: 'ejercicio',
            numero: number,
            resumen: summary,
            archivo_origen: fileName,
            ruta_origen: originalUrl || filePath,
            pagina: page,
            content: content
        });
    }

    // Fallback: If still no exercises, treat the whole text as one item (e.g. a short guide)
    if (exercises.length === 0 && text.length > 50) {
        exercises.push({
            id: `${path.basename(fileName, path.extname(fileName))}_Full`,
            titulo: `Documento Completo`,
            tipo: 'material',
            numero: '1',
            resumen: text.substring(0, 50).replace(/\n/g, ' ') + '...',
            archivo_origen: fileName,
            ruta_origen: originalUrl || filePath,
            pagina: '1',
            content: text
        });
    }

    return exercises;
};

// Main Processing Function
const processFile = async (filePath, originalUrl = null, customOutputDir = null) => {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    let text = '';

    log(`Processing ${fileName}...`);

    if (ext === '.pdf') {
        text = await extractTextFromPdf(filePath);
        if (!text || text.length < 100) {
            log(`Low text content in ${fileName}. OCR might be needed.`);
            reportIssue(filePath, 'Texto insuficiente o PDF escaneado', 'Usar OCR (pendiente de implementación completa)');
            // Fallback to OCR could go here if implemented
        }
    } else if (ext === '.docx') {
        text = await extractTextFromDocx(filePath);
    } else {
        return; // Skip other formats for now
    }

    const exercises = processText(text, fileName, filePath, originalUrl);
    log(`Found ${exercises.length} exercises in ${fileName}`);

    for (const ex of exercises) {
        // Determine Output Path
        // If customOutputDir is provided (e.g. from CSV Ramo), use it.
        // Otherwise use parent folder name.
        let outputDir;
        if (customOutputDir) {
            outputDir = path.join(EXPORT_DIR, customOutputDir, 'ejercicios');
        } else {
            // Preserve full directory structure relative to MATERIAL_DIR
            const relativePath = path.relative(MATERIAL_DIR, path.dirname(filePath));
            outputDir = path.join(EXPORT_DIR, relativePath, 'ejercicios');
        }

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputFileName = `Ej_${ex.numero}_${ex.id}.md`;
        const outputPath = path.join(outputDir, outputFileName);

        fs.writeFileSync(outputPath, ex.content);

        const hash = generateHash(ex.content);

        await csvWriter.writeRecords([{
            ...ex,
            archivo_exportado: outputFileName,
            hash: hash,
            fecha: new Date().toISOString()
        }]);
    }
};

// Recursive Walker for Local Files
const walkDir = async (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            await walkDir(filePath);
        } else {
            await processFile(filePath);
        }
    }
};

// CSV Processor for Drive Links
const processCsv = async (csvPath) => {
    log(`Reading CSV: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    for (const record of records) {
        const url = record.archivoUrl || record.url; // Adjust column name as needed
        const ramo = record.ramo || record.curso || 'General';

        if (!url) continue;

        const fileId = extractFileIdFromUrl(url);
        if (fileId) {
            log(`Downloading Drive file: ${fileId} (${ramo})`);
            try {
                // Get metadata to know extension
                const metadata = await getFileMetadata(fileId);
                const safeName = metadata.name.replace(/[^a-z0-9.]/gi, '_');
                const tempPath = path.join(TEMP_DIR, safeName);

                await downloadFileFromDrive(fileId, tempPath);

                await processFile(tempPath, url, ramo);

                // Cleanup
                fs.unlinkSync(tempPath);
            } catch (err) {
                log(`Failed to process Drive file ${url}: ${err.message}`);
                reportIssue(url, 'Error descarga Drive', err.message);
            }
        }
    }
};

// Run
(async () => {
    log('Starting extraction pipeline...');

    // Check arguments
    const args = process.argv.slice(2);
    const csvArg = args.find(arg => arg.endsWith('.csv'));

    if (csvArg) {
        if (fs.existsSync(csvArg)) {
            await processCsv(csvArg);
        } else {
            log(`CSV file not found: ${csvArg}`);
        }
    } else {
        // Default to local material folder
        if (!fs.existsSync(MATERIAL_DIR)) {
            log(`Material directory not found at ${MATERIAL_DIR}. Creating dummy for testing.`);
            fs.mkdirSync(path.join(MATERIAL_DIR, 'Calculo'), { recursive: true });
            // Create a dummy text file pretending to be a PDF/DOC for logic check if needed, 
            // but real test needs real files.
        }
        await walkDir(MATERIAL_DIR);
    }

    log('Extraction complete.');
})();
