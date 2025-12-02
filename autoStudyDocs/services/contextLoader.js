import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from a File object (PDF, TXT, MD)
 * @param {File} file - The file to process
 * @returns {Promise<string>} - The extracted text
 */
export const extractTextFromFile = async (file) => {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return await extractTextFromPDF(file);
    } else if (fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.md')) {
        return await extractTextFromTextFile(file);
    } else {
        throw new Error(`Formato de archivo no soportado: ${fileType}`);
    }
};

const extractTextFromTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Página ${i} ---\n${pageText}\n\n`;
        }

        return fullText;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('No se pudo leer el archivo PDF.');
    }
};
