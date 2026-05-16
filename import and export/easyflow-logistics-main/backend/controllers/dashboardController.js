import { prisma } from '../lib/prisma.js';

export const getDashboardSummary = async (req, res) => {
  try {

    const [
      recentJobs,
      transactions,
      containers,
      products,
      totalJobsCount
    ] = await Promise.all([
      prisma.job.findMany({
        include: {
          client: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      prisma.transaction.findMany(),

      prisma.container.findMany(),

      prisma.product.findMany(),

      prisma.job.count()
    ]);

 const usdJobs = await prisma.job.findMany({
  where: { currency: 'USD' }
});

const egpJobs = await prisma.job.findMany({
  where: { currency: 'EGP' }
});

const totalUSD = usdJobs.reduce((sum, job) => {
  return sum + (
    Number(job.rawMaterialWeight || 0) *
    Number(job.rawMaterialPricePerTon || 0)
  );
}, 0);

const totalEGP = egpJobs.reduce((sum, job) => {
  return sum + (
    Number(job.rawMaterialWeight || 0) *
    Number(job.rawMaterialPricePerTon || 0)
  );
}, 0);

    // Transactions
    const incoming = await prisma.transaction.aggregate({
      where: { type: 'incoming' },
      _sum: { amount: true }
    });

    const outgoing = await prisma.transaction.aggregate({
      where: { type: 'outgoing' },
      _sum: { amount: true }
    });

    const activeContainers = containers.filter(
      c => c.status !== 'cleared'
    );

    const summary = {
      totalSales: {
     USD: totalUSD,
     EGP: totalEGP
      },

      clientDebt: Number(incoming._sum.amount || 0),

      supplierDebt: Number(outgoing._sum.amount || 0),

      agentCost: 0,

      stats: {
        totalJobs: totalJobsCount,
        activeContainers: activeContainers.length,
        totalProducts: products.length,
        totalTransactions: transactions.length
      },

      recentJobs,

      activeShipments: activeContainers.slice(0, 5)
    };

    console.log(summary);

    res.json(summary);

  } catch (error) {

    console.error('❌ Dashboard Error:', error);

    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
};