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
        console.error("Error creating supplier:", error);
        res.status(400).json({ error: error.message });
    }
};

// 2. جلب كل الموردين
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' } // ترتيب أبجدي للـ "هندمة"
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. تعديل مورد (إضافة الدالة المفقودة)
// 3. تعديل مورد (النسخة المصححة)
exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country, contact, email, phone, product } = req.body; 

        const updated = await prisma.supplier.update({
            where: { id: Number(id) }, // التعديل هنا: حولنا الـ id لرقم
            data: {
                name,
                country,
                contact: contact || null,
                email: email || null,
                phone: phone || null,
                agentName: product || null 
            }
        });
        
        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// 4. مسح مورد
exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.supplier.delete({
            where: { id: Number(id) } // التعديل هنا أيضاً
        });
        res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};