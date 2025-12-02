import React, { useRef } from 'react';
import { Download, FileText, FileCode, FileType } from 'lucide-react';
import { exportToPDF, exportToTXT, exportToMD } from '../utils/exportUtils';

const DocumentPreview = ({ content, title }) => {
    const previewRef = useRef(null);

    if (!content) return null;

    return (
        <div className="mt-8 border-t border-border pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                <h3 className="text-xl font-semibold text-text-primary">Vista Previa</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportToPDF(previewRef.current, title)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
                        title="Exportar como PDF"
                    >
                        <FileType className="w-4 h-4" /> PDF
                    </button>
                    <button
                        onClick={() => exportToMD(content, title)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors"
                        title="Exportar como Markdown"
                    >
                        <FileCode className="w-4 h-4" /> MD
                    </button>
                    <button
                        onClick={() => exportToTXT(content, title)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 rounded-lg text-sm font-medium transition-colors"
                        title="Exportar como Texto"
                    >
                        <FileText className="w-4 h-4" /> TXT
                    </button>
                </div>
            </div>

            <div className="bg-white text-black p-8 rounded-xl shadow-sm min-h-[500px] overflow-auto border border-border">
                <div
                    ref={previewRef}
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </div>
    );
};

export default DocumentPreview;
