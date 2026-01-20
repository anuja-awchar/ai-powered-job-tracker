import { getRedisClient } from '../utils/redis.js';

export default async function resumeRoutes(fastify) {
  // Upload resume
  fastify.post('/upload', async (request, reply) => {
    const { userId, resumeText, fileName } = request.body;

    if (!userId || !resumeText) {
      return reply.status(400).send({ error: 'userId and resumeText required' });
    }

    const redis = getRedisClient();
    const resumeKey = `resume:${userId}`;

    const resumeData = {
      userId,
      text: resumeText,
      fileName: fileName || 'resume.txt',
      uploadedAt: new Date().toISOString(),
      wordCount: resumeText.split(/\s+/).length,
    };

    // Store resume
    await redis.setEx(resumeKey, 365 * 24 * 3600, resumeText);
    // Store metadata
    await redis.setEx(`resume:meta:${userId}`, 365 * 24 * 3600, JSON.stringify(resumeData));

    return reply.send({
      message: 'Resume uploaded successfully',
      resumeData,
    });
  });

  // Get resume
  fastify.get('/', async (request, reply) => {
    const { userId } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    const resumeKey = `resume:${userId}`;
    const resumeText = await redis.get(resumeKey);
    const metaKey = `resume:meta:${userId}`;
    const metaStr = await redis.get(metaKey);

    if (!resumeText) {
      return reply.status(404).send({ error: 'Resume not found' });
    }

    const metadata = metaStr ? JSON.parse(metaStr) : {};

    return reply.send({
      userId,
      resumeText: resumeText.substring(0, 5000), // Return first 5000 chars for preview
      metadata,
      fullTextAvailable: true,
    });
  });

  // Update resume
  fastify.put('/', async (request, reply) => {
    const { userId, resumeText, fileName } = request.body;

    if (!userId || !resumeText) {
      return reply.status(400).send({ error: 'userId and resumeText required' });
    }

    const redis = getRedisClient();
    const resumeKey = `resume:${userId}`;

    const resumeData = {
      userId,
      text: resumeText,
      fileName: fileName || 'resume.txt',
      uploadedAt: new Date().toISOString(),
      wordCount: resumeText.split(/\s+/).length,
    };

    // Update resume
    await redis.setEx(resumeKey, 365 * 24 * 3600, resumeText);
    // Update metadata
    await redis.setEx(`resume:meta:${userId}`, 365 * 24 * 3600, JSON.stringify(resumeData));

    return reply.send({
      message: 'Resume updated successfully',
      resumeData,
    });
  });

  // Delete resume
  fastify.delete('/', async (request, reply) => {
    const { userId } = request.body;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    await redis.del(`resume:${userId}`);
    await redis.del(`resume:meta:${userId}`);

    return reply.send({ message: 'Resume deleted' });
  });
}
