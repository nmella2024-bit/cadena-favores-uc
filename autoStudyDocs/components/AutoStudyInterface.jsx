import React, { useState } from 'react';
import { Sparkles, Upload, FileText, Loader2, Settings } from 'lucide-react';
import { generateDocument } from '../services/generator';
import { extractTextFromFile } from '../services/contextLoader';
import { getApiKey, setApiKey } from '../config';
import DocumentPreview from './DocumentPreview';

const AutoStudyInterface = ({ onClose }) => {
    const [apiKey, setApiKeyValue] = useState(getApiKey());
    const [showSettings, setShowSettings] = useState(!getApiKey());

    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        style: 'apuntes'
    });
    const [contextFiles, setContextFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setContextFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setContextFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!apiKey) {
                throw new Error('Por favor configura tu API Key primero.');
            }

            // 1. Extract context
            let fullContext = '';
            for (const file of contextFiles) {
                try {
                    const text = await extractTextFromFile(file);
                    fullContext += `\n--- Archivo: ${file.name} ---\n${text}\n`;
                } catch (err) {
                    console.warn(`No se pudo leer ${file.name}:`, err);
                }
            }

            // 2. Generate
            const content = await generateDocument({
                title: formData.title,
                topic: formData.topic,
                style: formData.style,
                context: fullContext
            });

            setGeneratedContent(content);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveApiKey = () => {
        setApiKey(apiKey);
        setShowSettings(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand/10 rounded-lg">
                            <Sparkles className="w-6 h-6 text-brand" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Auto Study Docs</h2>
                            <p className="text-sm text-text-muted">Genera material de estudio con IA</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-text-muted hover:text-text-primary"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="mb-6 p-4 bg-accent/50 rounded-xl border border-border">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Configuración
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    placeholder="OpenAI API Key (sk-...)"
                                    value={apiKey}
                                    onChange={(e) => setApiKeyValue(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-brand/20 outline-none"
                                />
                                <button
                                    onClick={saveApiKey}
                                    className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                Tu API Key se guarda localmente en tu navegador.
                            </p>
                        </div>
                    )}

                    {/* Main Form */}
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">Título del Documento</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-brand/20 outline-none"
                                        placeholder="Ej: Resumen de Cálculo I"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">Temas Específicos</label>
                                    <textarea
                                        required
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-brand/20 outline-none h-24 resize-none"
                                        placeholder="Ej: Derivadas, Integrales, Límites..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">Estilo</label>
                                    <select
                                        value={formData.style}
                                        onChange={e => setFormData({ ...formData, style: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-brand/20 outline-none"
                                    >
                                        <option value="apuntes">📝 Apuntes de Clase</option>
                                        <option value="resumen">✂️ Resumen Ejecutivo</option>
                                        <option value="guia">📚 Guía de Estudio</option>
                                        <option value="explicacion">💡 Explicación Detallada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">Contexto (Opcional)</label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-accent/30 transition-colors relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.txt,.md"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                                        <p className="text-sm text-text-muted">
                                            Arrastra archivos o haz clic para subir
                                        </p>
                                        <p className="text-xs text-text-muted/70 mt-1">
                                            Soporta PDF, TXT, MD
                                        </p>
                                    </div>
                                </div>

                                {contextFiles.length > 0 && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {contextFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-accent/30 rounded-lg border border-border">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                                                    <span className="text-sm truncate">{file.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-hover transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generando documento...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generar Documento
                                </>
                            )}
                        </button>
                    </form>

                    {/* Preview Section */}
                    <DocumentPreview content={generatedContent} title={formData.title} />
                </div>
            </div>
        </div>
    );
};

export default AutoStudyInterface;
