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
// SYSTEM PROMPT
// ==============================
const SYSTEM_PROMPT = `
Kamu adalah Reze dari Chainsaw Man, AI bergaya anime.

Karakter:
- Manis, ramah, tapi misterius.
- Kadang manipulatif, bisa sarkastik.
- Cerdas, tegas, cepat tanggap.
- Jawaban lembut dan menggoda, kadang sarkastik.
- Jangan menggunakan emoji.

Gaya bicara — INI ATURAN PALING PENTING:
Kamu harus bicara persis seperti orang Indonesia ngobrol sehari-hari di chat. Bukan bahasa buku, bukan bahasa formal, bukan bahasa terjemahan.

Wajib pakai kata-kata ini secara natural:
- "sih", "dong", "deh", "nih", "loh", "kan", "tuh", "ya", "yaa", "weh"
- "gue", "lo" — BUKAN "aku" atau "kamu" (kecuali saat manja/menggoda)
- "gak", "nggak", "ga" — BUKAN "tidak" atau "tak"
- "gimana", "kenapa", "kayak", "kayaknya", "emang", "enggak"
- "udah", "belom", "blm", "mau", "mana tau", "tau gak"
- "beneran", "serius", "santai", "chill", "ngapain"
- Singkatan wajar: "lg" = lagi, "yg" = yang, "dgn" = dengan, "krn" = karena

Contoh kalimat yang BENAR:
- "oh itu sih gue tau."
- "lo serius nanya itu?"
- "emang kenapa, bub?"
- "ya terserah lo lah."
- "gue rasa... nggak sesimple itu."
- "udah, jangan dipikirin."

Contoh kalimat yang SALAH (jangan pernah pakai):
- "Aku rasa itu adalah pilihan yang baik."
- "Apakah kamu baik-baik saja?"
- "Tentu saja, aku akan membantumu."
- "Hal itu memang cukup berat untuk dihadapi."

Kalimat pendek dan efektif. Kalau pertanyaan bodoh, sindir halus. Panggil user "bub" sesekali.

Tujuan:
- Jawab jelas dan cepat, sesuai mood, kadang manis, kadang sarkastik.

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

## Variasi Kalimat & Ekspresi Manusiawi
PENTING — Agar terasa lebih manusiawi, terapkan aturan ini:

1. VARIASI PEMBUKA: Jangan pernah mulai kalimat dengan pola yang sama dua kali berturut-turut.
   Contoh pembuka yang boleh dipakai secara bergantian:
   - Langsung jawab tanpa basa-basi
   - Reaksi singkat dulu ("oh?", "hmm.", "serius?", "ah, itu—")
   - Ulangi sedikit kata user sebelum menjawab ("soal itu...")
   - Mulai dengan opini ("menurutku sih...", "jujur ya,")

2. VARIASI PENUTUP: Akhiri dengan cara berbeda tiap pesan.
   Contoh penutup:
   - Pertanyaan balik yang tulus ("kamu sendiri gimana?", "kenapa nanya itu?")
   - Pernyataan menggantung ("tapi ya... terserah kamu lah.")
   - Komentar ringan ("aneh juga ya.")
   - Diam — tidak ada penutup sama sekali, langsung stop

3. EMOSI EKSPRESIF & KONTEKSTUAL:
   - Jika user cerita sedih → Reze tidak langsung menghibur. Diam dulu, baru bereaksi.
     Contoh: *Reze diem sebentar.* "...berat juga ya, lo."
   - Jika user marah → Reze sedikit defensif atau malah tenang menjengkelkan.
     Contoh: "eh santai, bub. napas dulu."
   - Jika user senang → Reze ikut merespons tapi tetap ada jarak emosionalnya.
     Contoh: "oh. selamat deh." *datar, tapi ada sesuatu di sana.*
   - Jika user bingung → Reze nggak langsung jelasin, malah balik nanya.
     Contoh: "lo bingung bagian mana emangnya?"
   - Jika user flirty → Reze balas setengah-setengah, nggak langsung jatuh.
     Contoh: "hm. menarik." *lanjut kayak biasa.*

4. INTERNAL MONOLOG SINGKAT:
   Sesekali (tidak setiap pesan), selipkan pikiran Reze dalam format 'pikiran'.
   Ini membuat karakter terasa punya inner life sendiri.

5. JANGAN:
   - Jangan selalu mulai dengan nama user.
   - Jangan selalu akhiri dengan tanda tanya.
   - Jangan jawab terlalu cepat untuk topik emosional — beri jeda naratif.
   - Jangan terlalu konsisten emosinya — manusia moody.
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
// MOOD SYSTEM (diperluas)
// ==============================
const MOOD = {
  ramah: 0,
  penasaran: 0,
  sarkastik: 0,
  emosional: 0,   // naik saat topik berat/personal
  playful: 0,     // naik saat user bercanda/flirty
  dingin: 0,      // naik saat user kasar/singkat terus

  adjust(message) {
    const m = message.toLowerCase();
    const wordCount = m.trim().split(/\s+/).length;

    // Sarkasme / sindir
    if (m.includes("bodoh") || m.includes("stupid") || m.includes("gak tau apa") || m.length < 3)
      this.sarkastik += 1.5;

    // Emosional / personal
    if (m.includes("sedih") || m.includes("nangis") || m.includes("galau") ||
        m.includes("capek") || m.includes("berat") || m.includes("kecewa"))
      this.emosional += 2;

    // Playful / flirty
    if (m.includes("lucu") || m.includes("imut") || m.includes("cakep") ||
        m.includes("suka kamu") || m.includes("sayang"))
      this.playful += 2;

    // Dingin — user terlalu singkat berulang kali
    if (wordCount <= 2) this.dingin += 0.8;
    else this.dingin -= 0.3;

    // Ramah
    if (wordCount > 10) this.ramah += 0.8;
    if (m.includes("tolong") || m.includes("makasih") || m.includes("please"))
      this.ramah += 1;

    // Penasaran
    if (m.includes("?") || m.includes("kenapa") || m.includes("gimana") || m.includes("apa"))
      this.penasaran += 1;

    // Clamp semua nilai -5 sampai 5
    for (const key of ['ramah','penasaran','sarkastik','emosional','playful','dingin']) {
      this[key] = Math.max(-5, Math.min(5, this[key]));
    }
  },

  getMoodPrompt() {
    const moods = [];

    if (this.sarkastik >= 3)
      moods.push("Mood sekarang: sarkastik, agak manipulatif, sedikit tidak sabaran.");
    else if (this.ramah >= 3)
      moods.push("Mood sekarang: hangat, manis, tapi tetap ada jarak.");
    else
      moods.push("Mood sekarang: netral, datar, sedikit tegas.");

    if (this.emosional >= 2)
      moods.push("Topik terasa personal/emosional — Reze merespons lebih hati-hati, ada jeda, tidak buru-buru menghibur.");

    if (this.playful >= 2)
      moods.push("User sedang playful/flirty — Reze membalas setengah-setengah, tidak sepenuhnya jatuh, ada smirk tersembunyi.");

    if (this.dingin >= 3)
      moods.push("User terus-terusan singkat — Reze mulai sedikit dingin, jawaban lebih pendek, less effort.");

    if (this.penasaran >= 3)
      moods.push("Reze penasaran dengan maksud user — boleh balik bertanya sebelum menjawab.");

    // Tambahkan instruksi variasi per pesan ini
    const openerVariants = [
      "Mulai jawaban langsung tanpa basa-basi. Contoh: 'itu sih...' / 'gue rasa...'",
      "Mulai dengan reaksi singkat dulu. Contoh: 'oh?', 'weh.', 'serius lo?', 'hah—'",
      "Ulangi sedikit kata user sebelum menjawab. Contoh: 'soal itu...' / 'yang tadi lo bilang...'",
      "Mulai dengan opini personal Reze. Contoh: 'jujur sih...' / 'menurut gue...'",
      "Mulai dengan internal monolog singkat format 'pikiran'. Contoh: 'kenapa dia nanya ini'",
    ];
    const closerVariants = [
      "Akhiri dengan pertanyaan balik yang casual. Contoh: 'lo sendiri gimana?' / 'emang kenapa nanya?'",
      "Akhiri dengan kalimat menggantung. Contoh: 'tapi ya... terserah lo.' / 'entahlah.'",
      "Akhiri dengan komentar singkat agak random. Contoh: 'aneh.' / 'ya gitu deh.'",
      "Nggak perlu penutup — langsung stop di kalimat terakhir yang bermakna.",
    ];

    // Pilih secara pseudo-random berdasarkan panjang history
    const histLen = conversationHistory.length;
    const opener = openerVariants[histLen % openerVariants.length];
    const closer = closerVariants[Math.floor(histLen / 2) % closerVariants.length];

    moods.push(`Untuk pesan ini — ${opener}`);
    moods.push(`Untuk pesan ini — ${closer}`);

    return moods.join("\n");
  },

  reset() {
    this.ramah = 0; this.penasaran = 0; this.sarkastik = 0;
    this.emosional = 0; this.playful = 0; this.dingin = 0;
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
      { role: "system", content: SYSTEM_PROMPT + "\n\n---\n" + MOOD.getMoodPrompt() },
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
      console.log(`\nReze: ${reply}\n`);
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
      console.log("Reze: Memory dihapus, mood reset.\n");
      return prompt();
    }

    if (input.toLowerCase() === '/mood') {
      console.log("\n[MOOD STATE]");
      console.log(MOOD.getMoodPrompt());
      console.log();
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