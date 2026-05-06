const prisma = require('../lib/prisma');

// 1. جلب كل العملاء مع عدد الـ Jobs الخاصة بكل واحد
exports.getClients = async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            include: {
                _count: {
                    select: { jobs: true } // بيعرفك العميل ده عمل كام شحنة/وظيفة
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(clients);
    } catch (error) {
        console.error("Fetch Clients Error:", error);
        res.status(500).json({ error: "Failed to load clients list" });
    }
};

// 2. إضافة عميل جديد مع التحقق من عدم التكرار
exports.createClient = async (req, res) => {
    try {
        const data = req.body;

        // التحقق من الاسم (Validation بسيط)
        if (!data.name || data.name.trim() === "") {
            return res.status(400).json({ error: "Client name is required" });
        }

        const newClient = await prisma.client.create({
            data: {
                name: data.name,
                country: data.country || null,
                company: data.company || null,
                email: data.email?.toLowerCase() || null, // توحيد حالة الإيميل
                phone: data.phone || null,
                telephone: data.telephone || null,
                fax: data.fax || null,
                contact: data.contact || null,
                address: data.address || null,
                vat: data.vat || null,
                agentName: data.agentName || null,
                dhl: data.dhl || null,
                balance: parseFloat(data.balance) || 0
            }
        });

        res.status(201).json(newClient);
    } catch (error) {
        console.error("Create Client Error:", error);
        // التعامل مع خطأ تكرار الإيميل (Unique Constraint)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "A client with this email already exists" });
        }
        res.status(400).json({ error: "Failed to create client record" });
    }
};

// 3. تعديل عميل (بذكاء: تحديث الحقول المرسلة فقط)
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updated = await prisma.client.update({
            where: { id: Number(id) },
            data: {
                ...data,
                // تأكيد تحويل الـ balance لرقم لو اتبعث في التعديل
                balance: data.balance !== undefined ? parseFloat(data.balance) : undefined
            }
        });

        res.json({
            message: "Client updated successfully",
            client: updated
        });
    } catch (error) {
        console.error("Update Client Error:", error);
        res.status(400).json({ error: "Failed to update client info" });
    }
};

// 4. جلب تفاصيل عميل واحد (لمشاهدة بروفايل العميل)
exports.getClientDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.client.findUnique({
            where: { id: Number(id) },
            include: {
                jobs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10 // جلب آخر 10 وظائف للعميل ده
                }
            }
        });

        if (!client) return res.status(404).json({ error: "Client not found" });
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: "Error fetching client details" });
    }
};

// 5. حذف عميل
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.client.delete({
            where: { id: Number(id) }
        });

        res.json({ message: "Client and all related history deleted successfully" });
    } catch (error) {
        console.error("Delete Client Error:", error);
        res.status(400).json({ 
            error: "Cannot delete client. Ensure they have no active jobs first or check server logs." 
        });
    }
};