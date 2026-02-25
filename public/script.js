const chatDiv = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;
  addMessage("Dim: " + message, 'user');
  input.value = '';

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    addMessage("Reze: " + data.reply, 'bot');
  } catch (err) {
    addMessage("Reze: Terjadi error.", 'bot');
  }
}

function addMessage(msg, cls) {
  const p = document.createElement('p');
  p.textContent = msg;
  p.className = cls;
  chatDiv.appendChild(p);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}