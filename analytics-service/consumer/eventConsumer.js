import amqp from 'amqplib';
import Event from '../models/Event.js';
import DailyAggregation from '../models/DailyAggregation.js';
import redisClient from '../config/redis.js';

async function startConsumer() {
  const QUEUE_NAME = process.env.QUEUE_NAME;
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.prefetch(20);

  console.log(`Listening on queue: ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      const { eventType, userId, timestamp, ...metadata } = payload;

      if (!eventType || !userId) {
        console.error('Invalid message, missing eventType/userId:', payload);
        channel.nack(msg, false, false);
        return;
      }

      const eventDate = timestamp ? new Date(timestamp) : new Date();

      const [newEvent] = await Promise.all([
        Event.create({ userId, eventType, metadata, createdAt: eventDate }),
        DailyAggregation.incrementForEvent(eventType, userId, eventDate),
      ]);

      const cacheKey = `user:${userId}:recent_events`;
      const cacheExists = await redisClient.exists(cacheKey);

      if (cacheExists) {
        const pipeline = redisClient.multi();

        pipeline.lPush(cacheKey, JSON.stringify(newEvent));

        pipeline.lTrim(cacheKey, 0, 99);

        pipeline.expire(cacheKey, 86400);

        await pipeline.exec();
      }

      channel.ack(msg);
    } catch (err) {
      console.error('Failed to process event message:', err.message);
      channel.nack(msg, false, false);
    }
  });

  conn.on('close', () => {
    console.error('RabbitMQ connection closed, retrying in 5s...');
    setTimeout(startConsumer, 5000);
  });
}

export default startConsumer;