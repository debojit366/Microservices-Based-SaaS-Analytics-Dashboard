import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import Event from './models/Event.js';

dotenv.config();

const QUEUE_NAME = 'analytics_events';

async function startWorker() {
    try {
        await connectDB();

        const { channel } = await connectRabbitMQ();
        
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.prefetch(1);
        console.log(`🤖 [Worker] Actively listening to queue: [${QUEUE_NAME}]`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const eventData = JSON.parse(msg.content.toString());
                console.log(`📥 [Event Received]: ${eventData.eventType} | User: ${eventData.userId}`);

                try {
                    const newEvent = new Event(eventData);
                    await newEvent.save();
                    console.log('💾 [Success] Event logs written to MongoDB.');

                    channel.ack(msg);
                } catch (dbError) {
                    console.error('❌ [Processing Error] Could not save to DB:', dbError.message);
                    channel.nack(msg);
                }
            }
        });

    } catch (error) {
        console.error('⚠️ [System Alert] Core dependencies failed. Retrying worker startup in 5s...');
        setTimeout(startWorker, 5000);
    }
}

startWorker();