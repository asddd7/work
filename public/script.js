const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");

// ==============================
// AUTO USER ID
// ==============================
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

// ==============================
// SERVER URL
// ==============================
const SERVER_URL = "https://lobate-louetta-uniconoclastically.ngrok-free.dev/chat";

// ==============================
// TAMBAH MESSAGE
// ==============================
function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = text;
  chat.appendChild(div);

  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });
}

// ==============================
// TYPING
// ==============================
function showTyping() {
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.id = "typing";
  typing.innerText = "Reze sedang mengetik...";
  chat.appendChild(typing);
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
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
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
// EVENTS
// ==============================
send.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});