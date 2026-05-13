import express from 'express';
import { getFeedbacks, createFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/', getFeedbacks);
router.post('/', createFeedback);

// ✅ السطر ده هو اللي ناقص ومسبب المشكلة
export default router;