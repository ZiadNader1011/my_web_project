import express from 'express';
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية
import { clientSchema, validate } from '../middleware/validator.js'; 
import * as clientController from '../controllers/clientController.js';

const router = express.Router();

/**
 * --- العمليات المفتوحة (Public) ---
 * مسموح للموظفين أو النظام برؤية البيانات
 */
router.get('/', clientController.getAllClients); 
router.get('/:id', clientController.getClientDetails);

/**
 * --- العمليات المحمية (Protected) ---
 * تتطلب وجود Token سليم + فحص للبيانات المرسلة
 */

// الترتيب: 1. حماية (Auth) -> 2. فحص (Validation) -> 3. تنفيذ (Controller)
router.post('/', protect, validate(clientSchema), clientController.createClient);
router.put('/:id', protect, validate(clientSchema), clientController.updateClient);

// الحذف محمي طبعاً لمنع الكوارث
router.delete('/:id', protect, clientController.deleteClient);

export default router;