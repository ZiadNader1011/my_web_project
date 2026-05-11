import express from 'express';
import * as financialController from '../controllers/financialController.js';
import upload from '../middleware/upload.js'; // استدعاء الموديول المركزي

const router = express.Router();

// --- 1. جلب كل المعاملات المالية ---
router.get('/', financialController.getTransactions);

// --- 2. إضافة معاملة جديدة ---
// بنستخدم upload.none() عشان نستقبل النصوص (Text fields) من الـ FormData
router.post('/', upload.none(), financialController.createTransaction);

// --- 3. تحديث معاملة مالية ---
router.put('/:id', upload.none(), financialController.updateTransaction);

// --- 4. حذف معاملة مالية ---
router.delete('/:id', financialController.deleteTransaction);

export default router;