import express from 'express';
import upload from '../middleware/upload.js'; // استدعاء الموديول المركزي
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// [POST] إضافة سجل فاتورة لوكيل
router.post('/', upload.single('pdfFile'), async (req, res) => {
    try {
        const data = req.body;
        // استخدام الرابط الديناميكي بناءً على الملف المرفوع من الميدل وير المركزي
        const fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
        
        const newRecord = await prisma.shippingAgentRecord.create({
            data: {
                agentId: parseInt(data.agentId), 
                date: new Date(data.date), 
                jobId: (data.jobId === 'none' || !data.jobId || data.jobId === "") ? null : parseInt(data.jobId),
                blNumber: data.blNumber || '',
                country: data.country || '',
                containerCount: parseInt(data.containerCount) || 0,
                costEgp: parseFloat(data.costEgp) || 0,
                costEgpNote: data.costEgpNote || '',
                costEuro: parseFloat(data.costEuro) || 0,
                costEuroNote: data.costEuroNote || '',
                costUsd: parseFloat(data.costUsd) || 0,
                costUsdNote: data.costUsdNote || '',
                pdfUrl: fileUrl, 
            }
        });
        return res.status(201).json(newRecord);
    } catch (error) {
        console.error("Record Create Error:", error);
        return res.status(500).json({ error: "فشل في إنشاء السجل، تأكد من البيانات" });
    }
});

// [GET] جلب كل سجلات الفواتير
router.get('/', async (req, res) => {
    try {
        const records = await prisma.shippingAgentRecord.findMany({
            include: { agent: true, job: true }, 
            orderBy: { date: 'desc' }
        });
        return res.json(records);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// [DELETE] حذف سجل
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.shippingAgentRecord.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ error: "Record not found" });
        }

        await prisma.shippingAgentRecord.delete({
            where: { id: parseInt(id) }
        });
        
        return res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("Delete Record Error:", error);
        return res.status(500).json({ error: "Failed to delete" });
    }
});

// [PUT] تحديث سجل
router.put('/:id', upload.single('pdfFile'), async (req, res) => {
    try {
        const data = req.body;
        const updateData = {
            agentId: parseInt(data.agentId),
            date: new Date(data.date),
            jobId: (data.jobId === 'none' || !data.jobId || data.jobId === "") ? null : parseInt(data.jobId),
            blNumber: data.blNumber || '',
            country: data.country || '',
            containerCount: parseInt(data.containerCount) || 0,
            costEgp: parseFloat(data.costEgp) || 0,
            costEuro: parseFloat(data.costEuro) || 0,
            costUsd: parseFloat(data.costUsd) || 0,
            costEgpNote: data.costEgpNote || '',
            costEuroNote: data.costEuroNote || '',
            costUsdNote: data.costUsdNote || '',
        };

        if (req.file) {
            updateData.pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const updated = await prisma.shippingAgentRecord.update({
            where: { id: parseInt(req.params.id) },
            data: updateData
        });
        return res.json(updated);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;