import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from './redis.js';

export const apiRateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: async (...args) => {
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
            return redisClient.sendCommand(args);
        },
    }),
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Too many requests, Please try again after a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});