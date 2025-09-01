import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { prisma } from '../src/lib/prisma.js';

// Import routes
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:8080';
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Preflight OPTIONS handler
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.sendStatus(204);
});

// Make Prisma available in req object
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.get('/api/health/db', async (req, res) => {
  try
  {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ ok: true });
  }
  catch (e)
  {
    console.error('DB health error:', e);
    return res.status(500).json({ ok: false, error: 'DB_NOT_AVAILABLE' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err?.statusCode || 500;
  const code = err?.code || 'INTERNAL_ERROR';
  return res.status(status).json({
    error: { code, message: status === 500 ? 'Errore interno del server' : (err.message || 'Errore') }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint non trovato'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API in ascolto su http://localhost:${PORT}`);
  console.log(`FRONTEND_URL: ${FRONTEND_URL}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});