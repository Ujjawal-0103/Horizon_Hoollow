import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { apiRouter } from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders } from './middleware/securityMiddleware';

const app = express();

// Security HTTP headers (Section 18)
app.use(securityHeaders);

// CORS configuration (Section 19)
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Request logger (ensuring sensitive fields are never logged - Section 22)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes with versioning
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🧠 MindTrace Backend Engine Running`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
    console.log(`⚙️ Environment: ${config.nodeEnv}`);
    console.log(`=========================================`);
  });
}

export default app;
