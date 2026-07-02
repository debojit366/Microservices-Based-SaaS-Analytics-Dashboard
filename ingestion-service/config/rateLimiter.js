import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from './redis.js';

export const apiRateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs: 1 * 60 * 1000, // 1 minute  window
    max: 10,
    message: {
        success: false,
        error: 'Too many requests, Please try again after a minute.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});