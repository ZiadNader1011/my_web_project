const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// جلب كل العملاء
router.get('/', clientController.getClients);

// إضافة عميل جديد
router.post('/', clientController.createClient);

// تعديل عميل
router.put('/:id', clientController.updateClient);

// حذف عميل
router.delete('/:id', clientController.deleteClient);

module.exports = router;