import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { apiRouter } from './routes/api.js';

const app = express();
const port = Number(process.env.PORT ?? 8000);
const codespaceName = process.env.CODESPACE_NAME;
const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';
const allowedOrigins = new Set([
  'http://localhost:5173',
  ...(process.env.CODESPACE_NAME
    ? [`https://${process.env.CODESPACE_NAME}-5173.app.github.dev`]
    : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  }),
);
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    service: 'octofit-tracker-api',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.use('/api', apiRouter);

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 400
  ) {
    response.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    response.status(409).json({ error: 'A record with that unique value already exists' });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: 'Request validation failed', details: error.message });
    return;
  }
  if (error instanceof mongoose.Error) {
    response.status(400).json({ error: 'Invalid database request' });
    return;
  }
  if (error instanceof Error && error.message.startsWith('JWT_SECRET')) {
    response.status(503).json({ error: 'Authentication is not configured on this server' });
    return;
  }
  console.error('Unhandled API error:', error);
  response.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

async function startServer(): Promise<void> {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`OctoFit Tracker API listening on port ${port}`);
    console.log(`API base URL: ${apiBaseUrl}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start OctoFit Tracker API:', error);
  process.exitCode = 1;
});
