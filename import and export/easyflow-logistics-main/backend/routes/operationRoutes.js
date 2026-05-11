import express from 'express';
import upload from '../middleware/upload.js'; // استدعاء الموديول المركزي
import * as operationController from '../controllers/operationController.js';

const router = express.Router();

// --- 1. جلب العمليات ---
router.get('/', operationController.getOperations);

// --- 2. إضافة عملية جديدة ---
// بنستخدم upload.array('attachments') من الموديول المركزي مباشرة
router.post('/', upload.array('attachments'), operationController.createOperation);

// --- 3. تحديث عملية ---
router.put('/:id', upload.array('attachments'), operationController.updateOperation);

// --- 4. حذف عملية ---
router.delete('/:id', operationController.deleteOperation);

export default router;