import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/v1", reportRoutes);

const PORT = process.env.PORT || 5004;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    // console.log("DB:", mongoose.connection.name);
    // console.log(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });