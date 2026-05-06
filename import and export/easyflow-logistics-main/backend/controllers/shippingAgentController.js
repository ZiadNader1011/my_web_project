const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// جلب كل الوكلاء
exports.getAgents = async (req, res) => {
  try {
    const agents = await prisma.shippingAgent.findMany(); // تأكد أن الاسم يطابق الـ Model في Prisma
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
};

// إضافة وكيل جديد
exports.createAgent = async (req, res) => {
  try {
    const newAgent = await prisma.shippingAgent.create({
      data: req.body // بياخد البيانات اللي جاية من الفورم في الفرونت إند
    });
    res.json(newAgent);
  } catch (error) {
    res.status(500).json({ error: "Failed to create agent" });
  }
};