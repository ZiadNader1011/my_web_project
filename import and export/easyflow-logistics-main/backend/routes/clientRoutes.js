import express from 'express';
// ✅ استوردنا الـ Schema والدالة العامة validate مباشرة
import { clientSchema, validate } from '../middleware/validator.js'; 
import * as clientController from '../controllers/clientController.js';

const router = express.Router();

// --- العمليات التي لا تحتاج فحص (GET) ---
router.get('/', clientController.getAllClients); 
router.get('/:id', clientController.getClientDetails);

// --- العمليات التي تحتاج فحص (POST & PUT) ---
// ✅ استخدمنا validate(clientSchema) في سطر واحد بدل تعريف دالة جديدة
router.post('/', validate(clientSchema), clientController.createClient);
router.put('/:id', validate(clientSchema), clientController.updateClient);

// --- الحذف ---
router.delete('/:id', clientController.deleteClient);

export default router;