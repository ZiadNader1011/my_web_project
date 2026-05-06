const prisma = require('../lib/prisma'); // تأكدي إن المسار صح

// 1. جلب كل الوظائف
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                client: true,
                supplier: true,
                shippingRecords: true,
                products: {
                    include: {
                        product: true // عشان يجيب تفاصيل المنتج (الاسم والفئة) من جدول الـ Product
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        console.error("Fetch Jobs Error:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
};

// 2. إنشاء وظيفة جديدة (المعدل ليتوافق مع الـ Schema)
exports.createJob = async (req, res) => {
    try {
        const data = req.body;

        // 1. التأكد من أن رقم العملية ليس مكرراً (التحقق الاستباقي)
        if (data.jobNumber) {
            const existingJob = await prisma.job.findUnique({
                where: { jobNumber: data.jobNumber }
            });
            if (existingJob) {
                return res.status(400).json({ error: "رقم العملية (Job Number) موجود بالفعل، يرجى استخدام رقم آخر." });
            }
        }

        const newJob = await prisma.job.create({
            data: {
                jobNumber: data.jobNumber || `JOB-${Date.now()}`,
                title: data.title || "Untitled Job",
                status: data.status || "active",
                operationType: data.operationType || "export",
                currency: data.currency || "USD",
                notes: data.notes || null,
                clientId: data.clientId && data.clientId !== 'none' ? Number(data.clientId) : null,
                supplierId: data.supplierId && data.supplierId !== 'none' ? Number(data.supplierId) : null,
                discountPercentage: parseFloat(data.discountPercentage) || 0,
                rawMaterialPricePerTon: parseFloat(data.rawMaterialPricePerTon) || 0,
                rawMaterialWeight: parseFloat(data.rawMaterialWeight) || 0,
                pettyCash: parseFloat(data.pettyCash) || 0,
                products: {
                    create: data.products?.map(p => ({
                        productId: Number(p.productId),
                        quantity: parseFloat(p.quantity) || 1,
                        unitPrice: parseFloat(p.unitPrice) || 0,
                        currency: p.currency || "USD",
                        variety: p.variety || null
                    }))
                }
            },
            include: { products: true }
        });

        res.status(201).json(newJob);
    } catch (error) {
        console.error("Create Job Error:", error);
        res.status(500).json({ error: "حدث خطأ أثناء إنشاء العملية: " + error.message });
    }
};

// 3. تحديث الوظيفة
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedJob = await prisma.job.update({
            where: { id: Number(id) },
            data: {
                title: data.title,
                status: data.status,
                operationType: data.operationType,
                clientId: data.clientId && data.clientId !== 'none' ? Number(data.clientId) : null,
                supplierId: data.supplierId && data.supplierId !== 'none' ? Number(data.supplierId) : null,
                
                discountPercentage: parseFloat(data.discountPercentage) || 0,
                rawMaterialPricePerTon: parseFloat(data.rawMaterialPricePerTon) || 0,
                rawMaterialWeight: parseFloat(data.rawMaterialWeight) || 0,
                pettyCash: parseFloat(data.pettyCash) || 0,

                // تحديث المنتجات: نمسح الربط القديم ونعمل ربط جديد
                products: {
                    deleteMany: {}, 
                    create: data.products?.map(p => ({
                        productId: Number(p.productId),
                        quantity: parseFloat(p.quantity) || 1,
                        unitPrice: parseFloat(p.unitPrice) || 0,
                        currency: p.currency || "USD",
                        variety: p.variety || null
                    }))
                }
            }
        });

        res.json(updatedJob);
    } catch (error) {
        console.error("Update Job Error:", error);
        res.status(400).json({ error: error.message });
    }
};

// 4. جلب وظيفة واحدة
exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await prisma.job.findUnique({
            where: { id: Number(id) },
            include: {
                client: true,
                supplier: true,
                shippingRecords: { include: { agent: true } },
                products: { include: { product: true } }
            }
        });

        if (!job) return res.status(404).json({ error: "Job not found" });

        // إضافة الحسابات المالية للرد (Response)
        const summary = calculateJobSummary(job);
        
        res.json({
            ...job,
            financialSummary: summary
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch job details" });
    }
};
const calculateJobSummary = (job) => {
    // 1. حساب تكلفة المنتجات
    const productsTotal = job.products?.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0) || 0;

    // 2. حساب تكلفة المواد الخام (Price per Ton * Weight)
    const rawMaterialsTotal = (job.rawMaterialPricePerTon || 0) * (job.rawMaterialWeight || 0);

    // 3. حساب مصاريف الشحن (بكل العملات)
    const shippingTotalEgp = job.shippingRecords?.reduce((sum, r) => sum + (r.costEgp || 0), 0) || 0;
    const shippingTotalUsd = job.shippingRecords?.reduce((sum, r) => sum + (r.costUsd || 0), 0) || 0;
    const shippingTotalEuro = job.shippingRecords?.reduce((sum, r) => sum + (r.costEuro || 0), 0) || 0;

    // 4. إجمالي التكلفة (بافتراض العملة الرئيسية للـ Job)
    const totalExcludingShipping = productsTotal + rawMaterialsTotal + (job.pettyCash || 0);
    const finalTotal = totalExcludingShipping - (totalExcludingShipping * ((job.discountPercentage || 0) / 100));

    return {
        productsTotal,
        rawMaterialsTotal,
        shippingSummary: {
            egp: shippingTotalEgp,
            usd: shippingTotalUsd,
            euro: shippingTotalEuro
        },
        netTotal: finalTotal // التكلفة الصافية بعد الخصم (بدون الشحن لأن الشحن عملاته متعددة)
    };
};

// 5. حذف الوظيفة
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.job.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(400).json({ error: "Delete failed" });
    }
};