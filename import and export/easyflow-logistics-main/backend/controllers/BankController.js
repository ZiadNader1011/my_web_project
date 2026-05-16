import { prisma } from '../lib/prisma.js';

// ✅ الاسم هنا لازم يطابق اللي في الـ Routes: getBanksSummary
export const getBanksSummary = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { bank: { not: null, not: "" } }
    });

    const initialBalances = await prisma.bankBalance.findMany();

    const bankNames = new Set([
      ...transactions.map(t => t.bank.trim()),
      ...initialBalances.map(b => b.bankName.trim())
    ]);

    // الهيكل السحري المطلوب للفرونت إند: { "Bank Name": { "USD": 100 } }
    const finalResult = {};

    Array.from(bankNames).forEach(bankName => {
      finalResult[bankName] = {};
      const bankTxs = transactions.filter(t => t.bank?.trim() === bankName);

      // 1. حساب أرصدة البداية
      initialBalances
        .filter(b => b.bankName === bankName)
        .forEach(b => {
          finalResult[bankName][b.currency] = (finalResult[bankName][b.currency] || 0) + b.amount;
        });

      // 2. تصفية المعاملات الحية
      bankTxs.forEach(t => {
        const cur = t.currency || 'USD';
        if (!finalResult[bankName][cur]) finalResult[bankName][cur] = 0;
        
        if (t.type === 'incoming') {
          finalResult[bankName][cur] += Number(t.amount);
        } else {
          finalResult[bankName][cur] -= Number(t.amount);
        }
      });
    });

    res.json(finalResult); // إرجاع القاموس النظيف مباشرة لصفحة البنوك
  } catch (error) {
    console.error("❌ Bank Summary Error:", error);
    res.status(500).json({ error: error.message });
  }
};