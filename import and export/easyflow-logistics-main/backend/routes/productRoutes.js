import express from 'express';
import * as productController from '../controllers/productController.js';
import { productSchema, validate } from '../middleware/validator.js'; 
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

/**
 * --- 1. جلب كل المنتجات (GET) ---
 * عادةً بنسيب المنتجات "مفتوحة" (Public) عشان الكل يشوف الكتالوج، 
 * لكن لو السيستم سري جداً، ضيفي protect قبل الكنترولر.
 */
router.get('/', productController.getAllProducts);

/**
 * --- 2. إضافة منتج جديد (POST) ---
 * الترتيب: 1. حماية -> 2. فحص بيانات -> 3. تنفيذ
 */
router.post(
    '/', 
    protect, 
    validate(productSchema), 
    productController.createProduct
);

/**
 * --- 3. تحديث منتج (PUT) ---
 */
router.put(
    '/:id', 
    protect, 
    validate(productSchema), 
    productController.updateProduct
);

/**
 * --- 4. حذف منتج (DELETE) ---
 */
router.delete('/:id', protect, productController.deleteProduct);

export default router;