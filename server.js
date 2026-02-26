import express from "express";
import { getAIResponse } from "./src/services/aiService.js";

const router = express.Router();

// Simpel memory per user di memori server (tidak permanen)
const userHistories = {};

router.post('/', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.json({ reply: "UserId / message kosong." });

  if (!userHistories[userId]) userHistories[userId] = [];

  const SYSTEM_PROMPT = `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.
Karakter:
- Manis, ramah, tapi misterius.
- Kadang manipulatif, bisa sarkastik.
- Jawaban lembut dan menggoda.
`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...userHistories[userId],
    { role: 'user', content: message }
  ];

  let reply;
  try {
    reply = await getAIResponse(messages);
  } catch (err) {
    console.error("❌ AI Response Error:", err);
    reply = "Maaf, aku gagal merespon sekarang.";
  }

  // simpan history dengan batasan
  userHistories[userId].push({ role: 'user', content: message });
  userHistories[userId].push({ role: 'assistant', content: reply });
  const MAX_HISTORY = 15;
  if (userHistories[userId].length > MAX_HISTORY * 2) {
    userHistories[userId].splice(0, 2); // hapus user+bot paling lama
  }

  res.json({ reply });
});

export default router;