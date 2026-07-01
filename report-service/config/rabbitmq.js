import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

export const connectRabbitMQ = async () => {
    const rabbitURL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    
    try {
        const connection = await amqp.connect(rabbitURL);
        const channel = await connection.createChannel();
        console.log('🚀 [Broker] RabbitMQ connected and channel created!');
        return { connection, channel };
    } catch (error) {
        console.error('❌ [Broker] RabbitMQ connection failed:', error.message);
        throw error;
    }
};