export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message, type } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'API Key not configured' });

  try {
    if(type === 'image'){
      const groqResponse = await fetch("https://api.groq.com/openai/v1/images/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "flux-1-schnell", prompt: message })
      });
      const data = await groqResponse.json();
      return res.status(200).json({ reply: data.data[0].url, type: 'image' });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.1-70b-versatile", messages: [{ role: "user", content: message }] })
    });
    const data = await groqResponse.json();
    res.status(200).json({ reply: data.choices[0].message.content, type: 'text' });
  } catch (error) { res.status(500).json({ error: error.message }); }
}
