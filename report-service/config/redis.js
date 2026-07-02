import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on('error', (err) => console.error('❌ [Redis-Report] Client Error:', err.message));
redisClient.on('connect', () => console.log('🚀 [Redis-Report] Connected to Redis Cache successfully!'));

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    return redisClient;
};

export default redisClient;