require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


// 1. استيراد الـ Routes (لازم يكون فوق قبل الاستخدام)
const supplierRoutes = require('./routes/supplierRoutes');
const jobRoutes = require('./routes/jobRoutes');
const shippingAgentRoutes = require('./routes/shippingAgentRoutes'); 
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const containerRoutes = require('./routes/containerRoutes');
const packingListRoutes = require('./routes/packingListRoutes');

// 2. إعداد مجلد الرفع
const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); 

// 4. استخدام الـ Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/shipping-agent-records', shippingAgentRoutes); 
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/containers', containerRoutes); // تم نقل السطر هنا بعد التعريف
app.use('/api/packing-lists', packingListRoutes);

// 5. مسار الرفع المباشر
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.get('/', (req, res) => {
    res.send("EasyFlow Logistics Backend is Running! 🚀");
});

// 6. تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} 🚀`);
});