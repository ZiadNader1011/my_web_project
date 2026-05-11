import express from 'express';
const router = express.Router();
import multer from 'multer';
import fs from 'fs';
import { prisma } from '../lib/prisma.js';

const uploadDir = './uploads/commissions/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });


router.post('/', upload.array('attachments'), async (req, res) => {
    try {
        const data = req.body;
        
        const newFiles = (req.files || []).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: `${req.protocol}://${req.get('host')}/uploads/commissions/${file.filename}`,
            description: file.originalname,
            createdAt: new Date().toISOString()
        }));

        const newCommission = await prisma.commission.create({
            data: {
                date: new Date(data.date), 
                clientName: data.clientName,
                trader: data.trader || '',
                product: data.product || '',
                qualityRepresentative: data.qualityRepresentative || '',
                numberOfContainers: parseInt(data.numberOfContainers) || 0,
                totalQuantityTon: parseFloat(data.totalQuantityTon) || 0,
                commissionPerTon: parseFloat(data.commissionPerTon) || 0,
                currency: data.currency || 'USD',
                attachments: newFiles
            }
        });
        res.status(201).json(newCommission);
    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const records = await prisma.commission.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', upload.array('attachments'), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

      
        let currentAttachments = [];
        if (data.attachments) {
            currentAttachments = typeof data.attachments === 'string' 
                ? JSON.parse(data.attachments) 
                : data.attachments;
        }

       
        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: `${req.protocol}://${req.get('host')}/uploads/commissions/${file.filename}`,
                description: file.originalname,
                createdAt: new Date().toISOString()
            }));
            currentAttachments = [...currentAttachments, ...newFiles];
        }

        const updated = await prisma.commission.update({
            where: { id: parseInt(id) },
            data: {
                date: data.date ? new Date(data.date) : undefined,
                clientName: data.clientName,
                trader: data.trader,
                product: data.product,
                qualityRepresentative: data.qualityRepresentative,
                numberOfContainers: parseInt(data.numberOfContainers) || 0,
                totalQuantityTon: parseFloat(data.totalQuantityTon) || 0,
                commissionPerTon: parseFloat(data.commissionPerTon) || 0,
                currency: data.currency,
                attachments: currentAttachments 
            }
        });
        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
       
        await prisma.commission.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;