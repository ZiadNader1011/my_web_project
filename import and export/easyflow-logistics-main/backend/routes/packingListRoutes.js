import express from 'express';
import * as packingListController from '../controllers/packingListController.js';
import upload from '../middleware/upload.js'; 
import { packingListSchema, validate } from '../middleware/validator.js'; // 1. استيراد العسكري والكتالوج

const router = express.Router();

/**
 * --- 1. جلب قوائم التعبئة (Read) ---
 */
router.get('/', packingListController.getPackingLists);

/**
 * --- 2. إضافة قائمة تعبئة جديدة (Create) ---
 * الترتيب: الرفع -> الفحص -> الكنترولر
 */
router.post(
    '/', 
    upload.array('attachments'), 
    validate(packingListSchema), 
    packingListController.createPackingList
);

/**
 * --- 3. تحديث قائمة تعبئة (Update) ---
 */
router.put(
    '/:id', 
    upload.array('attachments'), 
    validate(packingListSchema), 
    packingListController.updatePackingList
);

/**
 * --- 4. حذف قائمة تعبئة (Delete) ---
 */
router.delete('/:id', packingListController.deletePackingList);

export default router;