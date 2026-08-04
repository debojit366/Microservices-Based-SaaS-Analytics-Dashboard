import express from "express";
import { getReport } from "../controllers/reportController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/reports", authenticateUser, getReport);

export default router;