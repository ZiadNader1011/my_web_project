const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../uploads/commissions');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


exports.getCommissions = async (req, res) => {
    try {
        const commissions = await prisma.commission.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(commissions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch commissions" });
    }
};


exports.createCommission = async (req, res) => {
    try {
        const data = req.body;
        
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: `${req.protocol}://${req.get('host')}/uploads/commissions/${file.filename}`,
                description: file.originalname,
                createdAt: new Date().toISOString()
            }));
        }

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
                attachments: attachments 
            }
        });
        res.status(201).json(newCommission);
    } catch (error) {
        console.error("❌ CREATE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.updateCommission = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existing = await prisma.commission.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ error: "Not found" });

        
        let keptAttachments = [];
        if (data.attachments) {
            keptAttachments = typeof data.attachments === 'string' 
                ? JSON.parse(data.attachments) 
                : data.attachments;
        }

       
        let newFiles = [];
        if (req.files && req.files.length > 0) {
            newFiles = req.files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: `${req.protocol}://${req.get('host')}/uploads/commissions/${file.filename}`,
                description: file.originalname,
                createdAt: new Date().toISOString()
            }));
        }

        const finalAttachments = [...keptAttachments, ...newFiles];

        const updated = await prisma.commission.update({
            where: { id: parseInt(id) },
            data: {
                date: data.date ? new Date(data.date) : existing.date,
                clientName: data.clientName !== undefined ? data.clientName : existing.clientName,
                trader: data.trader !== undefined ? data.trader : existing.trader,
                product: data.product !== undefined ? data.product : existing.product,
                qualityRepresentative: data.qualityRepresentative !== undefined ? data.qualityRepresentative : existing.qualityRepresentative,
                numberOfContainers: data.numberOfContainers !== undefined ? parseInt(data.numberOfContainers) : existing.numberOfContainers,
                totalQuantityTon: data.totalQuantityTon !== undefined ? parseFloat(data.totalQuantityTon) : existing.totalQuantityTon,
                commissionPerTon: data.commissionPerTon !== undefined ? parseFloat(data.commissionPerTon) : existing.commissionPerTon,
                currency: data.currency || existing.currency,
                attachments: finalAttachments
            }
        });
        res.json(updated);
    } catch (error) {
        console.error("❌ UPDATE ERROR:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCommission = async (req, res) => {
    try {
        const { id } = req.params;
        const commission = await prisma.commission.findUnique({ where: { id: parseInt(id) } });
        
        if (commission && Array.isArray(commission.attachments)) {
            commission.attachments.forEach(file => {
                try {
                    const fileName = file.url.split('/').pop();
                    const filePath = path.join(uploadDir, fileName);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.log("File already deleted or path error");
                }
            });
        }

        await prisma.commission.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: "Delete failed" });
    }
};