const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPackingLists = async (req, res) => {
    try {
        const lists = await prisma.packingList.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(lists);
    } catch (error) {
        console.error("❌ Fetch PackingLists Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.createPackingList = async (req, res) => {
    try {
        const data = req.body;

        // 1. معالجة الملفات الجديدة المرفوعة
        const newUploadedFiles = (req.files || []).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: `${req.protocol}://${req.get('host')}/uploads/packing-lists/${file.filename}`,
            description: file.originalname,
            createdAt: new Date().toISOString()
        }));

        // 2. تحويل النصوص القادمة من FormData لمصفوفات
        const products = typeof data.products === 'string' ? JSON.parse(data.products) : (data.products || []);
        const containerNumbers = typeof data.containerNumbers === 'string' ? JSON.parse(data.containerNumbers) : (data.containerNumbers || []);
        
        // 3. استلام المرفقات القديمة (إن وجدت) ودمجها مع الجديدة
        const existingAttachments = data.existingAttachments ? JSON.parse(data.existingAttachments) : [];
        const finalAttachments = [...existingAttachments, ...newUploadedFiles];

        const newList = await prisma.packingList.create({
            data: {
                date: new Date(data.date),
                blNumber: data.blNumber || null,
                clientName: data.clientName,
                invoiceNumber: data.invoiceNumber || null,
                customRelease: data.customRelease || null,
                note: data.note || null,
                shippingAgent: data.shippingAgent || null,
                pol: data.pol || null,
                pod: data.pod || null,
                finalDestination: data.finalDestination || null,
                shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,
                dhlNumber: data.dhlNumber || null,
                numberOfContainers: parseInt(data.numberOfContainers) || 0,
                numberOfProducts: parseInt(data.numberOfProducts) || 0,
                containerNumbers,
                products,
                attachments: finalAttachments // تم التصحيح هنا ✅
            }
        });
        return res.status(201).json(newList);
    } catch (error) {
        console.error("❌ Create PackingList Error:", error);
        return res.status(400).json({ error: "Failed to create: " + error.message });
    }
};

exports.updatePackingList = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const numericId = parseInt(id);

        // 1. معالجة الملفات الجديدة المرفوعة
        const newUploadedFiles = (req.files || []).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: `${req.protocol}://${req.get('host')}/uploads/packing-lists/${file.filename}`,
            description: file.originalname,
            createdAt: new Date().toISOString()
        }));

        
        const keptAttachments = data.existingAttachments ? JSON.parse(data.existingAttachments) : [];
        const finalAttachments = [...keptAttachments, ...newUploadedFiles];

       
        const products = typeof data.products === 'string' ? JSON.parse(data.products) : data.products;
        const containerNumbers = typeof data.containerNumbers === 'string' ? JSON.parse(data.containerNumbers) : data.containerNumbers;

        const updated = await prisma.packingList.update({
            where: { id: numericId },
            data: {
                date: data.date ? new Date(data.date) : undefined,
               shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,
                blNumber: data.blNumber,
                clientName: data.clientName,
                invoiceNumber: data.invoiceNumber,
                customRelease: data.customRelease,
                note: data.note,
                shippingAgent: data.shippingAgent,
                pol: data.pol,
                pod: data.pod,
                finalDestination: data.finalDestination,
                numberOfContainers: data.numberOfContainers ? parseInt(data.numberOfContainers) : undefined,
                numberOfProducts: data.numberOfProducts ? parseInt(data.numberOfProducts) : undefined,
                containerNumbers,
                products,
                attachments: finalAttachments 
            }
        });
        return res.status(200).json(updated);
    } catch (error) {
        console.error("❌ Update PackingList Error:", error);
        return res.status(400).json({ error: "Update failed" });
    }
};

exports.deletePackingList = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) return res.status(400).json({ error: "Invalid ID format" });

        const existing = await prisma.packingList.findUnique({ where: { id: numericId } });
        if (!existing) return res.status(404).json({ error: "Record not found" });

        await prisma.packingList.delete({ where: { id: numericId } });
        
        return res.status(200).json({ 
            success: true, 
            message: "Deleted successfully" 
        });

    } catch (error) {
        console.error("❌ Delete PackingList Error:", error);
        return res.status(500).json({ error: "Delete operation failed" });
    }
};