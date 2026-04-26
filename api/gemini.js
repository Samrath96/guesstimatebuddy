export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { systemInstruction, userMessage } = req.body;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemInstruction}\n\n${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    // ✅ Proper error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API ERROR:", errorText);
      return res.status(500).json({ error: errorText });
    }

    const data = await response.json();

    console.log("FULL GEMINI RESPONSE:", JSON.stringify(data));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      text: text || "No response generated."
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      error: 'Function error',
      text: 'Something went wrong.'
    });
  }
}
