import redisClient from '../config/redis.js';
import Event from '../models/Event.js';

export const getRecentReports = async (req, res) => {
    try {
        const cacheKey = 'reports:recent';

        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            console.log('🎯 [Cache Hit] Serving fresh insights from Redis!');
            return res.status(200).json({
                success: true,
                source: 'Redis Cache',
                count: JSON.parse(cachedData).length,
                data: JSON.parse(cachedData)
            });
        }

        console.log('⏱️ [Cache Miss] Fetching data from MongoDB...');
        
        const reports = await Event.find().sort({ timestamp: -1 }).limit(50);

        await redisClient.setEx(cacheKey, 300, JSON.stringify(reports));

        return res.status(200).json({
            success: true,
            source: 'MongoDB Database',
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('❌ [Report Controller Error]:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};