/**
 * Generates study material using Pollinations.ai (Free, No Key).
 * @param {string} topic - The main topic to study.
 * @param {string} style - The desired style (e.g., 'Resumen', 'Apuntes', 'Guía de estudio').
 * @param {string} contextText - Content from existing documents to use as context.
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
    
    ${contextText ? `Usa el siguiente contenido como contexto base (ignora si es irrelevante):\n${contextText.substring(0, 5000)}` : ''}
    
    IMPORTANTE: Responde ÚNICAMENTE con el código HTML del contenido. No incluyas markdown (como \`\`\`html) ni texto introductorio.
    Usa <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.
  `;

    try {
        // Pollinations.ai text API: GET https://text.pollinations.ai/{prompt}
        // We need to encode the prompt properly.
        // Note: Pollinations might have length limits, so we truncate context if needed.

        const prompt = encodeURIComponent(systemPrompt);
        const response = await fetch(`https://text.pollinations.ai/${prompt}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        let text = await response.text();

        // Clean up potential markdown code blocks if the AI adds them
        text = text.replace(/```html/g, '').replace(/```/g, '');

        return text;
    } catch (error) {
        console.error('Error generating study material:', error);
        throw new Error('Error al conectar con el servicio de IA gratuito. Intenta nuevamente.');
    }
};
