import readline from "readline";
import { getAIResponse } from "./services/aiService.js";

// Memory per user
const userHistories = [];
let currentMode = "normal";

// Prompt RP
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

// Prompt normal
const NORMAL_PROMPT = `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.
- Manis, ramah, misterius.
- Kadang manipulatif dan sarkastik.
- Jawaban lembut dan menggoda.
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You > "
});

console.log("🔥 AI Terminal Mode Aktif!");
console.log("Ketik /setMode rp untuk roleplay.");
console.log("Ketik /exit untuk keluar.\n");

rl.prompt();

rl.on("line", async (line) => {
  const message = line.trim();

  if (message === "/exit") {
    console.log("👋 Keluar...");
    process.exit(0);
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

  // Pilih system prompt
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

    // batasi memory
    const MAX_HISTORY = 20;
    if (userHistories.length > MAX_HISTORY * 2) {
      userHistories.splice(0, 2);
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  rl.prompt();
});