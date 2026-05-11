import express from 'express';
import * as supplierController from '../controllers/supplierController.js';
// 1. استيراد العسكري (validate) والكتالوج (supplierSchema)
import { supplierSchema, validate } from '../middleware/validator.js'; 

const router = express.Router();
router.use(protect);

// ==========================================
// تعريف الروابط (Routes) للموردين
// ==========================================

// 1. إضافة مورد جديد (POST)
// الترتيب: الفحص أولاً (validate) لضمان أن الاسم والدولة موجودين، ثم التنفيذ
router.post('/', validate(supplierSchema), supplierController.createSupplier);

// 2. جلب قائمة كل الموردين (GET)
// لا يحتاج لـ Validator لأنه جلب بيانات فقط
router.get('/', supplierController.getSuppliers);

// 3. تعديل بيانات مورد (PUT)
// نستخدم validate للتأكد من أن البيانات الجديدة صحيحة قبل التعديل
router.put('/:id', validate(supplierSchema), supplierController.updateSupplier);

// 4. حذف مورد معين بواسطة الـ ID (DELETE)
router.delete('/:id', supplierController.deleteSupplier);

export default router;