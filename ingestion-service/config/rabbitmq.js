import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'analytics_events';

let channel = null;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        // Ensure queue exists and is durable
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log('🚀 [Broker] Ingestion Service connected to RabbitMQ successfully!');
        return channel;
    } catch (error) {
        console.error('❌ [Broker] RabbitMQ Connection Error:', error.message);
        // Retry mechanism
        console.log('🔄 Retrying RabbitMQ connection in 5 seconds...');
        setTimeout(connectRabbitMQ, 5000);
    }
};

// Pure project me channel data send karne ke liye ye helper function use hoga
export const getChannel = () => {
    if (!channel) {
        throw new Error('❌ [Broker] RabbitMQ channel is not initialized yet!');
    }
    return channel;
};

export const getQueueName = () => QUEUE_NAME;