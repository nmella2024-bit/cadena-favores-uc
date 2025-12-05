export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { prompt, isChat, mode, config } = await req.json();
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
          
          INSTRUCCIONES DE DISEÑO (ULTRA PREMIUM):
          1. Responde SOLO con HTML.
          2. INCLUYE este bloque de estilo al inicio:
             <style>
               @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
               .doc-container { font-family: 'Inter', sans-serif; color: #374151; line-height: 1.7; max-width: 100%; }
               
               /* Header */
               .doc-header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #e5e7eb; }
               .doc-tag { display: inline-block; background: #eff6ff; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 1rem; }
               .doc-title { font-size: 2.5rem; font-weight: 800; color: #111827; letter-spacing: -0.025em; margin: 0; line-height: 1.2; background: linear-gradient(to right, #111827, #4b5563); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
               
               /* Sections */
               .doc-section { margin-bottom: 2.5rem; }
               .doc-h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
               .doc-h2::before { content: ''; display: block; width: 6px; height: 24px; background: #3b82f6; border-radius: 3px; }
               
               /* Cards & Highlights */
               .doc-card { background: #ffffff; border: 1px solid #f3f4f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02); margin-bottom: 1.5rem; transition: transform 0.2s; }
               .doc-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
               
               .doc-highlight { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 1.25rem; color: #0369a1; margin: 1.5rem 0; display: flex; gap: 1rem; align-items: start; }
               .doc-highlight-icon { font-size: 1.25rem; }
               
               /* Lists */
               .doc-list { list-style: none; padding: 0; margin: 1rem 0; }
               .doc-list li { padding: 0.75rem 0; border-bottom: 1px solid #f9fafb; display: flex; gap: 0.75rem; color: #4b5563; }
               .doc-list li:last-child { border-bottom: none; }
               .doc-check { color: #10b981; font-weight: bold; }
             </style>

          3. ESTRUCTURA REQUERIDA:
             <div class="doc-container">
               <div class="doc-header">
                 <span class="doc-tag">Guía de Estudio</span>
                 <h1 class="doc-title">TÍTULO DEL TEMA</h1>
               </div>
               
               <div class="doc-section">
                 <h2 class="doc-h2">Introducción</h2>
                 <p>...</p>
               </div>

               <div class="doc-section">
                 <h2 class="doc-h2">Conceptos Fundamentales</h2>
                 <div class="doc-card">
                   <h3 class="font-bold text-gray-900 mb-2">Concepto 1</h3>
                   <p class="text-gray-600">...</p>
                 </div>
                 
                 <div class="doc-highlight">
                   <span class="doc-highlight-icon">💡</span>
                   <div><strong>Nota Importante:</strong> ...</div>
                 </div>
               </div>
             </div>
        `;

    const quizSystemPrompt = `
            Eres un profesor experto creando evaluaciones. Tu objetivo es generar un Quiz de estudio desafiante y educativo.
            
            CONFIGURACIÓN:
            - Cantidad de preguntas: ${config?.numQuestions || 5}
            - Tipo de preguntas: ${config?.questionType || 'multiple-choice'} (multiple-choice, open, mixed)
            - Dificultad: ${config?.difficulty || 'Intermedio'} (Principiante, Intermedio, Avanzado)

            INSTRUCCIONES:
            1. Analiza el tema o contexto proporcionado.
            2. Genera las preguntas según la configuración.
            3. Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
            {
              "questions": [
                {
                  "type": "multiple-choice" | "open",
                  "question": "¿Pregunta?",
                  "unit": "Unidad General (ej: Cálculo, Álgebra, Historia)", // OBLIGATORIO: Clasificación general
                  "subtopic": "Sub-tema específico (ej: Límites Notables)", // OBLIGATORIO
                  // Solo para multiple-choice:
                  "options": ["Opción A", "Opción B", "Opción C", "Opción D"], // OBLIGATORIO: Siempre 4 opciones. NUNCA DEJAR VACÍO.
                  "correctIndex": 0, 
                  // Para ambos tipos:
                  "explanation": "Explicación detallada de la respuesta correcta."
                }
              ]
            }
            4. IMPORTANTE: Si el tipo es "multiple-choice" o "mixed", el array "options" DEBE tener 4 strings. Si no se te ocurren, inventa opciones plausibles. NUNCA devuelvas "options": [] o null.
            5. NO incluyas markdown (\`\`\`). Solo el JSON raw.
        `;

    const gradeSystemPrompt = `
        Eres un profesor experto corrigiendo exámenes. Tu objetivo es evaluar la respuesta de un estudiante a una pregunta de desarrollo.

        INSTRUCCIONES:
        1. Analiza la pregunta y la respuesta del usuario.
        2. Evalúa la precisión, completitud y claridad.
        3. Responde ÚNICAMENTE con un JSON válido con esta estructura:
        {
            "score": 0-100, // Puntaje numérico
            "feedback": {
                "good": "Lo que el estudiante hizo bien.",
                "bad": "Lo que faltó o fue incorrecto.",
                "improvement": "Sugerencias concretas para mejorar."
            }
        }
    `;

    let systemPrompt = docSystemPrompt;
    if (isChat) systemPrompt = chatSystemPrompt;
    if (mode === 'quiz') systemPrompt = quizSystemPrompt;
    if (mode === 'grade-open-answer') systemPrompt = gradeSystemPrompt;

    const messages = [
      {
        role: "system",
        content: systemPrompt
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
        response_format: (mode === 'quiz' || mode === 'grade-open-answer') ? { type: "json_object" } : undefined
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
