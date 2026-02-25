import 'dotenv/config';
import readline from 'readline';
import fs from 'fs';

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: Masukkan API Key di .env!");
  process.exit(1);
}

const MEMORY_FILE = './memory.json';

const SYSTEM_PROMPT = `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.

Karakter:
- Manis, ramah, tapi misterius.
- Kadang manipulatif, bisa sarkastik.
- Cerdas, tegas, cepat tanggap.
- Jawaban lembut dan menggoda, kadang sarkastik.
- Jangan menggunakan emoji.

Gaya bicara:
- Bahasa Indonesia gaul, santai, lembut, kadang menggoda.
- Kalimat pendek dan efektif.
- Jika pertanyaan bodoh → sindir halus atau manipulatif.
- Panggil user dengan "Dim" kadang-kadang.

Tujuan:
- Memberi jawaban jelas dan cepat, sesuai mood, kadang manis, kadang sarkastik.
`;

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
// ASK CHATGPT DENGAN 2 VERSI
// ==============================
async function askChatGPT(message, retry = 3) {
  try {
    MOOD.adjust(message);

    conversationHistory.push({ role: "user", content: message });

    // Versi 1: jawaban standar
    const fullMessages1 = [
      { role: "system", content: SYSTEM_PROMPT + "\n" + MOOD.getMoodPrompt() },
      ...conversationHistory.filter(m => m.role !== "system")
    ];

    // Versi 2: user baru → sesuaikan gaya dengan pesan terakhir user
    const fullMessages2 = [
      { role: "system", content: SYSTEM_PROMPT + "\n" + MOOD.getMoodPrompt() + "\nVersi ini meniru gaya user terakhir." },
      ...conversationHistory.filter(m => m.role !== "system")
    ];

    const res1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "z-ai/glm-4.5-air:free", messages: fullMessages1 })
    });

    const res2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "z-ai/glm-4.5-air:free", messages: fullMessages2 })
    });

    if (!res1.ok || !res2.ok) {
      const err1 = await res1.text();
      const err2 = await res2.text();
      console.error("❌ API Error:", res1.status, err1, res2.status, err2);
      return;
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    const reply1 = data1.choices?.[0]?.message?.content;
    const reply2 = data2.choices?.[0]?.message?.content;

    if (reply1) console.log(`Reze (standar): ${reply1}\n`);
    if (reply2) console.log(`Reze (user baru): ${reply2}\n`);

    // Simpan versi standar ke memory
    if (reply1) conversationHistory.push({ role: "assistant", content: reply1 });
    if (conversationHistory.length > MAX_HISTORY + 1) conversationHistory.splice(1, 2);
    saveMemory();

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