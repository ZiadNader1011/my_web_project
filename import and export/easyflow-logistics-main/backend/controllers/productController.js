import { prisma } from '../lib/prisma.js';


export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(suppliers);

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch suppliers'
    });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, supplierIds, numberOfSuppliers } = req.body;

    // تأكدي من تحويل البيانات لقيم سليمة قبل إرسالها لـ Prisma
    const formattedSupplierIds = Array.isArray(supplierIds) 
      ? supplierIds.map(id => parseInt(id)) 
      : (supplierIds ? [parseInt(supplierIds)] : []);

    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        numberOfSuppliers: parseInt(numberOfSuppliers) || 0,
        // اختيار أول مورد كـ ID أساسي (إذا كان موديل الـ DB يتطلب ذلك)
        supplierId: formattedSupplierIds.length > 0 ? formattedSupplierIds[0] : null,
        // تخزين كل الـ IDs في المصفوفة
        supplierIds: formattedSupplierIds
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("PRISMA ERROR DETAILS:", error); 
    res.status(400).json({ error: "Failed to save product: " + error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, numberOfSuppliers, supplierIds } = req.body;
    
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
   data: {
  name: name !== undefined ? name : undefined,
  category: category !== undefined ? category : undefined,
  numberOfSuppliers: numberOfSuppliers !== undefined ? parseInt(numberOfSuppliers) : undefined,
  supplierIds: supplierIds !== undefined ? supplierIds.map(id => parseInt(id)) : undefined,
  supplierId: (supplierIds && supplierIds.length > 0) ? parseInt(supplierIds[0]) : undefined,
}
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.deleteMany({ // استخدام deleteMany أهدى بكتير
      where: { id: Number(id) }
    });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};