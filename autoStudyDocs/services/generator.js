import { generateStudyContent } from './aiService';

const STYLES = {
    'apuntes': {
        role: 'Eres un estudiante de honor de la Universidad Católica. Tu tarea es crear apuntes claros, estructurados y fáciles de estudiar.',
        format: 'Usa bullet points, negritas para conceptos clave y jerarquía clara de títulos.'
    },
    'resumen': {
        role: 'Eres un experto en síntesis académica. Tu tarea es resumir el contenido manteniendo solo la información esencial.',
        format: 'Escribe párrafos concisos. Enfócate en las ideas principales y conclusiones.'
    },
    'guia': {
        role: 'Eres un profesor ayudante preparando una guía de estudio para un examen.',
        format: 'Incluye preguntas de repaso, conceptos clave a memorizar y ejercicios prácticos si aplica.'
    },
    'explicacion': {
        role: 'Eres un profesor dedicado a explicar conceptos complejos de forma sencilla.',
        format: 'Usa analogías, ejemplos prácticos y un tono didáctico. Explica paso a paso.'
    }
};

/**
 * Generate a study document
 * @param {Object} params - Parameters for generation
 * @param {string} params.title - Document title
 * @param {string} params.topic - Specific topics to cover
 * @param {string} params.style - Style key (apuntes, resumen, guia, explicacion)
 * @param {string} params.context - Context text from files
 * @returns {Promise<string>} - Generated HTML content
 */
export const generateDocument = async ({ title, topic, style, context }) => {
    const styleConfig = STYLES[style] || STYLES['apuntes'];

    const systemPrompt = `${styleConfig.role}
    
Tu objetivo es generar un documento de estudio en formato HTML limpio y moderno (sin CSS externo, usa estilos en línea simples o etiquetas semánticas).
NO incluyas etiquetas <html>, <head> o <body>, solo el contenido dentro del body.
Usa <h1> para el título principal, <h2> y <h3> para subtítulos.
${styleConfig.format}
    
Responde SOLAMENTE con el código HTML.`;

    const userPrompt = `
Título del documento: ${title}
Temas específicos a cubrir: ${topic}

Contexto (Material de estudio base):
${context ? context.substring(0, 50000) : 'Sin contexto adicional provided.'} 
(Nota: El contexto puede estar truncado si es muy largo).

Por favor genera el documento de estudio basándote en el contexto proporcionado y enfocándote en los temas solicitados.`;

    return await generateStudyContent(systemPrompt, userPrompt);
};
