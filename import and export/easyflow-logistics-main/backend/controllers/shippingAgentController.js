const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getAgents = async (req, res) => {
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


exports.createAgent = async (req, res) => {
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


exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id);
    const data = req.body;

    if (isNaN(numericId)) return res.status(400).json({ error: "Invalid ID format" });

   
    const existing = await prisma.shippingAgent.findUnique({ where: { id: numericId } });
    if (!existing) return res.status(404).json({ error: "Agent not found" });

    const fileUrl = req.file 
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` 
      : data.attachmentUrl;

    const updated = await prisma.shippingAgent.update({
      where: { id: numericId },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        company: data.company !== undefined ? data.company : undefined,
        address: data.address !== undefined ? data.address : undefined,
        telephone: data.telephone !== undefined ? data.telephone : undefined,
        personalNumber: data.personalNumber !== undefined ? data.personalNumber : undefined,
        email: data.email !== undefined ? data.email : undefined,
        attachmentUrl: fileUrl !== undefined ? fileUrl : undefined
      }
    });
    
    return res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Update Agent Error:", error);
    return res.status(400).json({ error: "فشل التحديث: " + error.message });
  }
};




exports.deleteAgent = async (req, res) => {
    try {
        await prisma.shippingAgent.delete({
            where: { id: parseInt(req.params.id) }
        });
       
        return res.status(200).json({ success: true }); 
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete" });
    }
};