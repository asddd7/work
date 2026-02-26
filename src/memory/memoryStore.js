const memory = new Map();

export function getUserHistory(userId) {
  if (!memory.has(userId)) {
    memory.set(userId, []);
  }
  return memory.get(userId);
}

export function addToHistory(userId, message) {
  const history = getUserHistory(userId);
  history.push(message);

  if (history.length > 20) {
    history.shift();
  }
}