import DailyAggregation from "../models/DailyAggregation.js";
import Event from "../models/Event.js";

class ReportService {
  async getReport(startDate, endDate) {
    const today = new Date().toISOString().split("T")[0];
    const [todayData, rangeData, totalEvents, recentEvents] =
      await Promise.all([
        DailyAggregation.findOne({ date: today }),
        DailyAggregation.getRange(startDate, endDate),
        Event.countDocuments(),
        Event.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .lean(),
      ]);
    //   console.log("today:", today);
    // console.log("startDate:", startDate);
    // console.log("endDate:", endDate);
    // console.log("todayData:", todayData);
    // console.log("rangeData:", rangeData);
    // console.log("totalEvents:", totalEvents);
    // Pie Chart
    const eventDistribution = {};
    const docs = await DailyAggregation.find().lean();
    console.log("All DailyAggregation:", docs);
    for (const day of rangeData) {
      for (const [event, count] of day.eventBreakdown.entries()) {
        eventDistribution[event] =
          (eventDistribution[event] || 0) + count;
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