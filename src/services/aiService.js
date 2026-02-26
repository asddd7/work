import fetch from 'node-fetch';
import 'dotenv/config';

const API_KEY = process.env.OPENROUTER_API_KEY;

export async function getAIResponse(messages) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenRouter API Error:', res.status, errorText);
      return "Maaf, AI gagal merespon (API error).";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Maaf, AI gagal merespon.";
  } catch (e) {
    console.error('Request failed:', e);
    return "Maaf, AI gagal merespon (request error).";
  }
}