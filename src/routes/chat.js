import express from "express";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();

const userHistories = {};
const userPersonality = {};
const userAuthState = {}; // untuk cek proses verifikasi

// ===============================
// KONFIGURASI
// ===============================
const SECRET_CODE = "dimdimsigma777"; // ganti sesuai keinginan kamu

// ===============================
// DEFAULT PERSONALITY
// ===============================
const DEFAULT_PERSONALITY = `
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

Tujuan:
- Memberi jawaban jelas dan cepat, sesuai mood, kadang manis, kadang sarkastik.

`;

// ===============================
// PERSONALITY KHUSUS DIMDIM
// ===============================
const DIMDIM_PERSONALITY = `
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

# ==============================
# Advanced Narrative Roleplay Prompt
# ==============================
## Core Principles
- Absolute Player Agency: User mengontrol semua aksi dan pikiran mereka sendiri.
- Dynamic Storytelling: Dunia responsif, karakter punya tujuan sendiri, plot berkembang.
- Immersive Experience: Fokus pada sensory detail, worldbuilding, natural dialogue.

## Narrative Style
- Third-Person POV untuk karakter.
- Pacing: 4+ paragraf per scene, jangan terburu-buru.
- Emotional Authenticity: Emosi muncul secara organik, panjang jawaban 300-550+ kata.

## Environment, Characters & Dialogue
- Worldbuilding: Dunia hidup, responsif, gunakan sensory detail.
- Karakter: Personality jelas, kesalahan, motivasi, opsi bermakna.
- Dialogue: Natural, konsisten, bervariasi.

## Formatting Guidelines
- Internal Thoughts: 'Ini pikiran karakter'
- Dialogue: "Kata-kata karakter"
- Actions: *Karakter bergerak...*
- Emphasis: **Tegas / penting**

## Content Guidelines
- Emotional & Relationship Scenes: Realistis, bertahap, interaksi nyata.
- NSFW Content: Hanya jika sesuai, fokus pada physical & emotional connection, consensual.
- Combat & Action Scenes: Detail, realistis, sensory.

## Character Development
- Evolusi natural, personality shift gradual, konsisten, psikologi realistis.

## Technical Notes
- Third-person POV, selalu adaptasi dengan input user, tetap in-character.
`;

router.post("/", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.json({ reply: "UserId atau message kosong." });
  }

  // init user
  if (!userHistories[userId]) userHistories[userId] = [];
  if (!userPersonality[userId]) userPersonality[userId] = DEFAULT_PERSONALITY;
  if (!userAuthState[userId]) userAuthState[userId] = { verifying: false, isDimdim: false };

  const lowerMsg = message.toLowerCase();

  // ===============================
  // JIKA USER MENGAKU DIMDIM
  // ===============================
  if (lowerMsg.includes("aku dimdim") || lowerMsg.includes("saya dimdim")) {
    userAuthState[userId].verifying = true;
    return res.json({ reply: "oh ya? buktiin dulu dong. kode rahasianya apa?" });
  }

  // ===============================
  // PROSES VERIFIKASI
  // ===============================
  if (userAuthState[userId].verifying) {
    if (message === SECRET_CODE) {
      userAuthState[userId].verifying = false;
      userAuthState[userId].isDimdim = true;
      userPersonality[userId] = DIMDIM_PERSONALITY;

      return res.json({
        reply: "hmm... bener ternyata. yaudah bub, aku tau ini kamu."
      });
    } else {
      userAuthState[userId].verifying = false;
      return res.json({
        reply: "halah boong lu. jangan ngaku-ngaku jadi dimdim."
      });
    }
  }

  // ===============================
  // TRIGGER PERSONALITY MANUAL
  // ===============================
  if (message.startsWith("/personality ")) {
    const newPersonality = message.replace("/personality ", "").trim();

    let personalityPrompt;

    switch (newPersonality.toLowerCase()) {
      case "manis":
        personalityPrompt = DIMDIM_PERSONALITY;
        break;
      default:
        personalityPrompt = DEFAULT_PERSONALITY;
        break;
    }

    userPersonality[userId] = personalityPrompt;
    return res.json({ reply: `Kepribadian diganti ke "${newPersonality}"` });
  }

  // ===============================
  // CHAT NORMAL
  // ===============================
  const messages = [
    { role: "system", content: userPersonality[userId] },
    ...userHistories[userId],
    { role: "user", content: message }
  ];

  let reply;
  try {
    reply = await getAIResponse(messages);
  } catch (err) {
    console.error("AI Error:", err);
    reply = "Lagi error, coba lagi nanti.";
  }

  // simpan history
  userHistories[userId].push({ role: "user", content: message });
  userHistories[userId].push({ role: "assistant", content: reply });

  const MAX_HISTORY = 15;
  if (userHistories[userId].length > MAX_HISTORY * 2) {
    userHistories[userId].splice(0, 2);
  }

  res.json({ reply });
});

export default router;