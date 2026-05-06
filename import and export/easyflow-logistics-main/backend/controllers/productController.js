const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. جلب كل المنتجات مع بيانات المورد الخاص بكل منتج
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        supplier: true // عشان يعرض اسم المورد في الجدول
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. إضافة منتج جديد
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, supplierId } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        price: parseFloat(price) || 0,
        supplierId: supplierId ? Number(supplierId) : null,
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 3. تحديث منتج
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, supplierId } = req.body;
    
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        // نستخدم "undefined" لو الحقل مجاش، عشان بريسما متحدثوش وتديله قيمة قديمة
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        supplierId: supplierId !== undefined ? (supplierId ? Number(supplierId) : null) : undefined,
      }
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. حذف منتج
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};