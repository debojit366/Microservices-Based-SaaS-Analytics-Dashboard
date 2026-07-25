import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/analytics_db';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🍃 [Database] Auth-service MongoDB connected!');
    } catch (err) {
        console.error('❌ [Database] MongoDB connection error:', err.message);
        throw err;
    }
};

export default connectDB;