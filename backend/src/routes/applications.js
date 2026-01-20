import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../utils/redis.js';

export default async function applicationRoutes(fastify) {
  // Record application
  fastify.post('/', async (request, reply) => {
    const { userId, jobId, status = 'applied' } = request.body;

    if (!userId || !jobId) {
      return reply.status(400).send({ error: 'userId and jobId required' });
    }

    const redis = getRedisClient();
    const appId = uuidv4();

    const application = {
      id: appId,
      userId,
      jobId,
      status,
      appliedAt: new Date().toISOString(),
      timeline: [
        {
          status,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Store application
    await redis.setEx(`application:${appId}`, 365 * 24 * 3600, JSON.stringify(application));

    // Add to user's applications list
    const userAppsKey = `user:${userId}:applications`;
    const userApps = await redis.get(userAppsKey);
    const appsList = userApps ? JSON.parse(userApps) : [];
    appsList.push(appId);
    await redis.setEx(userAppsKey, 365 * 24 * 3600, JSON.stringify(appsList));

    return reply.status(201).send(application);
  });

  // Get user's applications
  fastify.get('/', async (request, reply) => {
    const { userId, status } = request.query;

    if (!userId) {
      return reply.status(400).send({ error: 'userId required' });
    }

    const redis = getRedisClient();
    const userAppsKey = `user:${userId}:applications`;
    const appsList = await redis.get(userAppsKey) || [];

    let applications = [];
    if (appsList && appsList.length > 0) {
      applications = await Promise.all(
        appsList.map(async appId => {
          const appStr = await redis.get(`application:${appId}`);
          return appStr ? JSON.parse(appStr) : null;
        })
      );
      applications = applications.filter(Boolean);
    }

    // Filter by status if provided
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    // Sort by date (newest first)
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    return reply.send({
      total: applications.length,
      applications,
    });
  });

  // Update application status
  fastify.patch('/:applicationId', async (request, reply) => {
    const { applicationId } = request.params;
    const { status } = request.body;

    if (!status) {
      return reply.status(400).send({ error: 'status required' });
    }

    const redis = getRedisClient();
    const appKey = `application:${applicationId}`;
    const appStr = await redis.get(appKey);

    if (!appStr) {
      return reply.status(404).send({ error: 'Application not found' });
    }

    const application = JSON.parse(appStr);
    application.status = status;
    application.timeline.push({
      status,
      timestamp: new Date().toISOString(),
    });

    await redis.setEx(appKey, 365 * 24 * 3600, JSON.stringify(application));

    return reply.send(application);
  });

  // Delete application
  fastify.delete('/:applicationId', async (request, reply) => {
    const { applicationId } = request.params;

    const redis = getRedisClient();
    await redis.del(`application:${applicationId}`);

    return reply.send({ message: 'Application deleted' });
  });
}
