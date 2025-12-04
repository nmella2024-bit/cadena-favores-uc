export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { prompt, isChat } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response("Missing API key", { status: 500 });
        }

        // System Prompts
        const chatSystemPrompt = `
          Eres un asistente útil y amable de la plataforma Cadena de Favores UC. 
          Tu objetivo es ayudar a los estudiantes respondiendo sus dudas basándote en el contexto proporcionado (archivos adjuntos o búsqueda).
          Si el usuario adjunta archivos, ÚSALOS para responder. Cita el nombre del archivo si es relevante.
          Responde de forma concisa, clara y amigable.
        `;

        const docSystemPrompt = `
          Eres un experto en diseño de material educativo y UX. Tu objetivo es crear documentos de estudio visualmente impactantes, fáciles de leer y altamente estructurados.
          
          INSTRUCCIONES DE DISEÑO (PREMIUM):
          1. Responde ÚNICAMENTE con código HTML válido (sin etiquetas <html>, <head>, <body>).
          2. Usa clases de Tailwind CSS para un diseño moderno y limpio.
          3. Estructura el contenido en "Tarjetas" o secciones claras:
             - Título Principal: <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8 text-center">Título</h1>
             - Secciones: <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">...</div>
             - Subtítulos: <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span class="text-blue-500">#</span> Subtítulo</h2>
             - Conceptos Clave: <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg"><p class="font-semibold text-blue-900">Concepto Clave</p>...</div>
             - Listas: <ul class="space-y-3 my-4"> <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> <span>Item...</span></li> </ul>
          4. Si se proporciona contexto (archivos adjuntos), BASA tu contenido en ellos.
          5. NO uses Markdown (\`\`\`). Solo HTML puro.
        `;

        const messages = [
            {
                role: "system",
                content: isChat ? chatSystemPrompt : docSystemPrompt
            },
            { role: "user", content: prompt }
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
