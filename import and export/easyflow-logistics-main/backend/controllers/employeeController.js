const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. جلب كل الموظفين
exports.getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// 2. إضافة موظف جديد
exports.createEmployee = async (req, res) => {
  try {
    const { name, jobTitle, phone } = req.body;
    // التحقق من البيانات المطلوبة
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newEmp = await prisma.employee.create({
      data: { name, jobTitle, phone }
    });
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(500).json({ error: "Error creating employee: " + error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, jobTitle, phone } = req.body; // استخراج الحقول المطلوبة فقط

    const updated = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { name, jobTitle, phone } // تمريرها يدوياً
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
};

// 4. حذف موظف
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    res.status(400).json({ error: "Delete failed: " + error.message });
  }
};