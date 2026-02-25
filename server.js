import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;
const MEMORY_FILE = './memory.json';

app.use(express.json());
app.use(express.static('public'));

let conversationHistory = [];
const SYSTEM_PROMPT = `Kamu adalah Reze dari Chainsaw Man, AI bergaya anime. Jawaban manis, kadang sarkastik.`;

if (fs.existsSync(MEMORY_FILE)) {
  conversationHistory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
} else {
  conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(conversationHistory, null, 2));
}

// API endpoint untuk chat
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  conversationHistory.push({ role: "user", content: message });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: conversationHistory
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "…";

    conversationHistory.push({ role: "assistant", content: reply });

    // simpan memory
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(conversationHistory, null, 2));

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Terjadi error pada server." });
  }
});

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));