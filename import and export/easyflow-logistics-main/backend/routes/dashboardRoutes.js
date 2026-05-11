import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = Router();

/**
 * [GET] /api/dashboard
 * جلب ملخص عام لكل العمليات (حاويات، عمولات، فواتير، إلخ)
 * تم إضافة protect لضمان أن المدير أو الموظف المصرح له فقط هو من يرى الإحصائيات
 */
router.get("/", protect, getDashboardSummary); 

export default router;