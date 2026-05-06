const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// جلب كل القوائم
exports.getPackingLists = async (req, res) => {
    try {
        const lists = await prisma.packingList.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(lists);
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
};

// إضافة قائمة جديدة
exports.createPackingList = async (req, res) => {
    try {
        const data = req.body;
        const newList = await prisma.packingList.create({
            data: {
                date: new Date(data.date),
                blNumber: data.blNumber,
                clientName: data.clientName,
                invoiceNumber: data.invoiceNumber,
                customRelease: data.customRelease,
                note: data.note,
                shippingAgent: data.shippingAgent,
                pol: data.pol,
                pod: data.pod,
                finalDestination: data.finalDestination,
                shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,
                containerNumbers: data.containerNumbers || [], // سيتم تخزينها كـ JSON
                products: data.products || [],           // سيتم تخزينها كـ JSON
                attachments: data.attachments || [],     // سيتم تخزينها كـ JSON
            }
        });
        res.status(201).json(newList);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "فشل في إنشاء القائمة" });
    }
};

// تحديث قائمة موجودة
exports.updatePackingList = async (req, res) => {
    const { id } = req.params;
    try {
        const data = req.body;
        const updated = await prisma.packingList.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                shippingDate: data.shippingDate ? new Date(data.shippingDate) : undefined,
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: "فشل في تحديث البيانات" });
    }
};

// حذف قائمة
exports.deletePackingList = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.packingList.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "تم الحذف بنجاح" });
    } catch (error) {
        res.status(400).json({ error: "فشل في الحذف" });
    }
};