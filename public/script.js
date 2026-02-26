const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");

// ==============================
// AUTO USER ID (Simpan di browser)
// ==============================
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

// ==============================
// CONFIG SERVER
// ==============================
// Ganti sesuai kebutuhan:

// const SERVER_URL = "http://localhost:3000/chat"; // OFFLINE
const SERVER_URL = "https://lobate-louetta-uniconoclastically.ngrok-free.dev/chat"; // ONLINE

// ==============================
// TAMBAH MESSAGE KE CHAT
// ==============================
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender); // pakai class dari CSS modern tadi
  div.innerText = text;
  chat.appendChild(div);

  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });
}

// ==============================
// LOADING / TYPING EFFECT
// ==============================
function showTyping() {
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.id = "typing";
  typing.innerText = "Reze sedang mengetik...";
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// ==============================
// SEND MESSAGE
// ==============================
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";
  showTyping();

  try {
    const res = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId })
    });

    const data = await res.json();
    removeTyping();
    appendMessage(data.reply, "bot");

  } catch (err) {
    removeTyping();
    appendMessage("Bot gagal merespon.", "bot");
    console.error(err);
  }
}

// ==============================
// EVENT LISTENER
// ==============================
send.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});