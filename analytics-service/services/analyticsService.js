import Analytics from "../models/DailyAggregation.js";

export const processEvent = async(event)=>{

    const {userId,eventType,timestamp}=event;

    let analytics=await Analytics.findOne({userId});

    if(!analytics){

        analytics=await Analytics.create({

            userId,
            totalEvents:0,
            eventCounts:{},
            activeUsers:1

        });

    }

    analytics.totalEvents++;

    analytics.eventCounts.set(

        eventType,

        (analytics.eventCounts.get(eventType)||0)+1

    );

    analytics.lastActive=timestamp;

    await analytics.save();

};