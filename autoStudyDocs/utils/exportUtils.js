import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export content to PDF
 * @param {HTMLElement} element - The HTML element to render
 * @param {string} filename - The output filename
 */
export const exportToPDF = async (element, filename) => {
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw new Error('Error al exportar PDF.');
    }
};

/**
 * Export content to Text file
 * @param {string} content - The text content
 * @param {string} filename - The output filename
 */
export const exportToTXT = (content, filename) => {
    // Strip HTML tags for TXT
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    downloadFile(text, `${filename}.txt`, 'text/plain');
};

/**
 * Export content to Markdown file
 * @param {string} content - The HTML content (converted to simplified MD)
 * @param {string} filename - The output filename
 */
export const exportToMD = (content, filename) => {
    // Simple HTML to MD conversion
    let md = content
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<ul>/g, '')
        .replace(/<\/ul>/g, '\n')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<br\s*\/?>/g, '\n');

    // Strip remaining tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = md;
    md = tempDiv.textContent || tempDiv.innerText || '';

    downloadFile(md, `${filename}.md`, 'text/markdown');
};

const downloadFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
};
