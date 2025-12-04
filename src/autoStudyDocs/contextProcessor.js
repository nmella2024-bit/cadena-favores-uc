import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker (Static file in public folder)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extracts text from a File object (PDF, TXT, MD).
 * @param {File} file - The file to process.
 * @returns {Promise<string>} - The extracted text.
 */
export const extractTextFromFile = async (file) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await extractTextFromPdf(file);
    } else if (
        fileType.startsWith('text/') ||
        fileName.endsWith('.txt') ||
        fileName.endsWith('.md') ||
        fileName.endsWith('.json')
    ) {
        return await extractTextFromTextFile(file);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }
};

/**
 * Extracts text from a text-based file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
const extractTextFromTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

/**
 * Extracts text from a PDF file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
const extractTextFromPdf = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF file.');
    }
};
/**
 * Extracts text from a URL (e.g. Firebase Storage).
 * @param {string} url - The URL of the file.
 * @param {string} mimeType - Optional mime type if known.
 * @returns {Promise<string>} - The extracted text.
 */
export const extractTextFromUrl = async (url, mimeType = null) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

        const blob = await response.blob();

        // Create a File object from the Blob to reuse existing logic
        // We try to infer name/type if possible, or use defaults
        const type = mimeType || blob.type;
        const name = url.split('/').pop().split('?')[0] || 'downloaded_file';

        const file = new File([blob], name, { type });

        return await extractTextFromFile(file);
    } catch (error) {
        console.error('Error extracting text from URL:', error);
        throw error;
    }
};
