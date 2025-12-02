import OpenAI from 'openai';

// Initialize OpenAI client
// NOTE: In a production environment, this should be done in a backend function to hide the API key.
// For this feature implementation within the frontend structure, we use the env variable directly.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai = null;

if (apiKey) {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
}

/**
 * Generates study material based on topic, style, and context.
 * @param {string} topic - The main topic to study.
 * @param {string} style - The desired style (e.g., 'Resumen', 'Apuntes', 'Guía de estudio').
 * @param {string} contextText - Content from existing documents to use as context.
 * @returns {Promise<string>} - The generated HTML content.
 */
export const generateStudyMaterial = async (topic, style, contextText = '') => {
    if (!openai) {
        throw new Error('OpenAI API Key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }

    const systemPrompt = `
    Eres un asistente educativo experto de la Pontificia Universidad Católica de Chile.
    Tu misión es generar material de estudio de alta calidad para estudiantes universitarios.
    
    Debes generar el contenido en formato HTML limpio y bien estructurado (sin tags <html>, <head> o <body>, solo el contenido).
    Usa clases de Tailwind CSS para dar estilo si es necesario, pero manténlo simple y legible.
    
    Estilos disponibles:
    - Resumen: Condensa la información clave.
    - Apuntes: Punteo detallado de conceptos.
    - Guía de estudio: Preguntas y respuestas, ejercicios o conceptos clave para repasar.
    - Explicación detallada: Desarrollo profundo del tema.
  `;

    const userPrompt = `
    Genera un documento de estudio sobre el tema: "${topic}".
    Estilo solicitado: "${style}".
    
    ${contextText ? `Usa el siguiente contenido como contexto base para la generación:\n\n${contextText.substring(0, 15000)}... (truncado si es muy largo)` : 'No se proporcionó contexto adicional, usa tu conocimiento general.'}
    
    El formato de salida debe ser HTML listo para renderizar dentro de un div.
    Usa <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.
  `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'gpt-4o', // Or gpt-3.5-turbo if 4o is not available/too expensive
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error generating study material:', error);
        throw new Error('Failed to generate study material. Please try again later or check your API key.');
    }
};
