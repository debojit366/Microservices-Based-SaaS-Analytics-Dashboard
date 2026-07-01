import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', EventSchema);
export default Event;