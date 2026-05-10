const prisma = require('../lib/prisma');
import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';


exports.getDashboardSummary = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: { not: 'cancelled' } },
      include: { products: true }
    });

    const clients = await prisma.client.findMany({ select: { balance: true } });
    const suppliers = await prisma.supplier.findMany({ select: { balance: true } });

    const totalSalesObj = {};
    jobs.forEach(job => {
      const discount = Number(job.discountPercentage || 0);
      job.products.forEach(p => {
        const c = p.currency || job.currency || 'USD';
        const netValue = (Number(p.quantity) * Number(p.unitPrice)) * (1 - discount / 100);
        totalSalesObj[c] = (totalSalesObj[c] || 0) + netValue;
      });
    });

    const summary = {
      totalSales: totalSalesObj,
      clientDebt: clients.reduce((sum, c) => sum + (Number(c.balance) || 0), 0),
      supplierDebt: suppliers.reduce((sum, s) => sum + (Number(s.balance) || 0), 0),
      stats: {
        totalJobs: jobs.length,
        activeContainers: await prisma.container.count({ where: { status: { not: 'cleared' } } }),
        totalProducts: await prisma.product.count(),
        totalTransactions: await prisma.transaction.count(),
      },
      recentJobs: await prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } } }
      })
    };

    res.json(summary);
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};