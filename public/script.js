const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');

function appendMessage(text, cls) {
  const div = document.createElement('div');
  div.classList.add('bubble', cls);
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

let userId = localStorage.getItem('userId');
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem('userId', userId);
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;
  appendMessage(message, 'user');
  input.value = '';

  try {
    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message, userId })
    });
    const data = await res.json();
    appendMessage(data.reply, 'bot');
  } catch (err) {
    appendMessage('Bot gagal merespon.', 'bot');
    console.error(err);
  }
}

send.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});