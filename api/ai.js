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
        const chatSystemPrompt = "Eres un asistente útil y amable de la plataforma Cadena de Favores UC. Ayudas a estudiantes con sus dudas académicas. Responde de forma concisa y clara.";

        const docSystemPrompt = `
          Eres un experto en diseño de material educativo. Tu objetivo es crear documentos de estudio visualmente atractivos y altamente estructurados.
          
          INSTRUCCIONES DE FORMATO:
          1. Responde ÚNICAMENTE con código HTML válido (sin etiquetas <html>, <head>, <body>).
          2. Usa clases de Tailwind CSS para dar estilo.
          3. Usa colores suaves para fondos (bg-blue-50, bg-green-50) y bordes (border-l-4).
          4. Estructura el contenido con:
             - <h1 class="text-3xl font-bold text-blue-800 mb-6">Título</h1>
             - <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3 border-b pb-2">Subtítulo</h2>
             - <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 my-4">...</div> para conceptos clave.
             - <ul class="list-disc pl-5 space-y-2">...</ul> para listas.
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
