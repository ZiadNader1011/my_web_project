import express from 'express';
import * as packingListController from '../controllers/packingListController.js';
import upload from '../middleware/upload.js'; 
import { packingListSchema, validate } from '../middleware/validator.js'; 
import { protect } from '../middleware/auth.js'; // 1. استيراد بوابة الحماية

const router = express.Router();

/**
 * --- 1. جلب قوائم التعبئة (Read) ---
 * بنضيف protect عشان نضمن إن الموظفين بس اللي يشوفوا قوائم التعبئة
 */
router.get('/', protect, packingListController.getPackingLists);

/**
 * --- 2. إضافة قائمة تعبئة جديدة (Create) ---
 * الترتيب "المضاد للرصاص":
 * 1. protect: هل إنت مسجل دخول؟ (لو لأ، اخرج فوراً).
 * 2. upload.array: لو إنت مسجل، ابدأ فك الملفات والداتا اللي باعتها.
 * 3. validate: اتأكد إن الداتا اللي اتفكت مطابقة للشروط.
 * 4. Controller: سجل في الداتابيز.
 */
router.post(
    '/', 
    protect, 
    upload.array('attachments'), 
    validate(packingListSchema), 
    packingListController.createPackingList
);

/**
 * --- 3. تحديث قائمة تعبئة (Update) ---
 */
router.put(
    '/:id', 
    protect, 
    upload.array('attachments'), 
    validate(packingListSchema), 
    packingListController.updatePackingList
);

/**
 * --- 4. حذف قائمة تعبئة (Delete) ---
 */
router.delete('/:id', protect, packingListController.deletePackingList);

export default router;