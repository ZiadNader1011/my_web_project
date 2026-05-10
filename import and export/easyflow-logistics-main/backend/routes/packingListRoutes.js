const express = require('express');
const router = express.Router();
const packingListController = require('../controllers/packingListController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/packing-lists/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


router.get('/', packingListController.getPackingLists);


router.post('/', upload.array('attachments'), packingListController.createPackingList);


router.put('/:id', upload.array('attachments'), packingListController.updatePackingList);

router.delete('/:id', packingListController.deletePackingList);

module.exports = router;