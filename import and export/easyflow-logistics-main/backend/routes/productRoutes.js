import express from 'express';
import * as productController from '../controllers/productController.js';
import { productSchema, validate } from '../middleware/validator.js'; // 1. الاستيراد

const router = express.Router();

/**
 * --- 1. جلب كل المنتجات (GET) ---
 */
router.get('/', productController.getAllProducts);

/**
 * --- 2. إضافة منتج جديد (POST) ---
 * validate(productSchema) بيضمن إن السعر رقم والاسم موجود
 */
router.post('/', validate(productSchema), productController.createProduct);

/**
 * --- 3. تحديث منتج (PUT) ---
 */
router.put('/:id', validate(productSchema), productController.updateProduct);

/**
 * --- 4. حذف منتج (DELETE) ---
 */
router.delete('/:id', productController.deleteProduct);

export default router;