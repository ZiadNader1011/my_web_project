const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. جلب كل الوظائف مع المنتجات والعملاء
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        client: true,
        supplier: true,
        products: true // تفعيل جلب المنتجات لتظهر في الـ Expanded Row
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error("Fetch Jobs Error:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// 2. إنشاء وظيفة جديدة
exports.createJob = async (req, res) => {
  try {
    const data = req.body;
    console.log("البيانات المستلمة من الـ Frontend:", data);

    const newJob = await prisma.job.create({
      data: {
        jobNumber: data.jobNumber || `JOB-${Date.now()}`,
        title: data.title || "Untitled Job",
        status: data.status || "active",
        operationType: data.operationType,
        
        // العلاقات
        clientId: data.clientId && data.clientId !== 'none' ? Number(data.clientId) : null,
        supplierId: data.supplierId && data.supplierId !== 'none' ? Number(data.supplierId) : null,
        
        // البيانات المالية (تحويل آمن للأرقام)
        discountPercentage: parseFloat(data.discountPercentage) || 0,
        supplierDiscountPercentage: parseFloat(data.supplierDiscountPercentage) || 0,
        rawMaterialPricePerTon: parseFloat(data.rawMaterialPricePerTon) || 0,
        rawMaterialWeight: parseFloat(data.rawMaterialWeight) || 0,
        pettyCash: parseFloat(data.pettyCash) || 0,

        // حفظ المنتجات المرفقة
        // ملاحظة: الـ Frontend يرسل productId كاسم للمنتج و unitPrice كسعر
        products: {
          create: data.products?.map(p => ({
            name: String(p.productId || "Product"),
            price: parseFloat(p.unitPrice) || 0,
            category: p.variety || "General",
            currency: p.currency || data.currency || "USD"
          }))
        }
      },
      include: { products: true } // نرجع الوظيفة بمنتجاتها للتأكيد
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error("Create Job Error (Detailed):", error);
    res.status(400).json({ error: error.message });
  }
};

// 3. تحديث الوظيفة
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // لتحديث المنتجات بشكل صحيح: نمسح القديم ونضيف الجديد المرتبط بهذه الوظيفة
    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        status: data.status,
        discountPercentage: parseFloat(data.discountPercentage) || 0,
        supplierDiscountPercentage: parseFloat(data.supplierDiscountPercentage) || 0,
        rawMaterialPricePerTon: parseFloat(data.rawMaterialPricePerTon) || 0,
        rawMaterialWeight: parseFloat(data.rawMaterialWeight) || 0,
        pettyCash: parseFloat(data.pettyCash) || 0,
        clientId: data.clientId && data.clientId !== 'none' ? Number(data.clientId) : null,
        supplierId: data.supplierId && data.supplierId !== 'none' ? Number(data.supplierId) : null,
        operationType: data.operationType,
        // منطق تحديث المنتجات: حذف الكل ثم إعادة إضافة (الأسهل والأضمن)
        products: {
          deleteMany: {}, 
          create: data.products?.map(p => ({
            name: String(p.productId || "Product"),
            price: parseFloat(p.unitPrice) || 0,
            category: p.variety || "General",
            currency: p.currency || data.currency || "USD"
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
// جلب تفاصيل وظيفة واحدة بكل علاقاتها
// جلب تفاصيل وظيفة واحدة بكل العلاقات المطلوبة لصفحة JobDetails
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
      include: {
        client: true,       // ضروري لظهور اسم العميل
        supplier: true,     // ضروري لظهور اسم المورد
        products: true,     // ضروري لحساب الـ Valuation (قيمة البضاعة)
        transactions: true, // ضروري جداً لعمل الـ Ledger والحسابات المالية
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // إرسال البيانات للسيرفر
    res.json(job);
  } catch (error) {
    console.error("Fetch Job Details Error:", error);
    res.status(500).json({ error: "Failed to fetch job details" });
  }
};

// 4. حذف الوظيفة
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // بفضل onDelete: Cascade في السكيما، سيتم حذف المنتجات المرتبطة تلقائياً
    await prisma.job.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(400).json({ error: "Delete failed" });
  }
};