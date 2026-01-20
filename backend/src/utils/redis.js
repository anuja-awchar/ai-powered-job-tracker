import { createClient } from 'redis';

let redisClient;

export const initializeRedis = async () => {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('✅ Redis connected'));

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Cache operations
export const cacheSet = async (key, value, expirationSeconds = 3600) => {
  const client = getRedisClient();
  await client.setEx(key, expirationSeconds, JSON.stringify(value));
};

export const cacheGet = async (key) => {
  const client = getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheDel = async (key) => {
  const client = getRedisClient();
  await client.del(key);
};

export const cacheGetMany = async (keys) => {
  const client = getRedisClient();
  const data = await client.mGet(keys);
  return data.map(d => d ? JSON.parse(d) : null);
};
