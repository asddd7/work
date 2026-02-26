import express from 'express';
import cors from 'cors';
import chatRoute from './routes/chat.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());                // izinkan akses dari browser
app.use(express.json());         // parse JSON
app.use(express.static("public")) // folder web (index.html + script.js)

app.use("/chat", chatRoute);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});