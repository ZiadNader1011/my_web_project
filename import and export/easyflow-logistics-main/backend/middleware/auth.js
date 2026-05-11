import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
   
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "غير مصرح لك، برجاء تسجيل الدخول أولاً" });
    }

    try {
      
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: "التوكن غير صحيح أو منتهي الصلاحية" });
    }
};