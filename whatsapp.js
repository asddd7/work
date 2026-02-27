import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";
import QRCode from "qrcode-terminal";
import fetch from "node-fetch";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  // =========================
  // TAMPILKAN QR
  // =========================
  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("Scan QR ini:");
      QRCode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("Koneksi terputus. Reconnect:", shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === "open") {
      console.log("Bot WA sudah terhubung ✅");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // =========================
  // HANDLE MESSAGE
  // =========================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    if (m.key.fromMe) return;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text;

    if (!text) return;

    const sender = m.key.remoteJid;

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sender,
          message: text,
        }),
      });

      const data = await res.json();

      await sock.sendMessage(sender, { text: data.reply });

    } catch (err) {
      console.log(err);
      await sock.sendMessage(sender, { text: "Bot error." });
    }
  });
}

startBot();