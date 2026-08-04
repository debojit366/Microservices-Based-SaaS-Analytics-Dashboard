import DailyAggregation from "../models/DailyAggregation.js";
import Event from "../models/Event.js";
import redisClient from "../config/redis.js"; // Standard shared client import

class ReportService {
  // Helper function: Redis-first with MongoDB fallback
  async getRecentEvents(userId) {
    const cacheKey = `user:${userId}:recent_events`;

    try {
      // 1. Try Redis cache first
      const cachedEvents = await redisClient.lRange(cacheKey, 0, 99);

      if (cachedEvents && cachedEvents.length > 0) {
        // Cache Hit
        return cachedEvents.map((event) => JSON.parse(event));
      }

      // 2. Cache Miss: Fetch user-specific top 100 recent events from MongoDB
      const mongoEvents = await Event.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      // 3. Hydrate Redis cache for future hits
      if (mongoEvents.length > 0) {
        const pipeline = redisClient.multi();
        pipeline.del(cacheKey); // Stale data cleanup

        mongoEvents.forEach((event) => {
          pipeline.rPush(cacheKey, JSON.stringify(event));
        });

        pipeline.expire(cacheKey, 86400); // 24 Hours TTL
        await pipeline.exec();
      }

      return mongoEvents;
    } catch (error) {
      console.error("Redis fetch error, falling back to MongoDB:", error.message);
      // Fail-safe: Direct Mongo query if Redis crashes
      return await Event.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }
  }

  async getReport(userId, startDate, endDate) {
    const today = new Date().toISOString().split("T")[0];

    // Execute queries concurrently
    const [todayData, rangeData, totalEvents, recentEvents] =
      await Promise.all([
        DailyAggregation.findOne({ date: today }),
        DailyAggregation.getRange(startDate, endDate),
        Event.countDocuments({ userId }), // Count for this user specifically
        this.getRecentEvents(userId),      // Lazy-loaded Redis/Mongo recent events
      ]);

    // Pie Chart distribution logic
    const eventDistribution = {};
    for (const day of rangeData) {
      if (day.eventBreakdown) {
        for (const [event, count] of day.eventBreakdown.entries()) {
          eventDistribution[event] =
            (eventDistribution[event] || 0) + count;
        }
      }
    }

    return {
      summary: {
        totalEvents,
        eventsToday: todayData?.totalEvents || 0,
        usersToday: todayData?.usersToday || 0,
        newUsersToday: todayData?.newUsers || 0,
      },

      charts: {
        labels: rangeData.map((d) => d.date),
        events: rangeData.map((d) => d.totalEvents),
        usersToday: rangeData.map((d) => d.usersToday),
        newUsers: rangeData.map((d) => d.newUsers),
        eventDistribution,
      },

      recentEvents,
    };
  }
}

export default new ReportService();