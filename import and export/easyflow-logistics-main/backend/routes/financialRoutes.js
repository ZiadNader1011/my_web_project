const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/financials/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `FIN-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });


router.get('/', financialController.getTransactions);


router.post('/', upload.none(), financialController.createTransaction);


router.put('/:id', upload.none(), financialController.updateTransaction);


router.delete('/:id', financialController.deleteTransaction); 

module.exports = router;