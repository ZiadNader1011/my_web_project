import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as operationController from '../controllers/operationController.js';

// إعداد التخزين
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/operations/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // استخدام اسم فريد يجمع بين التاريخ والاسم الأصلي لتجنب تكرار الأسماء
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// جلب العمليات
router.get('/', operationController.getOperations);

// إضافة عملية - غيرنا 'files' لـ 'attachments' ✅
router.post('/', upload.array('attachments'), operationController.createOperation);

// تحديث عملية - غيرنا 'files' لـ 'attachments' ✅
router.put('/:id', upload.array('attachments'), operationController.updateOperation);

// حذف عملية
router.delete('/:id', operationController.deleteOperation);

export default router;