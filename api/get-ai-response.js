// api/get-ai-response.js

export default async function handler(request, response) {
  // Securely retrieve the OpenAI API key from environment variables, set on the Vercel website.
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = request.body;

  if (!query) {
    return response.status(400).json({ error: 'Query is required' });
  }

  if (!OPENAI_API_KEY) {
    return response.status(500).json({ error: 'Oops! The administrator forgot to configure the AI API key on the server.' });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are Nexus AI, a helpful search assistant integrated into a search engine. Provide a concise, informative, and well-structured summary based on the user query. Format your response using Markdown for readability (e.g., use headings, lists, bold text).'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        throw new Error(`OpenAI API Error: ${errorData.error.message}`);
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices[0].message.content;

    return response.status(200).json({ message: aiMessage });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}