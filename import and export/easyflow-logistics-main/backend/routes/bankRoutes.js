import express from 'express';
import { getBanksSummary } from '../controllers/BankController.js';

const router = express.Router();


router.get('/summary', getBanksSummary);

export default router;