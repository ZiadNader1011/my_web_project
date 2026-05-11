import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { jobSchema, validate } from '../middleware/validator.js'; // 1. استيراد العسكري والكتالوج

const router = express.Router();

/**
 * --- 1. جلب كل العمليات (GET) ---
 * لا يحتاج فحص، مجرد عرض.
 */
router.get('/', jobController.getAllJobs);

/**
 * --- 2. جلب تفاصيل عملية واحدة ---
 */
router.get('/:id', jobController.getJobById);

/**
 * --- 3. إضافة عملية جديدة (POST) ---
 * الترتيب: الفحص (validate) ثم التنفيذ (controller)
 */
router.post('/', validate(jobSchema), jobController.createJob);

/**
 * --- 4. التعديل (PUT) ---
 */
router.put('/:id', validate(jobSchema), jobController.updateJob);

/**
 * --- 5. الحذف (DELETE) ---
 */
router.delete('/:id', jobController.deleteJob);

export default router;