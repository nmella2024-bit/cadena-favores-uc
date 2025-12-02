import React, { useState, useRef } from 'react';
import { generateStudyMaterial } from './aiService';
import { extractTextFromFile } from './contextProcessor';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const AutoStudyWidget = (props) => {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState('Resumen');
    const [contextFiles, setContextFiles] = useState([]);
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processingFiles, setProcessingFiles] = useState(false);
    const contentRef = useRef(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setProcessingFiles(true);
        setError('');

        try {
            const processedFiles = await Promise.all(
                files.map(async (file) => {
                    try {
                        const text = await extractTextFromFile(file);
                        return { name: file.name, text };
                    } catch (err) {
                        console.error(`Error processing ${file.name}:`, err);
                        return { name: file.name, error: 'Error reading file' };
                    }
                })
            );

            setContextFiles((prev) => [...prev, ...processedFiles]);
        } catch (err) {
            setError('Error processing files.');
        } finally {
            setProcessingFiles(false);
        }
    };

    const removeFile = (index) => {
        setContextFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!topic) {
            setError('Por favor ingresa un tema.');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedContent('');

        try {
            // Combine context from all valid files
            const combinedContext = contextFiles
                .filter(f => !f.error)
                .map(f => `--- Documento: ${f.name} ---\n${f.text}`)
                .join('\n\n');

            const content = await generateStudyMaterial(topic, style, combinedContext);
            setGeneratedContent(content);
        } catch (err) {
            setError(err.message || 'Error al generar el documento.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (!contentRef.current) return;

        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

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

            pdf.save(`Estudio_${topic.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            setError('Error al exportar PDF.');
        }
    };

    const handleExportTXT = () => {
        if (!contentRef.current) return;

        // Simple HTML to Text conversion
        const text = contentRef.current.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estudio_${topic.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Auto Study Docs</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">BETA</span>
                    </div>
                    <button
                        onClick={props.onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tema de estudio
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Ej: Cálculo Integral, Historia de Chile..."
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Estilo del documento
                                </label>
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Resumen">Resumen</option>
                                    <option value="Apuntes">Apuntes (Bullet points)</option>
                                    <option value="Guía de estudio">Guía de estudio (Preguntas y respuestas)</option>
                                    <option value="Explicación detallada">Explicación detallada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contexto (Opcional)
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Sube archivos PDF, TXT o MD para usarlos como base.
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.txt,.md,.json"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-gray-700 dark:file:text-gray-300
                  "
                                    disabled={processingFiles}
                                />
                                {processingFiles && <p className="text-xs text-blue-500 mt-1">Procesando archivos...</p>}

                                {contextFiles.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {contextFiles.map((file, index) => (
                                            <li key={index} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-700 p-1.5 rounded">
                                                <span className="truncate max-w-[200px] text-gray-700 dark:text-gray-300">{file.name}</span>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || processingFiles || !topic}
                                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                  ${loading || processingFiles || !topic
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transform hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generando...
                                    </span>
                                ) : '✨ Generar Documento'}
                            </button>

                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Preview */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[400px] flex flex-col">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-lg">
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Vista Previa</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleExportTXT}
                                        disabled={!generatedContent}
                                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                    >
                                        TXT
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        disabled={!generatedContent}
                                        className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded disabled:opacity-50"
                                    >
                                        PDF
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                                {generatedContent ? (
                                    <div
                                        ref={contentRef}
                                        className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <p className="text-sm">El documento generado aparecerá aquí</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoStudyWidget;
