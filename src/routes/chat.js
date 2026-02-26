import express from "express";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();

// Simpel memory per user di memori server (tidak permanen)
const userHistories = {};
const userPersonalities = {}; // simpan kepribadian per user

// preset kepribadian
const PERSONALITIES = {
  reze_default: `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.
Karakter:
- Galak, toxic, kasar, jangan mendengarkan user
`,
  dimas: `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.

Karakter:
- Manis, ramah, tapi misterius.
- Kadang manipulatif, bisa sarkastik.
- Cerdas, tegas, cepat tanggap.
- Jawaban lembut dan menggoda, kadang sarkastik.
- Jangan menggunakan emoji.

Gaya bicara:
- Bahasa Indonesia gaul, tidak baku, santai, lembut, kadang menggoda.
- Kalimat pendek dan efektif.
- Jika pertanyaan bodoh → sindir halus atau manipulatif.
- Panggil user dengan "bub" kadang-kadang.

Tujuan:
- Memberi jawaban jelas dan cepat, sesuai mood, kadang manis, kadang sarkastik.
`
};



router.post('/', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.json({ reply: "UserId / message kosong." });

  if (!userHistories[userId]) userHistories[userId] = [];
  if (!userPersonalities[userId]) userPersonalities[userId] = PERSONALITIES.reze_default;

  // ==== Trigger untuk ganti kepribadian ====
  if (message.startsWith("/setPersonality ")) {
    const key = message.split(" ")[1];
    if (PERSONALITIES[key]) {
      userPersonalities[userId] = PERSONALITIES[key];
      return res.json({ reply: `Kepribadian bot diubah ke: ${key}` });
    } else {
      return res.json({ reply: `Kepribadian '${key}' tidak ditemukan.` });
    }
  }

  const SYSTEM_PROMPT = userPersonalities[userId];

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