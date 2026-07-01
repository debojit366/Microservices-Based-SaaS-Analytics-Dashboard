import express from 'express';
import { trackEvent } from '../controllers/analytics.js';

const router = express.Router();

// POST route mapping with controller
router.post('/track', trackEvent);

export default router;