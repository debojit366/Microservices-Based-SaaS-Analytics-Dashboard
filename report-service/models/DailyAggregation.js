import mongoose from 'mongoose';

const dailyAggregationSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalEvents: {
      type: Number,
      default: 0,
    },
    newUsers: {
      type: Number,
      default: 0,
    },
    usersTodayIds: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    eventBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

const TRACKED_FOR_USERS_TODAY = ['login', 'user_signup'];

dailyAggregationSchema.statics.incrementForEvent = async function (eventType, userId, eventDate) {
  const dateStr = eventDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const update = {
    $inc: {
      totalEvents: 1,
      [`eventBreakdown.${eventType}`]: 1,
    },
  };

  if (eventType === 'user_signup') {
    update.$inc.newUsers = 1;
  }

  if (TRACKED_FOR_USERS_TODAY.includes(eventType)) {
    update.$addToSet = { usersTodayIds: userId };
  }

  return this.findOneAndUpdate({ date: dateStr }, update, { upsert: true, returnDocument: 'after' });

};

dailyAggregationSchema.virtual('usersToday').get(function () {
  return this.usersTodayIds?.length || 0;
});

dailyAggregationSchema.set('toJSON', { virtuals: true });
dailyAggregationSchema.set('toObject', { virtuals: true });

dailyAggregationSchema.statics.getRange = function (startDateStr, endDateStr) {
  return this.find({ date: { $gte: startDateStr, $lte: endDateStr } }).sort({ date: 1 });
};

export default mongoose.model('DailyAggregation', dailyAggregationSchema);