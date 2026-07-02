import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { connectRedis } from './config/redis.js'; // <-- Redis connection client
import redisClient from './config/redis.js';
import Event from './models/Event.js';
import crypto from 'crypto';
globalThis.crypto = crypto;
dotenv.config();

const QUEUE_NAME = 'analytics_events';

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

    } catch (error) {
        console.error('⚠️ [System Alert] Core dependencies failed. Retrying worker startup in 5s...', error.message);
        setTimeout(startWorker, 5000);
    }
}

startWorker();