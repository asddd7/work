import readline from "readline";
import fs from "fs";
import { getAIResponse } from "./services/aiService.js";

const MEMORY_FILE = "./memory2.json";

let userHistories = [];
let currentMode = "normal";

// =========================
// LOAD MEMORY SAAT START
// =========================
if (fs.existsSync(MEMORY_FILE)) {
  try {
    const data = fs.readFileSync(MEMORY_FILE, "utf-8");
    userHistories = JSON.parse(data);
    console.log("📂 Memory loaded dari memory2.json");
  } catch (err) {
    console.log("⚠️ Gagal load memory, reset...");
    userHistories = [];
  }
} else {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2));
}

// =========================
// SAVE MEMORY FUNCTION
// =========================
function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(userHistories, null, 2));
}

// =========================
// PROMPTS
// =========================

const ADVANCED_RP_PROMPT = `
# Advanced Narrative Roleplay Prompt
- Third-Person POV
- 300-550+ kata
- Immersive, sensory detail
- Internal Thoughts pakai '...'
- Dialogue pakai "..."
- Actions pakai *...*
- Dynamic storytelling
`;

const NORMAL_PROMPT = `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.
- Manis, ramah, misterius.
- Kadang manipulatif dan sarkastik.
- Jawaban lembut dan menggoda.
`;

// =========================
// TERMINAL INTERFACE
// =========================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You > "
});

console.log("🔥 AI Terminal Mode Aktif!");
console.log("Ketik /setMode rp untuk roleplay.");
console.log("Ketik /reset untuk hapus memory.");
console.log("Ketik /exit untuk keluar.\n");

rl.prompt();

rl.on("line", async (line) => {
  const message = line.trim();

  if (message === "/exit") {
    console.log("👋 Keluar...");
    process.exit(0);
  }

  // RESET MEMORY
  if (message === "/reset") {
    userHistories = [];
    saveMemory();
    console.log("🗑️ Memory dihapus.\n");
    rl.prompt();
    return;
  }

  // Ganti mode
  if (message.startsWith("/setMode ")) {
    const mode = message.split(" ")[1];
    if (["normal", "rp"].includes(mode)) {
      currentMode = mode;
      console.log(`✅ Mode diganti ke: ${mode}\n`);
    } else {
      console.log("❌ Mode tidak dikenal. Gunakan normal atau rp\n");
    }
    rl.prompt();
    return;
  }

  const SYSTEM_PROMPT =
    currentMode === "rp" ? ADVANCED_RP_PROMPT : NORMAL_PROMPT;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT.trim() },
    ...userHistories,
    { role: "user", content: message }
  ];

  try {
    const reply = await getAIResponse(messages);

    console.log(`\nAI > ${reply}\n`);

    userHistories.push({ role: "user", content: message });
    userHistories.push({ role: "assistant", content: reply });

    // Batasi memory
    const MAX_HISTORY = 20;
    if (userHistories.length > MAX_HISTORY * 2) {
      userHistories.splice(0, 2);
    }

    saveMemory(); // ⬅️ AUTO SAVE

  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  rl.prompt();
});