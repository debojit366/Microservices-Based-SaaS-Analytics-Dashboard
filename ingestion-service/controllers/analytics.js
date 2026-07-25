import { getChannel, getQueueName } from '../config/rabbitmq.js';

export const trackEvent = async (req, res) => {
    try {

        const eventData = req.body;

        if (!eventData.eventType) {
            return res.status(400).json({
                success: false,
                error: "eventType is required"
            });
        }

        eventData.userId = req.user.userId;

        eventData.timestamp ??= new Date().toISOString();

        const channel = getChannel();
        const queue = getQueueName();

        channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(eventData)),
            { persistent: true }
        );

        return res.status(202).json({
            success: true,
            message: "Event accepted and queued."
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false
        });
    }
};