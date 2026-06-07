export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { systemInstruction, userMessage } = req.body;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    const models = [
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
      'gemma-3-27b-it'
    ];

    let text = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemInstruction}\n\n${userMessage}`
                }]
              }]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) break;
        }
      } catch (modelError) {
        console.error(`Model ${model} failed:`, modelError);
        continue;
      }
    }

    return res.status(200).json({
      text: text || "No response generated."
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      error: 'Function error',
      text: 'Something went wrong. Please try again.'
    });
  }
}
