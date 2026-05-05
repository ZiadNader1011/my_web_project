const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// جلب الكل
router.get('/', jobController.getAllJobs);

// إضافة جديد
router.post('/', jobController.createJob);

// جلب تفاصيل وظيفة واحدة (مهم جداً لملف JobDetails.tsx)
router.get('/:id', jobController.getJobById);

// التعديل - لو الـ Frontend بيبعت على api/jobs/update/1
router.put('/update/:id', jobController.updateJob);

// الحذف - لو الـ Frontend بيبعت على api/jobs/delete/1
router.delete('/delete/:id', jobController.deleteJob);

module.exports = router;