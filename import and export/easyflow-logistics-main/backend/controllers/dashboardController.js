import { prisma } from '../lib/prisma.js'; 


export const getDashboardSummary = async (req, res) => {
  try {
    // 1. تحديث الـ Materialized View لضمان دقة الأرقام
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW dashboard_view;`;

    // 2. جلب البيانات المالية المحسوبة مسبقاً من الـ View
    const summaryView = await prisma.$queryRaw`SELECT * FROM dashboard_view`;
    const data = summaryView[0];

    // 3. جلب البيانات الديناميكية (آخر 5 عمليات)
    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        client: { select: { name: true } } 
      }
    });

    // 4. تجميع الكائن النهائي
    const summary = {
      totalSales: {
        USD: Number(data?.total_sales_usd || 0),
        EGP: Number(data?.total_sales_egp || 0)
      },
      clientDebt: Number(data?.client_payments || 0),
      supplierDebt: Number(data?.supplier_cost || 0),
      agentCost: Number(data?.agent_cost || 0),
      stats: {
        totalJobs: Number(data?.jobs_count || 0),
        activeContainers: Number(data?.active_containers || 0),
        totalProducts: Number(data?.products_count || 0),
        totalTransactions: Number(data?.transactions_count || 0),
      },
      recentJobs: recentJobs,
      lastUpdated: data?.last_updated
    };

    res.json(summary);
  } catch (error) {
    console.error("Dashboard Enterprise Error:", error);
    res.status(500).json({ error: "Internal Server Error - Check Database View" });
  }
};