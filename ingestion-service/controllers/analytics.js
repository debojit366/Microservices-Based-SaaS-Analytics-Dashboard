import { getChannel, getQueueName } from '../config/rabbitmq.js';

export const trackEvent = async (req, res) => {
    try {
        const eventData = req.body;

        // Validation Layer
        if (!eventData.eventType || !eventData.userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Bad Request: Missing eventType or userId' 
            });
        }

        // Timestamp default setup
        eventData.timestamp = eventData.timestamp || new Date().toISOString();

        // Fetch initialized channel
        const channel = getChannel();
        const queue = getQueueName();

        // Send to queue with persistent mode (disk storage)
        channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(eventData)),
            { persistent: true }
        );

        // 202 Accepted means request received but processing ongoing
        return res.status(202).json({
            success: true,
            message: 'Event accepted and queued for heavy processing.'
        });

    } catch (error) {
        console.error('❌ [Controller Error] Error queuing event:', error.message);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error' 
        });
    }
};