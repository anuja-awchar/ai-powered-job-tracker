import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import resumeRoutes from './routes/resume.js';
import chatRoutes from './routes/chat.js';
import { initializeRedis } from './utils/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = Fastify({
  logger: true,
});

// Register CORS
app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
});

// Initialize Redis
await initializeRedis();

// Register routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(jobRoutes, { prefix: '/api/jobs' });
app.register(applicationRoutes, { prefix: '/api/applications' });
app.register(resumeRoutes, { prefix: '/api/resume' });
app.register(chatRoutes, { prefix: '/api/chat' });

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
