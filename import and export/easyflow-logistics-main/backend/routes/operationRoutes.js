import express from 'express';
import upload from '../middleware/upload.js';
import * as operationController from '../controllers/operationController.js';
import { shipmentOperationSchema, validate } from '../middleware/validator.js'; // 1. الاستيراد

const router = express.Router();
router.use(protect);

// --- 1. جلب العمليات ---
router.get('/', operationController.getOperations);

// --- 2. إضافة عملية جديدة ---
// الترتيب: الرفع يفك الـ FormData -> الفحص يتأكد من البيانات -> الكنترولر يحفظ
router.post(
    '/', 
    upload.array('attachments'), 
    validate(shipmentOperationSchema), 
    operationController.createOperation
);

// --- 3. تحديث عملية ---
router.put(
    '/:id', 
    upload.array('attachments'), 
    validate(shipmentOperationSchema), 
    operationController.updateOperation
);

// --- 4. حذف عملية ---
router.delete('/:id', operationController.deleteOperation);

export default router;