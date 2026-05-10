import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

const router = Router();
const controller = new DashboardController();

router.get('/overview', controller.getOverview);

export default router;