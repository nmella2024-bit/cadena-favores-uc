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
const callPollinationsAI = async (prompt) => {
    let lastError = null;

    // Attempt 1: Local Vite Proxy via GET (Avoids POST 405 & CORS)
    try {
        console.log('Attempting AI request via Local Proxy (GET)...');
        // Truncate to 1500 chars to be safe for URL length
        const safePrompt = encodeURIComponent(prompt.substring(0, 1500));
        const response = await fetch(`/api/ai/${safePrompt}?model=openai&seed=42`);

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        console.warn(`Local Proxy GET failed: ${response.status}`);
        lastError = `Local Proxy GET Error: ${response.status}`;
    } catch (e) {
        console.warn('Local Proxy GET failed:', e);
        lastError = `Local Proxy GET Network Error: ${e.message}`;
    }

    // Attempt 2: Hercai API (Free Backup Provider)
    try {
        console.log('Attempting AI request via Hercai (Backup)...');
        const safePrompt = encodeURIComponent(prompt.substring(0, 1000));
        const response = await fetch(`https://hercai.zaid.one/v2/hercai?question=${safePrompt}`);

        if (response.ok) {
            const data = await response.json();
            if (data && data.reply) {
                return cleanResponse(data.reply);
            }
        }
        console.warn(`Hercai failed: ${response.status}`);
        lastError += ` | Hercai Error: ${response.status}`;
    } catch (e) {
        console.warn('Hercai failed:', e);
        lastError += ` | Hercai Network Error: ${e.message}`;
    }

    // Attempt 3: Direct GET to Pollinations (Last Resort)
    try {
        console.log('Attempting AI request via Direct GET (Last Resort)...');
        const safePrompt = encodeURIComponent(prompt.substring(0, 800));
        const response = await fetch(`https://text.pollinations.ai/${safePrompt}?model=openai&seed=42`);

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        const errText = await response.text();
        lastError += ` | Direct GET Error: ${response.status} ${errText}`;
    } catch (e) {
        console.error('Direct GET fallback failed:', e);
        lastError += ` | Direct GET Network Error: ${e.message}`;
    }

    throw new Error(`No se pudo conectar con ninguna IA (Gratis). Verifica tu conexión a internet. Detalles: ${lastError}`);
};

const cleanResponse = (text) => {
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
};
