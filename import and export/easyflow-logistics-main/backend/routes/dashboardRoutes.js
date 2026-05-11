import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
// import { validateQuery, dashboardSchema } from '../middleware/validator.js'; // لو هتفعلي الفلاتر مستقبلاً

const router = Router();

/**
 * [GET] /api/dashboard
 * جلب ملخص عام لكل العمليات (حاويات، عمولات، فواتير، إلخ)
 */
router.get("/", getDashboardSummary); 

// مثال لو حبتي تضيفي فلاتر مستقبلاً:
// router.get("/summary", validateQuery(dashboardSchema), getDashboardSummary);

export default router;