import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.json({ message: "Feedback working" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;