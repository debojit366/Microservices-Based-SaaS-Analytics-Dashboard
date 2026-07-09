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
import reportRoute from './routes/report.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(cors());

const QUEUE_NAME = 'analytics_events';

app.get('/api/v1/report',reportRoute)
// testing
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