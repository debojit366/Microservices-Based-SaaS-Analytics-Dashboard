import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { connectRedis } from './config/redis.js'; // <-- Import redis connector
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

app.use('/api/v1/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
    console.error('💥 Unhandled Exception:', err.stack);
    res.status(500).json({ error: 'Something broke globally!' });
});

const startServer = async () => {
    try {
        await connectRedis();   
        await connectRabbitMQ(); 

        app.listen(PORT, () => {
            console.log(`Live and listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start the server:', error.message);
        process.exit(1);
    }
};

startServer();