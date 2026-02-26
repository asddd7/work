import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

export async function getAIResponse(messages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "z-ai/glm-4.5-air:free",
      messages
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "...";
}