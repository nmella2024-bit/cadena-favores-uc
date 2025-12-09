export const config = {
    runtime: 'edge',
};

export async function POST(req) {
    try {
        const { prompt, isChat } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'Missing API key in environment' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: isChat
                            ? "Eres un asistente útil de la plataforma Cadena de Favores UC."
                            : "Responde SOLO con HTML limpio (h2, h3, p, ul)."
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await upstream.json();

        return new Response(
            JSON.stringify({ content: data.choices?.[0]?.message?.content }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
