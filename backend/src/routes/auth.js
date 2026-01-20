import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getRedisClient } from '../utils/redis.js';

export default async function authRoutes(fastify) {
  // Register
  fastify.post('/register', async (request, reply) => {
    const { email, password, name } = request.body;

    if (!email || !password || !name) {
      return reply.status(400).send({ error: 'Email, password, and name required' });
    }

    const redis = getRedisClient();
    const userKey = `user:${email}`;
    const existingUser = await redis.get(userKey);

    if (existingUser) {
      return reply.status(409).send({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const userData = {
      id: userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await redis.setEx(userKey, 365 * 24 * 3600, JSON.stringify(userData));
    await redis.setEx(`user:id:${userId}`, 365 * 24 * 3600, email);

    return reply.status(201).send({
      message: 'User registered successfully',
      userId,
      email,
      name,
    });
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }

    const redis = getRedisClient();
    const userKey = `user:${email}`;
    const userDataStr = await redis.get(userKey);

    if (!userDataStr) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const userData = JSON.parse(userDataStr);
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate token (simple JWT-like token)
    const token = Buffer.from(JSON.stringify({ userId: userData.id, email, iat: Date.now() })).toString('base64');

    return reply.send({
      message: 'Login successful',
      token,
      userId: userData.id,
      email,
      name: userData.name,
    });
  });

  // Get user profile
  fastify.get('/profile', async (request, reply) => {
    const { userId } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    const emailKey = `user:id:${userId}`;
    const email = await redis.get(emailKey);

    if (!email) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const userDataStr = await redis.get(`user:${email}`);
    const userData = JSON.parse(userDataStr);

    // Remove password from response
    const { password, ...safeData } = userData;
    return reply.send(safeData);
  });
}
