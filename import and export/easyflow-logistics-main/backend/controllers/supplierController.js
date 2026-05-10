const prisma = require('../lib/prisma');

// 1. إضافة مورد جديد
exports.createSupplier = async (req, res) => {
    try {
        const { name, country, address, contact, email, phone, vat, product } = req.body;
        
        const newSupplier = await prisma.supplier.create({
            data: {
                name,
                country,
                address: address || null,
                contact: contact || null,
                email: email || null,
                phone: phone || null,
                vat: vat || null,
                product: product || null // تم التعديل ليتوافق مع السكيما الجديدة ✅
            }
        });
        res.status(201).json(newSupplier);
    } catch (error) {
        console.error("Create Error:", error.message);
        res.status(400).json({ error: error.message });
    }
};

// 2. تعديل مورد (Update)
exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updated = await prisma.supplier.update({
            where: { id: Number(id) },
            data: {
                name: data.name,
                country: data.country,
                address: data.address,
                contact: data.contact,
                email: data.email,
                phone: data.phone,
                vat: data.vat,
                product: data.product 
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error.message);
        res.status(400).json({ error: "Failed to update: " + error.message });
    }
};
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
exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await prisma.supplier.deleteMany({
            where: { id: Number(id) }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: "Supplier already deleted or not found" });
        }

        res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: "Failed to delete" });
    }
};