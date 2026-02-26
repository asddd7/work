import express from 'express';
import cors from 'cors';
import chatRoute from './src/routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/chat", chatRoute);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});