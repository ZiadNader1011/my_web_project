const express = require('express');
const router = express.Router();
const packingListController = require('../controllers/packingListController');

// المسار الأساسي: /api/packing-lists
router.get('/', packingListController.getPackingLists);
router.post('/', packingListController.createPackingList);
router.put('/:id', packingListController.updatePackingList);
router.delete('/:id', packingListController.deletePackingList);

module.exports = router;