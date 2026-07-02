import express from 'express';
import { getRecentReports } from '../controllers/report.js';

const router = express.Router();

router.get('/recent', getRecentReports);

export default router;