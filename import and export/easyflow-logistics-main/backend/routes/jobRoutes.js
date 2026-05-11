import express from 'express';
const router = express.Router();
import * as jobController from '../controllers/jobController.js';

// 1. جلب كل العمليات
// GET /api/jobs
router.get('/', jobController.getAllJobs);

// 2. إضافة عملية جديدة
// POST /api/jobs
router.post('/', jobController.createJob);

// 3. جلب تفاصيل عملية واحدة (المستخدمة في JobDetails.tsx)
// GET /api/jobs/:id
router.get('/:id', jobController.getJobById);

// 4. التعديل (تم إزالة كلمة update ليكون الرابط قياسياً)
// PUT /api/jobs/:id
router.put('/:id', jobController.updateJob);

// 5. الحذف (تم إزالة كلمة delete ليكون الرابط قياسياً)
// DELETE /api/jobs/:id
router.delete('/:id', jobController.deleteJob);

export default router;