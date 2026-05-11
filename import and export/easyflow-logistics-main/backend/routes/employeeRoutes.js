import express from 'express';
import { prisma } from '../lib/prisma.js';
import { employeeSchema, validate } from '../middleware/validator.js'; // 1. استيراد الفلتر

const router = express.Router();
router.use(protect);

/**
 * --- 1. جلب كل الموظفين (GET) ---
 */
router.get('/', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { id: 'desc' }
        });
        return res.json(employees); // أضفنا return لضمان إنهاء الطلب
    } catch (error) {
        console.error("Error fetching employees:", error);
        return res.status(500).json({ error: "فشل في جلب قائمة الموظفين" });
    }
});

/**
 * --- 2. إضافة موظف جديد (POST) ---
 * استخدمنا validate(employeeSchema) قبل التنفيذ ✅
 */
router.post('/', validate(employeeSchema), async (req, res) => {
    try {
        const { name, phone, jobTitle } = req.body;
        
        const newEmployee = await prisma.employee.create({
            data: {
                name: name,
                phone: phone || null,
                jobTitle: jobTitle || null
            }
        });
        return res.status(201).json(newEmployee);
    } catch (error) {
        console.error("Error creating employee:", error);
        return res.status(500).json({ error: "حدث خطأ أثناء إضافة الموظف" });
    }
});

/**
 * --- 3. تحديث بيانات موظف (PUT) ---
 */
router.put('/:id', validate(employeeSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, jobTitle } = req.body;

        // مضاد للرصاص: تحويل الـ ID لـ Integer
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            return res.status(400).json({ error: "معرف الموظف غير صحيح" });
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: numericId },
            data: {
                name: name,
                phone: phone,
                jobTitle: jobTitle
            }
        });
        return res.json(updatedEmployee);
    } catch (error) {
        console.error("Error updating employee:", error);
        // حماية: إذا كان الموظف غير موجود أصلاً
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "الموظف غير موجود" });
        }
        return res.status(400).json({ error: "فشل في تحديث بيانات الموظف" });
    }
});

/**
 * --- 4. حذف موظف (DELETE) ---
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return res.status(400).json({ error: "معرف الموظف غير صحيح" });
        }

        await prisma.employee.delete({
            where: { id: numericId }
        });
        return res.json({ success: true, message: "تم حذف الموظف بنجاح" });
    } catch (error) {
        console.error("Error deleting employee:", error);
        // حماية ضد محاولة حذف موظف غير موجود أو مرتبط ببيانات أخرى
        return res.status(400).json({ error: "فشل في حذف الموظف، قد يكون غير موجود" });
    }
});

export default router;