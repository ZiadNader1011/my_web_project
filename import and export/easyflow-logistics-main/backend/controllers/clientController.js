const prisma = require('../lib/prisma');

// جلب كل العملاء
exports.getClients = async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// إضافة عميل جديد
exports.createClient = async (req, res) => {
    try {
        const { 
            name, country, company, email, phone, 
            telephone, fax, contact, address, 
            vat, agentName, dhl 
        } = req.body;

        const newClient = await prisma.client.create({
            data: {
                name,
                country: country || null,
                company: company || null,
                email: email || null,
                phone: phone || null,
                telephone: telephone || null,
                fax: fax || null,
                contact: contact || null,
                address: address || null,
                vat: vat || null,
                agentName: agentName || null,
                dhl: dhl || null
            }
        });
        res.status(201).json(newClient);
    } catch (error) {
        console.error("Create Client Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// تعديل عميل
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.client.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// حذف عميل
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.client.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};