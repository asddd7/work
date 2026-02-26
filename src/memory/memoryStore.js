import fs from 'fs';

export function getUserFile(userId) {
  return `./memory/${userId}.json`;
}

export function getUserHistory(userId) {
  const file = getUserFile(userId);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
  return JSON.parse(fs.readFileSync(file));
}

export function saveUserHistory(userId, history) {
  fs.writeFileSync(getUserFile(userId), JSON.stringify(history, null, 2));
}