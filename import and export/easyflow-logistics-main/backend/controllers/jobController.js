import { prisma } from '../lib/prisma.js';
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                client: true,
                supplier: true,
                shippingRecords: true,
                products: {
                    include: {
                        product: true 
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

export const createJob = async (req, res) => {
    try {
        const data = req.body;

        if (data.jobNumber) {
            const existingJob = await prisma.job.findUnique({
                where: { jobNumber: data.jobNumber }
            });
            if (existingJob) {
                return res.status(400).json({ error: "رقم العملية موجود بالفعل." });
            }
        }

        const validProducts = (data.products || [])
            .filter(p => p.productId && p.productId !== 'none' && !isNaN(Number(p.productId)))
            .map(p => ({
                productId: Number(p.productId),
                quantity: parseFloat(p.quantity) || 1,
                unitPrice: parseFloat(p.unitPrice) || 0,
                currency: p.currency || data.currency || "USD",
                variety: p.variety || null
            }));

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
                    create: validProducts
                }
            },
            include: { products: true }
        });

        res.status(201).json(newJob);
    } catch (error) {
        console.error("Create Job Error:", error);
        res.status(500).json({ error: "خطأ في قاعدة البيانات: تأكد من صحة معرفات المنتجات والعملاء." });
    }
};


export const updateJob = async (req, res) => {
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
export const getJobById = async (req, res) => {
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
export const deleteJob = async (req, res) => {
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