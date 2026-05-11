import express from 'express';
import * as financialController from '../controllers/financialController.js';
import upload from '../middleware/upload.js'; 
import { transactionSchema, validate } from '../middleware/validator.js'; 
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

/**
 * --- 1. جلب كل المعاملات المالية (GET) ---
 * أضفنا protect لأن بيانات الخزينة والفلوس لا يجب أن يراها أي شخص
 */
router.get('/', protect, financialController.getTransactions);

/**
 * --- 2. إضافة معاملة جديدة (POST) ---
 * الترتيب "المضاد للرصاص":
 * 1. upload.none(): فك بيانات الـ FormData أولاً.
 * 2. protect: التأكد إن الشخص مسجل دخول ومعاه Token سليم.
 * 3. validate: فحص جودة البيانات (رقم، نوع المعاملة، إلخ).
 * 4. Controller: التنفيذ النهائي.
 */
router.post(
    '/', 
    upload.none(), 
    protect, 
    validate(transactionSchema), 
    financialController.createTransaction
);

/**
 * --- 3. تحديث معاملة مالية (PUT) ---
 */
router.put(
    '/:id', 
    upload.none(), 
    protect, 
    validate(transactionSchema), 
    financialController.updateTransaction
);

/**
 * --- 4. حذف معاملة مالية (DELETE) ---
 */
router.delete('/:id', protect, financialController.deleteTransaction);

export default router;