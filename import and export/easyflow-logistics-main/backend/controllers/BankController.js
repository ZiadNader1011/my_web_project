import { prisma } from '../lib/prisma.js';

// ✅ الاسم هنا لازم يطابق اللي في الـ Routes: getBanksSummary
export const getBanksSummary = async (req, res) => {
  try {
    // 1. جلب كل المعاملات التي تحتوي على بنك
    const transactions = await prisma.transaction.findMany({
      where: { 
        bank: { 
          not: null,
          // تجنب النصوص الفارغة
          not: "" 
        } 
      }
    });

    // 2. جلب أرصدة البداية
    const initialBalances = await prisma.bankBalance.findMany();

    // 3. استخراج أسماء البنوك الفريدة من الطرفين
    const bankNames = new Set([
      ...transactions.map(t => t.bank.trim()),
      ...initialBalances.map(b => b.bankName.trim())
    ]);

    // 4. بناء هيكل البيانات لكل بنك
    const bankSummary = Array.from(bankNames).map(bankName => {
      const bankTxs = transactions.filter(t => t.bank?.trim() === bankName);
      const balances = {};

      // أضف رصيد البداية أولاً
      initialBalances
        .filter(b => b.bankName === bankName)
        .forEach(b => {
          balances[b.currency] = (balances[b.currency] || 0) + b.amount;
        });

      // أضف/اطرح المعاملات بناءً على النوع
      bankTxs.forEach(t => {
        const cur = t.currency || 'USD';
        if (!balances[cur]) balances[cur] = 0;
        
        if (t.type === 'incoming') {
          balances[cur] += t.amount;
        } else {
          // أي نوع تاني (outgoing, petty_cash, الخ) يتخصم من البنك
          balances[cur] -= t.amount;
        }
      });

      return {
        name: bankName,
        transactionCount: bankTxs.length,
        balances: balances,
        initialBalances: initialBalances
          .filter(b => b.bankName === bankName)
          .reduce((acc, curr) => ({ ...acc, [curr.currency]: curr.amount }), {})
      };
    });

    res.json(bankSummary);
  } catch (error) {
    console.error("❌ Bank Summary Error:", error);
    res.status(500).json({ error: error.message });
  }
};