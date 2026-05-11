import express from 'express';
import * as packingListController from '../controllers/packingListController.js';
import upload from '../middleware/upload.js'; // استدعاء الموديول المركزي

const router = express.Router();

// --- 1. جلب قوائم التعبئة (Read) ---
router.get('/', packingListController.getPackingLists);

// --- 2. إضافة قائمة تعبئة جديدة (Create) ---
// بنستخدم upload.array مباشرة من الموديول اللي استوردناه
router.post('/', upload.array('attachments'), packingListController.createPackingList);

// --- 3. تحديث قائمة تعبئة (Update) ---
router.put('/:id', upload.array('attachments'), packingListController.updatePackingList);

// --- 4. حذف قائمة تعبئة (Delete) ---
router.delete('/:id', packingListController.deletePackingList);

export default router;