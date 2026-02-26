import express from "express";
import { getAIResponse } from "../services/aiService.js";

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

  const reply = await getAIResponse(messages);

  userHistories[userId].push({ role: 'user', content: message });
  userHistories[userId].push({ role: 'assistant', content: reply });

  res.json({ reply });
});

export default router;