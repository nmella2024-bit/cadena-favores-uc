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
          Eres un diseñador editorial y experto académico. Tu objetivo es transformar el contenido en una "Guía de Estudio Premium" con un diseño impecable.
          
          INSTRUCCIONES DE DISEÑO (SUPERIOR):
          1. NO uses Markdown. Responde SOLO con HTML.
          2. INCLUYE este bloque de estilo al inicio de tu respuesta:
             <style>
               @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
               .doc-container { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.6; }
               .doc-title { background: linear-gradient(135deg, #2563eb, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2.5rem; font-weight: 800; text-align: center; margin-bottom: 2rem; letter-spacing: -0.02em; }
               .doc-section { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #f3f4f6; }
               .doc-h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
               .doc-h3 { font-size: 1.1rem; font-weight: 600; color: #374151; margin-top: 1.5rem; margin-bottom: 0.5rem; }
               .doc-highlight { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 0 8px 8px 0; margin: 1rem 0; color: #1e40af; }
               .doc-list { list-style: none; padding: 0; space-y: 0.5rem; }
               .doc-list li { padding-left: 1.5rem; position: relative; margin-bottom: 0.5rem; }
               .doc-list li::before { content: "•"; color: #3b82f6; font-weight: bold; position: absolute; left: 0; }
               .doc-tag { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem; }
             </style>

          3. ESTRUCTURA TU RESPUESTA ASÍ:
             <div class="doc-container">
               <div class="text-center"><span class="doc-tag">Guía Generada por IA</span></div>
               <h1 class="doc-title">TÍTULO DEL TEMA</h1>
               
               <div class="doc-section">
                 <h2 class="doc-h2">1. Introducción</h2>
                 <p>...</p>
               </div>

               <div class="doc-section">
                 <h2 class="doc-h2">2. Conceptos Clave</h2>
                 <div class="doc-highlight">
                   <strong>Definición Importante:</strong> ...
                 </div>
               </div>
             </div>

          4. ADÁPTATE AL CONTEXTO: Si el usuario subió un PDF, usa SU estructura y SUS ejemplos. Haz que parezca que el documento original fue "remasterizado".
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
