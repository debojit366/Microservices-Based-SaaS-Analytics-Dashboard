import express from 'express';
import { trackEvent } from '../controllers/analytics.js';
import { apiRateLimiter } from '../config/rateLimiter.js'; // <-- Import limiter
import verifyApiKey from "../middleware/verifyApiKey.js";

const router = express.Router();

// POST route mapping with controller
router.post('/track', verifyApiKey,apiRateLimiter, trackEvent);
export default router;