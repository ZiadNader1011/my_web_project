import { prisma } from '../lib/prisma.js';



export const getAgents = async (req, res) => {
  try {
    const agents = await prisma.shippingAgent.findMany({
      orderBy: { id: 'desc' }
    });
    return res.status(200).json(agents);
  } catch (error) {
    console.error("❌ Fetch Agents Error:", error);
    return res.status(500).json({ error: "Failed to fetch agents" });
  }
};


export const createAgent = async (req, res) => {
  try {
    const data = req.body;
    
    // تأمين مسار الملف
    const fileUrl = req.file 
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` 
      : data.attachmentUrl;

    const newAgent = await prisma.shippingAgent.create({
      data: {
        name: data.name,
        company: data.company || null, 
        address: data.address || null,
        telephone: data.telephone || null,
        personalNumber: data.personalNumber || null,
        email: data.email || null,
        attachmentUrl: fileUrl || null
      }
    });
    return res.status(201).json(newAgent);
  } catch (error) {
    console.error("❌ Create Agent Error:", error);
    if (error.code === 'P2002') {
       return res.status(400).json({ error: "البريد الإلكتروني موجود بالفعل!" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const data = req.body;

    const existing = await prisma.shippingAgent.findUnique({ where: { id: numericId } });
    if (!existing) return res.status(404).json({ error: "Agent not found" });

    // المنطق الجديد للتعامل مع الملف:
    let fileUrl = existing.attachmentUrl; // افتراضياً نأخذ القديم

    if (req.file) {
      // إذا تم رفع ملف جديد فعلياً
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (data.attachmentUrl === 'null' || data.attachmentUrl === null) {
      // اختيارياً: لو اليوزر عايز يمسح الملف يبعت كلمة null
      fileUrl = null;
    } else if (data.attachmentUrl) {
      // لو بعت رابط (string) زي ما هو
      fileUrl = data.attachmentUrl;
    }

    const updated = await prisma.shippingAgent.update({
      where: { id: numericId },
      data: {
        name: data.name ?? undefined,
        company: data.company ?? undefined,
        address: data.address ?? undefined,
        telephone: data.telephone ?? undefined,
        personalNumber: data.personalNumber ?? undefined,
        email: data.email ?? undefined,
        attachmentUrl: fileUrl // سيأخذ القيمة الجديدة أو يحافظ على القديمة
      }
    });
    
    return res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Update Agent Error:", error);
    return res.status(400).json({ error: "فشل التحديث: " + error.message });
  }
};



export const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        // ✅ نستخدم deleteMany عشان لو ملقاش الـ ID ميرميش Error ويطلع رسايل سودة
        await prisma.shippingAgent.deleteMany({
            where: { id: numericId }
        });

        // نرجع حالة نجاح دايماً طالما الطلب وصل
        return res.status(200).json({ success: true, message: "Action completed" });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};