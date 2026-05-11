import express from 'express';
import upload from '../middleware/upload.js'; // استدعاء الموديول المركزي
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// --- 1. إضافة عمولة جديدة (Create) ---
router.post('/', upload.array('attachments'), async (req, res) => {
    try {
        const data = req.body;
        
        // معالجة الملفات المرفوعة
        const newFiles = (req.files || []).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            // لاحظي هنا بنستخدم الفولدر العام uploads اللي في الـ middleware
            url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
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
                attachments: newFiles // حفظ المصفوفة في قاعدة البيانات
            }
        });

        return res.status(201).json(newCommission);
    } catch (error) {
        console.error("Create Error:", error);
        return res.status(500).json({ error: "فشل في إنشاء السجل، تأكد من البيانات" });
    }
});

// --- 2. جلب كل العمولات (Read) ---
router.get('/', async (req, res) => {
    try {
        const records = await prisma.commission.findMany({
            orderBy: { date: 'desc' }
        });
        return res.json(records);
    } catch (error) {
        return res.status(500).json({ error: "فشل في جلب البيانات" });
    }
});

// --- 3. تحديث عمولة (Update) ---
router.put('/:id', upload.array('attachments'), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // معالجة المرفقات القديمة
        let currentAttachments = [];
        if (data.attachments) {
            currentAttachments = typeof data.attachments === 'string' 
                ? JSON.parse(data.attachments) 
                : data.attachments;
        }

        // إضافة المرفقات الجديدة (إن وجدت)
        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
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
        return res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ error: "فشل في تحديث البيانات" });
    }
});

// --- 4. حذف عمولة (Delete) ---
router.delete('/:id', async (req, res) => {
    try {
        await prisma.commission.delete({
            where: { id: parseInt(req.params.id) }
        });
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: "حدث خطأ أثناء الحذف" });
    }
});

export default router;