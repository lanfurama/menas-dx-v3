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
const PORT = process.env.PORT || 30060;

// CORS: tự động accept mọi origin (phù hợp cho mọi server)
app.use(cors({
  origin: true, // Accept any origin
  credentials: true
}));
app.use(express.json());

// Basic request logger
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Routes (versioned API)
app.use('/api/v1/db', dbRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/zalo', zaloRouter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler - log tất cả request không match
app.use((req, res, next) => {
  console.error('[404] Route not found:', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
  });
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /api/v1/health',
      'GET /api/v1/db/config',
      'POST /api/v1/db/config',
      'GET /api/v1/db/health',
      'GET /api/v1/ai/config',
      'GET /api/v1/ai/configs',
    ],
  });
});

// Centralized error handler (log all API errors)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[API ERROR]', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  if (res.headersSent) {
    return;
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message || 'Request failed',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Accessible at http://localhost:${PORT}`);
  console.log(`   And from external IPs on port ${PORT}`);
});
