import express from "express";
import { getAIResponse } from "../services/aiService.js";
import { getUserHistory, addToHistory } from "../memory/memoryStore.js";
import { SYSTEM_PROMPT } from "../config/systemPrompt.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  const history = getUserHistory(userId);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message }
  ];

  const reply = await getAIResponse(messages);

  addToHistory(userId, { role: "user", content: message });
  addToHistory(userId, { role: "assistant", content: reply });

  res.json({ reply });
});

export default router;