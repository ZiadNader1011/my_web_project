import express from 'express';
import * as supplierController from '../controllers/supplierController.js';
import { supplierSchema, validate } from '../middleware/validator.js'; 
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

// ==========================================
// تعريف الروابط (Routes) للموردين
// ==========================================

// 1. إضافة مورد جديد (POST)
// الترتيب: 1. حماية (Auth) -> 2. فحص بيانات (Validate) -> 3. تنفيذ
router.post('/', protect, validate(supplierSchema), supplierController.createSupplier);

// 2. جلب قائمة كل الموردين (GET)
// الأفضل حمايتها بـ protect عشان مفيش حد غريب يسحب قائمة الموردين بتوعك
router.get('/', protect, supplierController.getSuppliers);

// 3. تعديل بيانات مورد (PUT)
router.put('/:id', protect, validate(supplierSchema), supplierController.updateSupplier);

// 4. حذف مورد معين (DELETE)
router.delete('/:id', protect, supplierController.deleteSupplier);

export default router;