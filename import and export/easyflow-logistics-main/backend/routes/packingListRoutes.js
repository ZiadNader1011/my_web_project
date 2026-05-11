import express from 'express';
const router = express.Router();
import * as packingListController from '../controllers/packingListController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


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

export default router;
