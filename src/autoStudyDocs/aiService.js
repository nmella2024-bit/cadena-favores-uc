/**
 * Generates study material using Pollinations.ai (Free, No Key).
 * @param {string} topic - The main topic to study.
 * @param {string} style - The desired style (e.g., 'Resumen', 'Apuntes', 'Guía de estudio').
 * @param {string} contextText - Content from existing documents to use as context.
 * @returns {Promise<string>} - The generated HTML content.
 */
/**
 * Generates study material using Pollinations.ai (Free, No Key).
 * Uses a fallback strategy: POST (full context) -> GET (truncated context).
 */
export const generateStudyMaterial = async (topic, style, contextText = '') => {
    const systemPrompt = `
    Eres un asistente educativo experto de la Pontificia Universidad Católica de Chile.
    Tu misión es generar material de estudio de alta calidad para estudiantes universitarios.
    
    Debes generar el contenido en formato HTML limpio y bien estructurado (sin tags <html>, <head> o <body>, solo el contenido dentro del body).
    Usa clases de Tailwind CSS para dar estilo si es necesario, pero manténlo simple y legible.
    
    Estilo solicitado: ${style}
    Tema: ${topic}
    
    ${contextText ? `Usa el siguiente contenido como contexto base (ignora si es irrelevante):\n${contextText.substring(0, 20000)}` : ''}
    
    IMPORTANTE: Responde ÚNICAMENTE con el código HTML del contenido. No incluyas markdown (como \`\`\`html) ni texto introductorio.
    Usa <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.
  `;

    // Direct call to propagate specific errors from callPollinationsAI
    return await callPollinationsAI(systemPrompt);
};

/**
 * Generic function to ask the AI a question (for Chat mode).
 */
export const askAI = async (question, context = '') => {
    const systemPrompt = `
    Eres un asistente inteligente de la plataforma "Cadena de Favores UC".
    Tu objetivo es ayudar a los estudiantes a encontrar material de estudio y responder dudas.
    
    Pregunta del usuario: ${question}
    
    ${context ? `Información de contexto (Materiales encontrados):\n${context}` : ''}
    
    Instrucciones:
    1. Si el contexto contiene la respuesta (ej: ubicación de un archivo), indícalo claramente.
    2. Si no tienes la información, sé honesto.
    3. Sé amable y conciso.
    4. Responde en texto plano (puedes usar markdown simple).
    `;

    // Direct call to propagate specific errors
    return await callPollinationsAI(systemPrompt);
};

/**
 * Helper to call AI APIs with robust fallback strategy.
 * Strategy: Local Proxy GET (Pollinations) -> Hercai API (Backup) -> Direct GET (Pollinations).
 */
/**
 * Helper to call AI APIs with robust fallback strategy.
 * Strategy: GET (Optimized) -> Template Fallback.
 * Note: POST is not supported by the free provider (returns 405).
 */
const callPollinationsAI = async (prompt) => {
    const models = ['openai', 'mistral', 'llama'];
    let lastError = null;

    // 1. Try GET Request (Concatenated Prompt)
    for (const model of models) {
        try {
            console.log(`Attempting AI request (${model}) via GET...`);

            // Construct a single prompt string since GET doesn't support messages array
            // We strip the context to keep it short and reliable
            const corePrompt = `Actúa como profesor experto. Crea una guía de estudio sobre: ${prompt.substring(0, 100)}. Usa formato HTML (h2, h3, ul, p). Sé breve y directo.`;
            const safePrompt = encodeURIComponent(corePrompt);

            // Use the original /api/ai proxy
            const response = await fetch(`/api/ai/${safePrompt}?model=${model}&seed=${Math.floor(Math.random() * 1000)}`);

            if (response.ok) {
                const text = await response.text();
                if (isValidResponse(text)) return cleanResponse(text);
            }

            console.warn(`GET (${model}) failed: ${response.status}`);
            lastError = `GET (${model}) Error: ${response.status}`;
        } catch (e) {
            console.warn(`GET (${model}) failed:`, e);
            lastError = `GET (${model}) Network Error: ${e.message}`;
        }
    }

    // 2. Template Fallback (Last Resort)
    console.warn("All AI attempts failed. Switching to Template Fallback.");

    const topicMatch = prompt.match(/Tema: (.+)/);
    const topic = topicMatch ? topicMatch[1] : 'Tu Tema de Estudio';

    return `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p class="text-sm text-yellow-700">
                <strong>Nota:</strong> La IA está saturada (Error 405/Connection). Usando guía base.
                <br/>
                <span class="text-xs opacity-75">Último error: ${lastError}</span>
            </p>
        </div>

        <h2>Guía de Estudio: ${topic}</h2>
        
        <h3>1. Introducción</h3>
        <p>Comienza definiendo <strong>${topic}</strong>. Es fundamental entender el "qué" y el "por qué" antes de profundizar.</p>
        
        <h3>2. Conceptos Clave</h3>
        <ul>
            <li><strong>Concepto 1:</strong> [Rellena aquí]</li>
            <li><strong>Concepto 2:</strong> [Rellena aquí]</li>
            <li><strong>Concepto 3:</strong> [Rellena aquí]</li>
        </ul>
        
        <h3>3. Desarrollo del Tema</h3>
        <p>Utiliza esta sección para explicar los detalles técnicos, fórmulas o fechas importantes relacionadas con ${topic}.</p>
        
        <h3>4. Preguntas de Auto-evaluación</h3>
        <ul>
            <li>¿Cuál es la importancia de ${topic} en el contexto general?</li>
            <li>¿Podrías explicar ${topic} a alguien que no sabe nada del tema?</li>
        </ul>
    `;
};

const isValidResponse = (text) => {
    if (!text || text.length < 20) return false;
    if (text.includes('NexU') || text.includes('Error') || text.includes('404') || text.includes('405')) return false;
    return true;
};

const cleanResponse = (text) => {
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
};
