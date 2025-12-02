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
 * Helper to call Pollinations API with robust fallback strategy.
 * Strategy: POST JSON -> POST Plain Text -> GET (Truncated) -> GET via Proxy (CORS Bypass).
 */
const callPollinationsAI = async (prompt) => {
    let lastError = null;

    // Attempt 1: POST to /openai endpoint (Best for structured JSON)
    try {
        console.log('Attempting AI request via POST (JSON)...');
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
        console.warn(`POST JSON failed: ${response.status} ${errText}`);
        lastError = `POST JSON Error: ${response.status}`;
    } catch (e) {
        console.warn('POST JSON failed:', e);
        lastError = `POST JSON Network Error: ${e.message}`;
    }

    // Attempt 2: POST Plain Text to root (Fallback for JSON issues)
    try {
        console.log('Attempting AI request via POST (Plain Text)...');
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: prompt
        });

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        console.warn(`POST Text failed: ${response.status}`);
        lastError += ` | POST Text Error: ${response.status}`;
    } catch (e) {
        console.warn('POST Text failed:', e);
        lastError += ` | POST Text Network Error: ${e.message}`;
    }

    // Attempt 3: GET (Last Resort, heavily truncated)
    try {
        console.log('Attempting AI request via GET (Last Resort)...');
        const safePrompt = encodeURIComponent(prompt.substring(0, 800));
        const response = await fetch(`https://text.pollinations.ai/${safePrompt}?model=openai&seed=42`);

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        const errText = await response.text();
        lastError += ` | GET Error: ${response.status} ${errText}`;
    } catch (e) {
        console.error('GET fallback failed:', e);
        lastError += ` | GET Network Error: ${e.message}`;
    }

    // Attempt 4: GET via CORS Proxy (Ultimate Fallback for "Load failed")
    try {
        console.log('Attempting AI request via CORS Proxy...');
        const safePrompt = encodeURIComponent(prompt.substring(0, 800));
        const targetUrl = `https://text.pollinations.ai/${safePrompt}?model=openai&seed=42`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);

        if (response.ok) {
            let text = await response.text();
            return cleanResponse(text);
        }
        lastError += ` | Proxy Error: ${response.status}`;
    } catch (e) {
        console.error('Proxy fallback failed:', e);
        lastError += ` | Proxy Network Error: ${e.message}`;
    }

    throw new Error(`No se pudo conectar con la IA (Gratis). Posible bloqueo de red o CORS. Detalles: ${lastError}`);
};

const cleanResponse = (text) => {
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
};
