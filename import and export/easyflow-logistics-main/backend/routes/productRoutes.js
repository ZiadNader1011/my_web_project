import express from 'express';
const router = express.Router();
import * as productController from '../controllers/productController.js';


router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;