import express from 'express';
import * as containerController from '../controllers/containerController.js';
import upload from '../middleware/upload.js'; 
import { containerSchema, validate } from '../middleware/validator.js'; // 1. استيراد الفلتر والعسكري

const router = express.Router();
router.use(protect);

/**
 * --- العمليات الأساسية ---
 */

// جلب الكل (GET) - لا يحتاج فحص للجسم
router.get('/', containerController.getAllContainers);

// إضافة حاوية (POST) - الترتيب: الفحص أولاً ثم التنفيذ
// ملحوظة: لو الكنترولر بيستلم ملفات مباشرة، حطي upload.array قبل validate
router.post('/', validate(containerSchema), containerController.createContainer);

// تحديث حاوية (PUT) - الفحص ثم التنفيذ
router.put('/:id', validate(containerSchema), containerController.updateContainer); 

// حذف حاوية (DELETE)
router.delete('/:id', containerController.deleteContainer);

/**
 * --- عملية رفع الملفات ---
 * مخصصة لرفع الصور أو المستندات الخاصة بالحاوية بشكل منفصل
 */
router.post("/upload", upload.single("file"), (req, res) => {
    try {
        // التأكد من وجود الملف
        if (!req.file) {
            return res.status(400).json({ error: "لم يتم رفع أي ملف" });
        }
        
        // بناء الرابط بشكل ديناميكي (مضاد للرصاص)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        return res.json({
            success: true,
            url: `${baseUrl}/uploads/${req.file.filename}`,
            filename: req.file.filename
        });
    } catch (error) {
        console.error("Upload Route Error:", error);
        return res.status(500).json({ error: "حدث خطأ أثناء معالجة رفع الملف" });
    }
});

export default router;