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

// Middleware لتحديد الأدوار المسموحة
export const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user بيجي من دالة الـ protect اللي اشتغلنا عليها قبل كدة
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `غير مسموح لدورك (${req.user.role}) بالقيام بهذا الإجراء` 
            });
        }
        next();
    };
};