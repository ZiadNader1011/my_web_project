import { prisma } from '../lib/prisma.js';

// جلب كل التقييمات مع بيانات العميل المرتبط بكل تقييم
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        client: {
          select: { name: true, company: true } // نختار اسم العميل وشركته فقط
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
};

// إضافة تقييم جديد مربوط بعميل
export const createFeedback = async (req, res) => {
  try {
    const { message, rating, clientId } = req.body;
    const newFeedback = await prisma.feedback.create({
      data: {
        message,
        rating: Number(rating),
        clientId: clientId ? Number(clientId) : null
      }
    });
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
};