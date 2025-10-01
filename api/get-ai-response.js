// api/get-ai-response.js

export default async function handler(request, response) {
  // Securely get the Gemini API key from environment variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = request.body;

  if (!query) {
    return response.status(400).json({ error: 'Query is required' });
  }

  if (!GEMINI_API_KEY) {
    return response.status(500).json({ error: 'Oops! The admin forgot to configure the Gemini API key on the server.' });
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are Nexus AI, a helpful search assistant. Provide a concise and informative summary for the following query: "${query}"`
        }]
      }]
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Google Gemini API Error: ${errorData.error.message}`);
    }

    const data = await geminiResponse.json();
    
    // Extract the text from Gemini's response structure
    const aiMessage = data.candidates[0].content.parts[0].text;

    return response.status(200).json({ message: aiMessage });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}