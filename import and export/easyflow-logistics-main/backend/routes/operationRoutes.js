import express from 'express';
import upload from '../middleware/upload.js';
import * as operationController from '../controllers/operationController.js';
import { shipmentOperationSchema, validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

// --- 1. جلب العمليات ---
// بنضيف protect عشان نضمن إن الموظفين بس اللي يشوفوا سجل العمليات
router.get('/', protect, operationController.getOperations);

// --- 2. إضافة عملية جديدة ---
// الترتيب الذهبي: 
// 1. الرفع (Multer) عشان يفك الـ FormData ويشوف الداتا.
// 2. الحماية (Protect) عشان نتأكد من هوية المستخدم.
// 3. الفحص (Validate) عشان نتأكد إن البيانات سليمة.
router.post(
    '/', 
    upload.array('attachments'), 
    protect, 
    validate(shipmentOperationSchema), 
    operationController.createOperation
);

// --- 3. تحديث عملية ---
router.put(
    '/:id', 
    upload.array('attachments'), 
    protect, 
    validate(shipmentOperationSchema), 
    operationController.updateOperation
);

// --- 4. حذف عملية ---
router.delete('/:id', protect, operationController.deleteOperation);

export default router;