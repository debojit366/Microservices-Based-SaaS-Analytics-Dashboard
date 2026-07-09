import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
app.use(cookieParser());
app.use(cors(
    origin: 'http://localhost:3000',
    credentials: true
));
app.use(express.json());
app.use(express.static('public'));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5003;

async function startServer() {
    try {
        await connectDB();
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`🔐 [Auth Service] Running on port ${PORT}`);
        });
    } catch (err) {
        console.error('⚠️ [System Alert] Auth-service failed to start. Retrying in 5s...', err.message);
        setTimeout(startServer, 5000);
    }
}

startServer();