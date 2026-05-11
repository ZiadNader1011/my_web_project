import express from 'express';
import upload from '../middleware/upload.js'; // الاستيراد من الميدل وير المركزي
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// [POST] إضافة وكيل جديد
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const data = req.body;
        // استخدام الرابط الموحد للملفات
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
        return res.status(201).json(newAgent);
    } catch (error) {
        console.error("Create Agent Error:", error);
        return res.status(500).json({ error: "حدث خطأ أثناء إضافة الوكيل" });
    }
});

// [GET] جلب كل الوكلاء
router.get('/', async (req, res) => {
    try {
        const agents = await prisma.shippingAgent.findMany({
            orderBy: { id: 'desc' }
        });
        return res.json(agents);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// [PUT] تحديث بيانات وكيل
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
        return res.json(updated);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// [DELETE] حذف وكيل
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        const record = await prisma.shippingAgent.findUnique({
            where: { id: numericId }
        });

        if (!record) {
            return res.status(200).json({ success: true, message: "Already deleted" });
        }

        await prisma.shippingAgent.delete({
            where: { id: numericId }
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server Error" });
    }
});

export default router;