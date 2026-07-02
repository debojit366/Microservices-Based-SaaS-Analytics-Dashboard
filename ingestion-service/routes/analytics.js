import express from 'express';
import { trackEvent } from '../controllers/analytics.js';
import { apiRateLimiter } from '../config/rateLimiter.js'; // <-- Import limiter
const router = express.Router();

// POST route mapping with controller
router.post('/track', apiRateLimiter, trackEvent);
export default router;