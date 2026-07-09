import mongoose from 'mongoose';
import dotenv from 'dotenv';

     dotenv.config();

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/analytics_db';
    console.log("mongo uri is -> ",mongoURI)
    try {
        await mongoose.connect(mongoURI);
        console.log('🍃 [Database] MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ [Database] MongoDB connection failed:', error.message);
        throw error;
    }
};

export default connectDB;