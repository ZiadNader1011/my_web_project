const express = require('express');
const router = express.Router();
const containerController = require('../controllers/containerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. التأكد من وجود مجلد الـ uploads تلقائياً عشان السيرفر ميعملش Error
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. إعداد تخزين الملفات (Multer Config)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // اسم فريد للملف: وقت الرفع + رقم عشوائي
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 3. المسارات (Routes)
router.get('/', containerController.getAllContainers);
router.post('/', containerController.createContainer);

// الـ :id هنا سيستقبله الـ Controller ويحوله لـ Number(id) كما فعلنا في التعديل السابق
router.put('/:id', containerController.updateContainer); 
router.delete('/:id', containerController.deleteContainer);

// 4. مسار رفع الملفات (Upload API)
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // الرابط الذي سيتم إرساله للفرونت إند لحفظه في الداتابيز
  res.json({
    url: `http://localhost:5000/uploads/${req.file.filename}`
  });
});

module.exports = router;