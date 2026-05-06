const prisma = require('../lib/prisma');

// 1. إضافة مورد جديد
exports.createSupplier = async (req, res) => {
    try {
        const { name, country, address, contact, email, phone, vat, agentName } = req.body;
        const newSupplier = await prisma.supplier.create({
            data: {
                name,
                country,
                address: address || null,
                contact: contact || null,
                email: email || null,
                phone: phone || null,
                vat: vat || null,
                agentName: agentName || null
            }
        });
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 2. جلب كل الموردين
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. تعديل مورد (النسخة المنظمة)
exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        // نمرر req.body مباشرة لتبسيط الكود، أو نحدد الحقول بدقة
        const updated = await prisma.supplier.update({
            where: { id: Number(id) },
            data: {
                ...req.body // هيأخد كل الحقول المبعوثة من الفرونت إند
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4. حذف مورد
exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        
        // لو مش عاملة Cascade في الـ Schema، لازم تمسحي المنتجات يدوياً هنا الأول:
        // await prisma.product.deleteMany({ where: { supplierId: Number(id) } });

        await prisma.supplier.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
        console.error("Delete Supplier Error:", error.message);
        res.status(400).json({ 
            error: "Cannot delete supplier: Check if they have linked products or jobs." 
        });
    }
};