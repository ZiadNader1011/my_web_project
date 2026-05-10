const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const upload = multer({ dest: 'uploads/' });


router.post('/', upload.single('file'), async (req, res) => {
    try {
        const data = req.body;
        const fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

        const newAgent = await prisma.shippingAgent.create({
            data: {
                name: data.name,
                company: data.company || null,
                address: data.address || null,
                telephone: data.telephone || null,
                personalNumber: data.personalNumber || null,
                email: data.email || null,
                attachmentUrl: fileUrl
            }
        });
        res.status(201).json(newAgent);
    } catch (error) {
        console.error("Create Agent Error:", error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const agents = await prisma.shippingAgent.findMany({
            orderBy: { id: 'desc' }
        });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.put('/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const updateData = {
            name: data.name,
            company: data.company || null,
            address: data.address || null,
            telephone: data.telephone || null,
            personalNumber: data.personalNumber || null,
            email: data.email || null,
        };

        if (req.file) {
            updateData.attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const updated = await prisma.shippingAgent.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// التعديل في الباك إند (shippingAgentRoutes.js)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        // 1. نتحقق أولاً هل السجل موجود؟
        const record = await prisma.shippingAgent.findUnique({
            where: { id: numericId }
        });

        // 2. لو مش موجود (اتمسح فعلاً)، نرد بنجاح "Success" عشان الفرونت إند يسكت
        if (!record) {
            return res.status(200).json({ success: true, message: "Already deleted" });
        }

        // 3. لو موجود، نمسحه
        await prisma.shippingAgent.delete({
            where: { id: numericId }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;