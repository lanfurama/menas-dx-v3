import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { dbRouter } from './routes/db.js';
import { aiRouter } from './routes/ai.js';
import { zaloRouter } from './routes/zalo.js';

// Load .env từ root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;
// Chỉ listen 127.0.0.1 khi deploy để backend không lộ ra ngoài; Nginx reverse proxy /api -> đây.
const HOST = process.env.BACKEND_HOST ?? '127.0.0.1';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3006',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/db', dbRouter);
app.use('/api/ai', aiRouter);
app.use('/api/zalo', zaloRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend running on http://${HOST}:${PORT}`);
});
