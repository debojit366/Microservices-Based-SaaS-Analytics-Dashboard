import crypto from 'crypto';
globalThis.crypto = crypto;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { connectRedis } from './config/redis.js';
import redisClient from './config/redis.js';
import Event from './models/Event.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(cors());

const QUEUE_NAME = 'analytics_events';

app.get('/api/v1/reports/recent', async (req, res) => {
    try {
        const cacheKey = 'reports:recent';

        // 1. Check Redis Cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('🎯 [Cache Hit] Serving data to frontend from Redis!');
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: JSON.parse(cachedData)
            });
        }

        // 2. Cache Miss -> Fetch from MongoDB
        console.log('⏱️ [Cache Miss] Fetching fresh data for frontend from MongoDB...');
        const reports = await Event.find().sort({ timestamp: -1 }).limit(50);

        // 3. Save to Redis for 5 mins
        await redisClient.setEx(cacheKey, 300, JSON.stringify(reports));

        return res.status(200).json({
            success: true,
            source: 'database',
            data: reports
        });
    } catch (error) {
        console.error('❌ [API Error]:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

async function startWorker() {
    try {
        await connectDB();
        await connectRedis();

        const { channel } = await connectRabbitMQ();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);
        
        console.log(`🤖 [Worker Process] Actively listening to queue: [${QUEUE_NAME}]`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const eventData = JSON.parse(msg.content.toString());
                console.log(`📥 [Event Received]: ${eventData.eventType} | User: ${eventData.userId}`);

                try {
                    const newEvent = new Event(eventData);
                    await newEvent.save();
                    console.log('💾 [Success] Event logs written to MongoDB.');

                    const cacheKey = 'reports:recent';
                    await redisClient.del(cacheKey);
                    console.log('🧹 [Cache Cleared] Evicted stale reports cache due to new mutation.');

                    channel.ack(msg);
                } catch (dbError) {
                    console.error('❌ [Processing Error] Could not save to DB:', dbError.message);
                    channel.nack(msg, false, true); 
                }
            }
        });

        // Start Express Server
        app.listen(PORT, () => {
            console.log(`📡 [Report Service API] Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('⚠️ [System Alert] Core dependencies failed. Retrying in 5s...', error.message);
        setTimeout(startWorker, 5000);
    }
}

startWorker();