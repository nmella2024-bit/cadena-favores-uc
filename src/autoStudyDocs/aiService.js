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

    try {
        return await callPollinationsAI(systemPrompt);
    } catch (error) {
        console.error('All AI attempts failed:', error);
        throw new Error('No se pudo conectar con el servicio de IA. Por favor, intenta reducir el contexto o prueba más tarde.');
    }
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

    try {
        return await callPollinationsAI(systemPrompt);
    } catch (error) {
        console.error('Chat AI failed:', error);
        throw new Error('Error al conectar con el chat de IA.');
    }
};

/**
 * Helper to call Pollinations API with fallback.
 */
const callPollinationsAI = async (prompt) => {
    let lastError = null;

    // Attempt 1: POST to /openai endpoint (Best for structured JSON)
    try {
        console.log('Attempting AI request via POST (openai endpoint)...');
        const response = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                model: 'openai',
                seed: 42
            })
        });

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        const errText = await response.text();
        console.warn(`POST failed with status ${response.status}: ${errText}`);
        lastError = `POST Error: ${response.status} ${errText}`;
    } catch (e) {
        console.warn('POST request failed:', e);
        lastError = `POST Network Error: ${e.message}`;
    }

    // Attempt 2: GET (Fallback, limited length)
    try {
        console.log('Attempting AI request via GET (Fallback)...');
        // Truncate prompt to ~1500 chars to be safe for URL length
        // We use the root endpoint for GET as it handles raw text better
        const safePrompt = encodeURIComponent(prompt.substring(0, 1500));
        const response = await fetch(`https://text.pollinations.ai/${safePrompt}?model=openai&seed=42`);

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        const errText = await response.text();
        lastError = `GET Error: ${response.status} ${errText} (Prev: ${lastError})`;
    } catch (e) {
        console.error('GET fallback failed:', e);
        lastError = `GET Network Error: ${e.message} (Prev: ${lastError})`;
    }

    throw new Error(`Service unavailable. Details: ${lastError}`);
};

const cleanResponse = (text) => {
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
};
