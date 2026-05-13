import express from 'express';
const router = express.Router();

// مثال للـ Routes (عدليها حسب الكود اللي كان عندك بس بنفس الاستايل ده)
router.get('/', async (req, res) => {
    try {
        // كود جلب البيانات هنا
        res.json({ message: "Todo list working" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;