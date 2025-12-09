import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        console.error(`Error parsing PDF ${filePath}:`, error);
        return null;
    }
};

const run = async () => {
    const filePath = path.join(__dirname, '../exports/downloads/Todos los ramos/Ayudanta6_03nWRlVftdXpn0LGyD9k.pdf');
    console.log(`Extracting from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error("File not found!");
        return;
    }

    const text = await extractTextFromPdf(filePath);
    console.log("\n--- Extracted Text Start ---");
    console.log(text.substring(0, 1000));
    console.log("--- Extracted Text End ---");
};

run();
