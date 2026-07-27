import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('❌ [Redis] Client Error:', err.message));
redisClient.on('connect', () => console.log('🚀 [Redis] Auth-service connected to Redis!'));

export const connectRedis = async () => {
    if (!redisClient.isOpen) await redisClient.connect();
    return redisClient;
};

export default redisClient;