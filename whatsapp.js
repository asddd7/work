import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";
import fetch from "node-fetch";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0];
    if (!m.message) return;
    if (m.key.fromMe) return;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text;

    if (!text) return;

    const sender = m.key.remoteJid;

    try {
      // kirim ke AI server kamu
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sender,
          message: text,
        }),
      });

      const data = await res.json();

      await sock.sendMessage(sender, {
        text: data.reply,
      });

    } catch (err) {
      console.log(err);
      await sock.sendMessage(sender, {
        text: "Bot error.",
      });
    }
  });

  console.log("Bot WA aktif...");
}

startBot();