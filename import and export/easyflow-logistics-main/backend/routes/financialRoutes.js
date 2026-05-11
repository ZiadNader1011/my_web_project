import express from 'express';
import * as financialController from '../controllers/financialController.js';
import upload from '../middleware/upload.js'; 
import { transactionSchema, validate } from '../middleware/validator.js'; // 1. استيراد الفلتر والعسكري

const router = express.Router();
router.use(protect);

/**
 * --- 1. جلب كل المعاملات المالية (GET) ---
 * لا يحتاج لفحص الجسم (Body)، العمليات هنا جلب فقط.
 */
router.get('/', financialController.getTransactions);

/**
 * --- 2. إضافة معاملة جديدة (POST) ---
 * الترتيب: 
 * 1. upload.none() لفك بيانات الـ FormData.
 * 2. validate(transactionSchema) للتأكد من صحة البيانات والأنواع.
 * 3. الكنترولر للتنفيذ.
 */
router.post(
    '/', 
    upload.none(), 
    validate(transactionSchema), 
    financialController.createTransaction
);

/**
 * --- 3. تحديث معاملة مالية (PUT) ---
 * نفس منطق الـ POST مع التأكد من صحة الـ ID.
 */
router.put(
    '/:id', 
    upload.none(), 
    validate(transactionSchema), 
    financialController.updateTransaction
);

/**
 * --- 4. حذف معاملة مالية (DELETE) ---
 */
router.delete('/:id', financialController.deleteTransaction);

export default router;