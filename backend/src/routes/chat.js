import { getRedisClient } from '../utils/redis.js';
import { generateChatResponse } from '../utils/ai.js';

export default async function chatRoutes(fastify) {
  // Chat endpoint
  fastify.post('/message', async (request, reply) => {
    const { userId, message } = request.body;

    if (!userId || !message) {
      return reply.status(400).send({ error: 'userId and message required' });
    }

    const redis = getRedisClient();

    // Get user's resume
    const resumeText = (await redis.get(`resume:${userId}`)) || 'No resume uploaded';

    // Get recent jobs for context (in real app, would be user's filtered results)
    // For now, we'll use empty context - in production this would come from user's current view
    const jobsContext = [];

    // Generate AI response
    const response = await generateChatResponse(message, jobsContext, resumeText);

    // Store conversation (optional - for future reference)
    const conversationKey = `conversation:${userId}`;
    const conversation = await redis.get(conversationKey);
    const messages = conversation ? JSON.parse(conversation) : [];

    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    });

    // Keep last 50 messages
    if (messages.length > 50) {
      messages.splice(0, messages.length - 50);
    }

    await redis.setEx(conversationKey, 86400, JSON.stringify(messages));

    return reply.send({
      message: response,
      conversationHistory: messages.slice(-10), // Return last 10 messages
    });
  });

  // Get conversation history
  fastify.get('/history', async (request, reply) => {
    const { userId } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    const conversationKey = `conversation:${userId}`;
    const conversation = await redis.get(conversationKey);

    const messages = conversation ? JSON.parse(conversation) : [];

    return reply.send({
      userId,
      messageCount: messages.length,
      messages: messages.slice(-20), // Return last 20 messages
    });
  });

  // Clear conversation
  fastify.delete('/history', async (request, reply) => {
    const { userId } = request.body;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    await redis.del(`conversation:${userId}`);

    return reply.send({ message: 'Conversation cleared' });
  });
}
