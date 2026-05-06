const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// إعداد multer (يفضل استخدام نفس إعدادات server.js لتوحيد الأسماء)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// 1. إضافة سجل جديد (POST)
router.post('/', upload.single('pdfFile'), async (req, res) => {
    try {
        const data = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newRecord = await prisma.shippingAgentRecord.create({
            data: {
                // تحويل الـ IDs لأرقام لأن Postgres بيرفض الـ String في خانة الـ Int
                agentId: parseInt(data.agentId), 
                date: new Date(data.date), 
                // التعامل مع الـ jobId بحذر
                jobId: (data.jobId === 'none' || !data.jobId) ? null : parseInt(data.jobId),
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

        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Error creating record:", error);
        res.status(500).json({ error: error.message });
    }
});


// 2. جلب السجلات (GET)
router.get('/', async (req, res) => {
    try {
        const records = await prisma.shippingAgentRecord.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. حذف سجل (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.shippingAgentRecord.delete({
            where: { id: parseInt(id) } // تحويل الـ ID لـ Integer
        });
        res.json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: error.message });
    }
});