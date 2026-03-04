import 'dotenv/config';
import readline from 'readline';
import fs from 'fs';

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: Masukkan API Key di .env!");
  process.exit(1);
}

const MEMORY_FILE = './memory.json';

// ==============================
// SYSTEM PROMPT (dengan advanced roleplay)
// ==============================
const SYSTEM_PROMPT = `
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

// ==============================
// READLINE SETUP
// ==============================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Reze siap. Ketik pertanyaanmu.\n");

// ==============================
// LOAD MEMORY
// ==============================
let conversationHistory = [];
if (fs.existsSync(MEMORY_FILE)) {
  conversationHistory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
} else {
  conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  saveMemory();
}

const MAX_HISTORY = 20;

// ==============================
// MOOD & REACTION SYSTEM
// ==============================
const MOOD = {
  ramah: 0,
  penasaran: 0,
  sarkastik: 0,
  adjust(message) {
    const m = message.toLowerCase();
    if (m.includes("bodoh") || m.includes("stupid") || m.length < 3) this.sarkastik += 1;
    else this.ramah += 0.5;
    if (m.length > 50) this.penasaran += 1;
    else this.penasaran += 0.2;
    this.ramah = Math.max(-5, Math.min(5, this.ramah));
    this.penasaran = Math.max(-5, Math.min(5, this.penasaran));
    this.sarkastik = Math.max(-5, Math.min(5, this.sarkastik));
  },
  getMoodPrompt() {
    let moods = [];
    if (this.sarkastik >= 3) moods.push("Mood: sarkastik, manipulatif");
    else if (this.ramah >= 3) moods.push("Mood: ramah, manis, lembut");
    else moods.push("Mood: netral, tegas");
    if (this.penasaran >= 3) moods.push("Mood: penasaran, observatif");
    return moods.join("; ");
  },
  reset() {
    this.ramah = 0; this.penasaran = 0; this.sarkastik = 0;
  }
};

// ==============================
// HELPER
// ==============================
function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(conversationHistory, null, 2));
}

// ==============================
// ASK CHATGPT
// ==============================
async function askChatGPT(message, retry = 3) {
  try {
    MOOD.adjust(message);
    conversationHistory.push({ role: "user", content: message });

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT + "\n" + MOOD.getMoodPrompt() },
      ...conversationHistory.filter(m => m.role !== "system")
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: fullMessages
      })
    });

    if (res.status === 429 && retry > 0) {
      console.log("⏳ Rate limit... tunggu 5 detik...");
      await new Promise(r => setTimeout(r, 5000));
      return askChatGPT(message, retry - 1);
    }

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`❌ API Error: ${res.status}`, errorBody);
      return;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;

    if (reply) {
      console.log(`Reze: ${reply}\n`);
      conversationHistory.push({ role: "assistant", content: reply });

      if (conversationHistory.length > MAX_HISTORY + 1) {
        conversationHistory.splice(1, 2);
      }

      saveMemory();
    }

  } catch (err) {
    console.error("❌ Request failed:", err);
  }
}

// ==============================
// PROMPT LOOP
// ==============================
function prompt() {
  rl.question("Dim: ", async (input) => {

    if (input.toLowerCase() === '/reset') {
      conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
      MOOD.reset();
      saveMemory();
      console.log("Reze: Memory dihapus, mood reset.");
      return prompt();
    }

    if (input.toLowerCase() === '/exit' || input.toLowerCase() === 'dah') {
      console.log("Reze: sampai jumpa, Dim.");
      rl.close();
      return;
    }

    await askChatGPT(input);
    prompt();
  });
}

prompt();