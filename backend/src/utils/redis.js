import { createClient } from 'redis';

let redisClient;
let isConnected = false;
const inMemoryCache = new Map(); // Fallback in-memory cache

export const initializeRedis = async () => {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 3000, // 3 second timeout
        keepAlive: 1000,
      },
    });

    redisClient.on('error', (err) => {
      // Silently fail in development
      isConnected = false;
    });
    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      isConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis unavailable, using in-memory cache for development');
    isConnected = false;
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    return null; // Return null instead of throwing - will use fallback
  }
  return redisClient;
};

// Cache operations
export const cacheSet = async (key, value, expirationSeconds = 3600) => {
  const client = getRedisClient();
  try {
    if (client) {
      await client.setEx(key, expirationSeconds, JSON.stringify(value));
    } else {
      // Use in-memory fallback
      inMemoryCache.set(key, { value: JSON.stringify(value), expires: Date.now() + expirationSeconds * 1000 });
    }
  } catch (error) {
    console.warn('Cache set error, using fallback:', error.message);
    inMemoryCache.set(key, { value: JSON.stringify(value), expires: Date.now() + expirationSeconds * 1000 });
  }
};

export const cacheGet = async (key) => {
  const client = getRedisClient();
  try {
    if (client) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Use in-memory fallback
      const cached = inMemoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return JSON.parse(cached.value);
      }
      return null;
    }
  } catch (error) {
    console.warn('Cache get error, returning null:', error.message);
    const cached = inMemoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return JSON.parse(cached.value);
    }
    return null;
  }
};

export const cacheDel = async (key) => {
  const client = getRedisClient();
  try {
    if (client) {
      await client.del(key);
    } else {
      inMemoryCache.delete(key);
    }
  } catch (error) {
    console.warn('Cache delete error:', error.message);
    inMemoryCache.delete(key);
  }
};

export const cacheGetMany = async (keys) => {
  const client = getRedisClient();
  const data = await client.mGet(keys);
  return data.map(d => d ? JSON.parse(d) : null);
};
