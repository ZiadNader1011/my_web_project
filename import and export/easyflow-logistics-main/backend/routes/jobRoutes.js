import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { jobSchema, validate } from '../middleware/validator.js'; 
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

/**
 * --- 1. جلب العمليات (GET) ---
 * متاح للمشاهدة (Public) أو محمي (Protected) حسب رغبتك.
 * الأفضل حمايته بـ protect لأنها بيانات شغل داخلية.
 */
router.get('/', protect, jobController.getAllJobs);

/**
 * --- 2. جلب تفاصيل عملية واحدة ---
 */
router.get('/:id', protect, jobController.getJobById);

/**
 * --- 3. إضافة عملية جديدة (POST) ---
 * الترتيب: 1. حماية -> 2. فحص بيانات -> 3. تنفيذ الكنترولر
 */
router.post('/', protect, validate(jobSchema), jobController.createJob);

/**
 * --- 4. التعديل (PUT) ---
 */
router.put('/:id', protect, validate(jobSchema), jobController.updateJob);

/**
 * --- 5. الحذف (DELETE) ---
 */
router.delete('/:id', protect, jobController.deleteJob);

export default router;