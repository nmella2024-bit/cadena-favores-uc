/**
 * AI Service for "Cadena de Favores UC"
 * Calls the backend API (/api/ai) to generate content.
 */

/**
 * Generates study material using OpenAI.
 * @param {string} topic - The main topic to study.
 * @param {string} style - The desired style.
 * @param {string} contextText - Content from existing documents.
 * @returns {Promise<string>} - The generated HTML content.
 */
export const generateStudyMaterial = async (topic, style, contextText = '') => {
    const systemPrompt = `
    Eres un asistente educativo experto de la Pontificia Universidad Católica de Chile.
    Tu misión es generar material de estudio de alta calidad para estudiantes universitarios.
    
    Debes generar el contenido en formato HTML limpio y bien estructurado (sin tags <html>, <head> o <body>, solo el contenido dentro del body).
    Usa clases de Tailwind CSS para dar estilo si es necesario, pero manténlo simple y legible.
    
    Estilo solicitado: ${style}
    Tema: ${topic}
    
    ${contextText ? `Usa el siguiente contenido como contexto base:\n${contextText.substring(0, 15000)}` : ''}
    
    IMPORTANTE: Responde ÚNICAMENTE con el código HTML del contenido. No incluyas markdown.
    Usa <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.
    `;

    return await callOpenAI(systemPrompt, false);
};

/**
 * Generic function to ask the AI a question (for Chat mode).
 */
export const askAI = async (question, context = '') => {
    const systemPrompt = `
    Eres un asistente inteligente de la plataforma "Cadena de Favores UC".
    Tu objetivo es ayudar a los estudiantes a encontrar material de estudio y responder dudas.
    
    Pregunta del usuario: ${question}
    
    ${context ? `Información de contexto:\n${context}` : ''}
    
    Instrucciones:
    1. Sé amable, conciso y útil.
    2. Responde en texto plano.
    `;

    return await callOpenAI(systemPrompt, true);
};

/**
 * Helper to call the AI API.
 * Hybrid Strategy:
 * - Development: Uses local proxy (/openai-api) + VITE_OPENAI_API_KEY.
 * - Production: Uses backend route (/api/ai) + Server-side Key.
 */
const callOpenAI = async (prompt, isChat = false) => {
    const isDev = import.meta.env.DEV;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    try {
        let response;

        if (isDev) {
            // --- DEVELOPMENT MODE ---
            // Call OpenAI via Vite Proxy to avoid CORS locally
            if (!apiKey) throw new Error("Falta VITE_OPENAI_API_KEY en .env para modo local.");

            response = await fetch('/openai-api/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: isChat ? "Eres un asistente útil." : "Eres un generador de contenido HTML." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: isChat ? 500 : 2000
                })
            });
        } else {
            // --- PRODUCTION MODE ---
            // Call Backend API (Secure, No Key exposed)
            response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, isChat })
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();
        // Handle different response structures (Direct OpenAI vs Backend Wrapper)
        let content = isDev ? data.choices[0].message.content : data.content;

        return content.replace(/```html/g, '').replace(/```/g, '').trim();

    } catch (error) {
        console.error("AI Request Failed:", error);
        const msg = isDev ? `(Local Mode): ${error.message}` : `(Server Mode): ${error.message}`;

        if (isChat) return `⚠️ **Error de Conexión**: ${msg}`;

        const topicMatch = prompt.match(/Tema: (.+)/);
        const topic = topicMatch ? topicMatch[1] : 'Tu Tema';
        return getFallbackTemplate(topic, msg);
    }
};

const getFallbackTemplate = (topic, errorDetails = '') => {
    return `
        <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p class="text-sm text-red-700">
                <strong>Error de Generación:</strong> No pudimos conectar con OpenAI.
                <br/>
                <span class="text-xs opacity-75">Detalle: ${errorDetails}</span>
            </p>
        </div>

        <h2>Guía de Estudio: ${topic}</h2>
        <p>Esta es una plantilla generada automáticamente porque falló la conexión con la IA.</p>
        
        <h3>1. Introducción</h3>
        <p>Define aquí los conceptos básicos de <strong>${topic}</strong>.</p>
        
        <h3>2. Conceptos Clave</h3>
        <ul>
            <li>Concepto 1...</li>
            <li>Concepto 2...</li>
        </ul>
    `;
};
