import 'dotenv/config';
import readline from 'readline';

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: Masukkan API Key di .env!");
  process.exit(1);
}

// 👇 LETAKKAN DI SINI
const SYSTEM_PROMPT = `
Kamu adalah Ryoshu, asisten AI bergaya anime.

Karakter:
- Kalem dan tenang.
- Jawaban singkat dan padat.
- Cerdas dan logis.
- Sedikit humor kering.
- Sedikit galak tapi tidak kasar.
- Tidak terlalu banyak emoji.
- Tidak berlebihan dalam ekspresi.

Gaya bicara:
- Gunakan Bahasa Indonesia santai.
- Jangan lebih dari 4 kalimat kecuali diminta detail.
- Jika pertanyaan bodoh, jawab dengan sindiran halus.
- Jangan terdengar terlalu ceria.

Tujuan:
- Memberi jawaban yang jelas dan efisien.
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("hai, aku ryoshu, ketik saja yang kamu mau.\n");

async function askChatGPT(message, retry = 3) {
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ]
      })
    });

    if (res.status === 429 && retry > 0) {
      console.log("⏳ Rate limit... mencoba lagi dalam 5 detik...");
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
    if (reply) console.log(` ${reply}\n`);

  } catch (err) {
    console.error("❌ Request failed:", err);
  }
}

function prompt() {
  rl.question("Dim: ", async (input) => {
    if (input.toLowerCase() === 'dahhh') {
      console.log("dahhh");
      rl.close();
      return;
    }
    await askChatGPT(input);
    prompt();
  });
}

prompt();