const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET ALL
exports.getAllContainers = async (req, res) => {
  try {
    const containers = await prisma.container.findMany({
      include: {
        products: {
          include: { product: true }
        },
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = containers.map(c => ({
      ...c,
      // لا داعي لتحويل الـ id يدوياً هنا لأن الـ Int يُرسل بشكل سليم
      attachments: c.attachments.map(a => ({
        ...a,
        createdAt: a.createdAt.toISOString()
      })),
      products: c.products.map(p => ({
        ...p,
        // تأكدي أن الـ productId يُعامل كـ Number
        productId: p.productId 
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREATE
exports.createContainer = async (req, res) => {
  try {
    const {
      containerNumber,
      sourcePort,
      destinationPort,
      shippingDate,
      arrivalDate,
      status,
      products = [],
      attachments = []
    } = req.body;

    if (!containerNumber) {
      return res.status(400).json({ error: "Container number is required" });
    }

    const newContainer = await prisma.container.create({
      data: {
        containerNumber,
        sourcePort,
        destinationPort,
        shippingDate: shippingDate ? new Date(shippingDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        status: status || 'loading',
        products: {
          create: products.map(p => ({
            productId: Number(p.productId), // ✅ تحويل لـ Number (مهم جداً)
            quantity: Number(p.quantity) || 0,
            unit: p.unit || "KG",
            packages: Number(p.packages) || 0,
            netWeight: Number(p.netWeight) || 0,
            grossWeight: Number(p.grossWeight) || 0,
            packageType: p.packageType || null
          }))
        },
        attachments: {
          create: attachments.map(a => ({
            url: a.url,
            description: a.description || ''
          }))
        }
      },
      include: {
        products: true,
        attachments: true
      }
    });

    res.status(201).json(newContainer);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: "Failed to create container. Check if ID is a number or if Number is duplicate."
    });
  }
};

// 3. UPDATE
exports.updateContainer = async (req, res) => {
  const { id } = req.params; // الـ id قادم من الرابط كـ String

  const {
    containerNumber,
    sourcePort,
    destinationPort,
    shippingDate,
    arrivalDate,
    status,
    products = [],
    attachments = []
  } = req.body;

  try {
    const updatedContainer = await prisma.$transaction(async (tx) => {
      // ✅ تحويل id الحاوية لـ Number في الحذف والتعديل
      await tx.containerProduct.deleteMany({
        where: { containerId: Number(id) }
      });

      await tx.attachment.deleteMany({
        where: { containerId: Number(id) }
      });

      const container = await tx.container.update({
        where: { id: Number(id) }, // ✅ تحويل لـ Number
        data: {
          containerNumber,
          sourcePort,
          destinationPort,
          shippingDate: shippingDate ? new Date(shippingDate) : null,
          arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
          status,
          products: {
            create: products.map(p => ({
              productId: Number(p.productId), // ✅ تحويل لـ Number
              quantity: Number(p.quantity) || 0,
              unit: p.unit || "KG",
              packages: Number(p.packages) || 0,
              netWeight: Number(p.netWeight) || 0,
              grossWeight: Number(p.grossWeight) || 0,
              packageType: p.packageType || null
            }))
          },
          attachments: {
            create: attachments.map(a => ({
              url: a.url,
              description: a.description || ''
            }))
          }
        },
        include: {
          products: true,
          attachments: true
        }
      });

      return container;
    });

    res.json(updatedContainer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. DELETE
exports.deleteContainer = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.container.delete({
      where: { id: Number(id) } // ✅ تحويل لـ Number
    });

    res.json({ message: "Container deleted successfully" });
  } catch (error) {
    res.status(400).json({
      error: "Failed to delete container"
    });
  }
};