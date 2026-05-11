import express from 'express';
import * as containerController from '../controllers/containerController.js';
import upload from '../middleware/upload.js'; // استدعاء الموديول المركزي الجديد

const router = express.Router();

// --- العمليات الأساسية ---
router.get('/', containerController.getAllContainers);
router.post('/', containerController.createContainer);
router.put('/:id', containerController.updateContainer); 
router.delete('/:id', containerController.deleteContainer);

// --- عملية رفع الملفات (بقت أنظف بكتير) ---
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // ملحوظة: يفضل استخدام req.get('host') بدل localhost عشان يشتغل على أي جهاز
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  return res.json({
    url: `${baseUrl}/uploads/${req.file.filename}`
  });
});

export default router;