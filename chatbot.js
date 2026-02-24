import 'dotenv/config'; // Supaya bisa pakai .env
import readline from 'readline';

// ==============================
// Masukkan API Key di file .env
// ==============================
// Buat file .env di folder project:
// OPENROUTER_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: Masukkan API Key di .env!");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 Chatbot siap! Ketik pertanyaanmu atau 'exit' untuk keluar.\n");

async function askChatGPT(message) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`❌ API Error: ${res.status}`, errorBody);
      return;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) console.log(`🤖 ${reply}\n`);
    else console.log("🤖 (Tidak ada balasan dari API)\n");
  } catch (err) {
    console.error("❌ Request failed:", err);
  }
}

function prompt() {
  rl.question("📝 Kamu: ", async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log("👋 Sampai jumpa!");
      rl.close();
      return;
    }
    await askChatGPT(input);
    prompt();
  });
}

prompt();