import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import startConsumer from "./consumer/eventConsumer.js";

const start=async()=>{

    await connectDB();

    await connectRabbitMQ();
    await startConsumer();

    console.log("Analytics Service Running");

}

start();