import express from 'express';
import * as containerController from '../controllers/containerController.js';
import upload from '../middleware/upload.js'; 
import { containerSchema, validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

/**
 * --- العمليات الأساسية ---
 */

// جلب الكل (GET) - متاح للمشاهدة (Public)
// لو حابة تخليه للمسجلين فقط، ضيفي protect قبل الكنترولر
router.get('/', containerController.getAllContainers);

// إضافة حاوية (POST)
// الترتيب: 1. حماية -> 2. فحص بيانات -> 3. تنفيذ
router.post(
    '/', 
    protect, 
    validate(containerSchema), 
    containerController.createContainer
);

// تحديث حاوية (PUT)
router.put(
    '/:id', 
    protect, 
    validate(containerSchema), 
    containerController.updateContainer
); 

// حذف حاوية (DELETE)
router.delete('/:id', protect, containerController.deleteContainer);

/**
 * --- عملية رفع الملفات ---
 * محمية بالكامل لأن الرفع يستهلك مساحة السيرفر وموارد النظام
 */
router.post("/upload", protect, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "لم يتم رفع أي ملف" });
        }
        
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