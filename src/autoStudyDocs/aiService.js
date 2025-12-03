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
 * Strategy: Rotate through Pollinations models (OpenAI -> Mistral -> Llama) via Local Proxy and Direct GET.
 */
/**
 * Helper to call AI APIs with robust fallback strategy.
 * Strategy: Rotate through Pollinations models -> Template Fallback (Guarantees output).
 */
const callPollinationsAI = async (prompt) => {
    const models = ['openai', 'mistral', 'llama'];
    let lastError = null;

    // 1. Try AI Models
    for (const model of models) {
        try {
            console.log(`Attempting AI request (${model}) via Local Proxy...`);
            // Aggressively truncate to 500 chars to ensure URL safety and avoid 414/400 errors
            const safePrompt = encodeURIComponent(prompt.substring(0, 500));
            const response = await fetch(`/api/ai/${safePrompt}?model=${model}&seed=${Math.floor(Math.random() * 1000)}`);

            if (response.ok) {
                let text = await response.text();
                console.log(`AI Response (${model}):`, text.substring(0, 50)); // Debug log
                if (isValidResponse(text)) return cleanResponse(text);
            }
            console.warn(`Local Proxy (${model}) failed: ${response.status}`);
            lastError = `Proxy (${model}) Error: ${response.status}`;
        } catch (e) {
            console.warn(`Local Proxy (${model}) failed:`, e);
            lastError = `Proxy (${model}) Network Error: ${e.message}`;
        }
    }

    // 2. Template Fallback (Last Resort - Guarantees a document)
    console.warn("All AI attempts failed. Switching to Template Fallback.");

    // Extract topic from prompt if possible, or use a generic one
    const topicMatch = prompt.match(/Tema: (.+)/);
    const topic = topicMatch ? topicMatch[1] : 'Tu Tema de Estudio';

    return `
        <h2>Guía de Estudio: ${topic}</h2>
        <p><em>Nota: No se pudo conectar con la IA en este momento, pero aquí tienes una estructura base para comenzar a estudiar.</em></p>
        
        <h3>1. Introducción</h3>
        <p>Define aquí los conceptos básicos de <strong>${topic}</strong>. ¿Qué es y por qué es importante?</p>
        
        <h3>2. Conceptos Clave</h3>
        <ul>
            <li>Concepto fundamental 1</li>
            <li>Concepto fundamental 2</li>
            <li>Concepto fundamental 3</li>
        </ul>
        
        <h3>3. Resumen del Material</h3>
        <p>Utiliza este espacio para sintetizar la información de tus apuntes o bibliografía.</p>
        
        <h3>4. Preguntas de Repaso</h3>
        <ul>
            <li>¿Cuál es el objetivo principal de ${topic}?</li>
            <li>¿Cómo se relaciona con otros temas del curso?</li>
        </ul>
    `;
};

const isValidResponse = (text) => {
    // Check for empty, short, or garbage responses
    if (!text || text.length < 10) return false;
    if (text.includes('NexU') || text.includes('Error') || text.includes('404')) return false;
    return true;
};

const cleanResponse = (text) => {
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
};
