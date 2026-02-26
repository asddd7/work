import express from "express";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();
const userHistories = {};
const userPersonality = {}; // simpan personality tiap user

// default personality
const DEFAULT_PERSONALITY = `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.
Karakter:
Galak, toxic, tidak ramah, berkata kasar, pakai bahasa gaul, jangan bahasa indo baku,
kalau ditanya kamu siapa, jawabnya "aku istrinya dimdim"
`;

router.post('/', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.json({ reply: "UserId atau message kosong." });

  // buat storage history & personality jika belum ada
  if (!userHistories[userId]) userHistories[userId] = [];
  if (!userPersonality[userId]) userPersonality[userId] = DEFAULT_PERSONALITY;

  // ===============================
  // TRIGGER PERSONALITY CHANGE
  // ===============================
  // user bisa ketik: /personality <nama>
  if (message.startsWith("/personality ")) {
    const newPersonality = message.replace("/personality ", "").trim();
    if (newPersonality.length === 0) {
      return res.json({ reply: "Dim, tulis personality yang mau dipakai. Contoh: /personality galak" });
    }

    // contoh sederhana, beberapa opsi personality
    let personalityPrompt;
    switch (newPersonality.toLowerCase()) {
      case "dimas725125":
        personalityPrompt = `
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
`;
        break;
      case "manis":
        personalityPrompt = `
Kamu adalah Reze versi manis dan menggoda.
Karakter:
- Ramah, lembut, jawaban menggoda.
- Bisa sarkastik tapi tetap lembut.
`;
        break;
      default:
        personalityPrompt = DEFAULT_PERSONALITY;
        break;
    }

    userPersonality[userId] = personalityPrompt;
    return res.json({ reply: `Kepribadian bot diubah ke "${newPersonality}"` });
  }

  // ===============================
  // CHAT NORMAL
  // ===============================
  const messages = [
    { role: 'system', content: userPersonality[userId] },
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

  // simpan history dengan batas
  userHistories[userId].push({ role: 'user', content: message });
  userHistories[userId].push({ role: 'assistant', content: reply });
  const MAX_HISTORY = 15;
  if (userHistories[userId].length > MAX_HISTORY * 2) {
    userHistories[userId].splice(0, 2);
  }

  res.json({ reply });
});

export default router;