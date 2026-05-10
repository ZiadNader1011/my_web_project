const express = require('express');
const router = express.Router();
const containerController = require('../controllers/containerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', containerController.getAllContainers);
router.post('/', containerController.createContainer);

router.put('/:id', containerController.updateContainer); 
router.delete('/:id', containerController.deleteContainer);
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  res.json({
    url: `http://localhost:5000/uploads/${req.file.filename}`
  });
});

module.exports = router;