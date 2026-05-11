import { prisma } from '../../backend/lib/prisma.js';

export const getDashboardData = async () => {
  const [
    jobs,
    clients,
    suppliers,
    transactions,
    containers,
    products
  ] = await Promise.all([
    prisma.job.findMany({
      include: {
        products: true
      }
    }),

    prisma.client.findMany(),

    prisma.supplier.findMany(),

    prisma.transaction.findMany(),

    prisma.container.findMany(),

    prisma.product.findMany()
  ]);

  

  const totalSales = await prisma.job.aggregate({
    _sum: { totalPrice: true }
  });

  const clientRemaining = await prisma.transaction.aggregate({
    where: { type: "incoming" },
    _sum: { amount: true }
  });

  const supplierCost = await prisma.transaction.aggregate({
    where: { type: "outgoing" },
    _sum: { amount: true }
  });

  return {
    stats: {
      totalSales: totalSales._sum.totalPrice || 0,
      clientRemaining: clientRemaining._sum.amount || 0,
      supplierCost: supplierCost._sum.amount || 0,
      containers: containers.length,
      products: products.length,
      transactions: transactions.length
    },

    recentJobs: jobs.slice(0, 5),
    activeContainers: containers.filter(c => c.status !== "cleared")
  };
};