import express from 'express';
const router = express.Router();
// ✅ لازم تضيفي .js في الآخر
import * as supplierController from '../controllers/supplierController.js';

// ==========================================
// تعريف الروابط (Routes) للموردين
// ==========================================

// 1. إضافة مورد جديد (POST)
// الرابط: http://localhost:5000/api/suppliers
router.post('/', supplierController.createSupplier);

// 2. جلب قائمة كل الموردين (GET)
// الرابط: http://localhost:5000/api/suppliers
// تم التصحيح: هنا نستدعي الدالة من الـ controller وليس رابط URL
router.get('/', supplierController.getSuppliers);

// 3. تعديل بيانات مورد (PUT)
// الرابط: http://localhost:5000/api/suppliers/:id
router.put('/:id', supplierController.updateSupplier);

// 4. حذف مورد معين بواسطة الـ ID (DELETE)
// الرابط: http://localhost:5000/api/suppliers/:id
router.delete('/:id', supplierController.deleteSupplier);

export default router;