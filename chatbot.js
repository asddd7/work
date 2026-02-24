import OpenAI from "openai";
import dotenv from "dotenv";

// Load API key dari .env
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ambil dari .env
});

async function chat() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Kamu adalah asisten yang ramah." },
      { role: "user", content: "Halo chatbot!" }
    ],
  });

  console.log(response.choices[0].message.content);
}

chat();