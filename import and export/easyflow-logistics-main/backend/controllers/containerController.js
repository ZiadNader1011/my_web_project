const prisma = require('../lib/prisma');

// 1. جلب كل الحاويات مع بياناتها بالكامل
exports.getAllContainers = async (req, res) => {
    try {
        const containers = await prisma.container.findMany({
            include: {
                products: {
                    include: { product: true } // جلب تفاصيل المنتج الأساسية
                },
                attachments: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(containers);
    } catch (error) {
        console.error("Fetch Containers Error:", error);
        res.status(500).json({ error: "Failed to fetch containers" });
    }
};

// 2. إنشاء حاوية جديدة (معالجة الصور والمنتجات)
exports.createContainer = async (req, res) => {
    try {
        const data = req.body;

        // التحقق من البيانات الأساسية
        if (!data.containerNumber) {
            return res.status(400).json({ error: "Container number is required" });
        }

        const newContainer = await prisma.container.create({
            data: {
                containerNumber: data.containerNumber,
                sourcePort: data.sourcePort || null,
                destinationPort: data.destinationPort || null,
                shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,
                arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
                status: data.status || 'loading',
                
                // إضافة المنتجات
                products: {
                    create: data.products ? JSON.parse(data.products).map(p => ({
                        productId: Number(p.productId),
                        quantity: Number(p.quantity) || 0,
                        unit: p.unit || "KG",
                        packages: Number(p.packages) || 0,
                        netWeight: Number(p.netWeight) || 0,
                        grossWeight: Number(p.grossWeight) || 0,
                        packageType: p.packageType || null
                    })) : []
                },

                // إضافة المرفقات (الروابط اللي جاية من الـ Frontend بعد الرفع)
                attachments: {
                    create: data.attachments ? JSON.parse(data.attachments).map(a => ({
                        url: a.url,
                        description: a.description || ''
                    })) : []
                }
            },
            include: { products: true, attachments: true }
        });

        res.status(201).json(newContainer);
    } catch (error) {
        console.error("Create Container Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// 3. التعديل (باستخدام Transaction لضمان سلامة البيانات)
exports.updateContainer = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. مسح العلاقات القديمة أولاً (المنتجات والمرفقات)
            await tx.containerProduct.deleteMany({ where: { containerId: Number(id) } });
            await tx.attachment.deleteMany({ where: { containerId: Number(id) } });

            // 2. تحديث الحاوية وإعادة إنشاء العلاقات بالبيانات الجديدة
            return await tx.container.update({
                where: { id: Number(id) },
                data: {
                    containerNumber: data.containerNumber,
                    sourcePort: data.sourcePort,
                    destinationPort: data.destinationPort,
                    shippingDate: data.shippingDate ? new Date(data.shippingDate) : null,
                    arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
                    status: data.status,
                    products: {
                        create: (typeof data.products === 'string' ? JSON.parse(data.products) : data.products || []).map(p => ({
                            productId: Number(p.productId),
                            quantity: Number(p.quantity) || 0,
                            unit: p.unit || "KG",
                            packages: Number(p.packages) || 0,
                            netWeight: Number(p.netWeight) || 0,
                            grossWeight: Number(p.grossWeight) || 0,
                            packageType: p.packageType || null
                        }))
                    },
                    attachments: {
                        create: (typeof data.attachments === 'string' ? JSON.parse(data.attachments) : data.attachments || []).map(a => ({
                            url: a.url,
                            description: a.description || ''
                        }))
                    }
                },
                include: { products: true, attachments: true }
            });
        });

        res.json(result);
    } catch (error) {
        console.error("Update Container Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// 4. الحذف
exports.deleteContainer = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.container.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Container deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: "Failed to delete container" });
    }
};