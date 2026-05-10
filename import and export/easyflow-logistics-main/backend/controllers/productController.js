const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSuppliers = async (req, res) => {
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
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, supplierIds, numberOfSuppliers } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        numberOfSuppliers: parseInt(numberOfSuppliers) || 0,
        supplierId: supplierIds && supplierIds.length > 0 ? parseInt(supplierIds[0]) : null,
        supplierIds: Array.isArray(supplierIds) ? supplierIds.map(id => parseInt(id)) : []
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("PRISMA ERROR:", error); // هذا السطر سيظهر لك السبب الحقيقي في الـ Terminal
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
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