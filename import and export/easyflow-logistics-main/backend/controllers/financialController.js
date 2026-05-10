const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.getTransactions = async (req, res) => {
    try {
        const { entityId } = req.query;

        const where = {};

        if (entityId) {
            where.relatedId = String(entityId);
        }

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: [
                { date: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        const formatted = transactions.map(tx => ({
            ...tx,
            amount: Number(tx.amount)
        }));

        return res.status(200).json(formatted);

    } catch (error) {
        console.error("❌ Fetch Error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};


exports.createTransaction = async (req, res) => {
    try {
        const { 
            type, relatedId, amount, currency, date, 
            description, bank, blNumber, invoiceNumber, 
            weightInTons, packages 
        } = req.body;

        if (!amount ?? !type ?? !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const tx = await prisma.transaction.create({
            data: {
                type,
                description: description ?? "",
                amount: parseFloat(amount),
                currency: currency ?? "USD",
                date: new Date(date),
                relatedId: (relatedId === 'none' ?? !relatedId) ? null : String(relatedId),
                bank: bank ?? null,
                blNumber: blNumber ?? null,
                invoiceNumber: invoiceNumber ?? null,
                weightInTons: weightInTons ? parseFloat(weightInTons) : null,
                packages: packages ? parseInt(packages) : null,
            }
        });

        return res.status(201).json(tx);
    } catch (error) {
        console.error("❌ Create Error:", error);
        return res.status(500).json({ error: "Failed to create entry" });
    }
};


exports.updateTransaction = async (req, res) => {
    try {
        const numericId = parseInt(req.params.id);
        const data = req.body;

        const existing = await prisma.transaction.findUnique({ where: { id: numericId } });
        if (!existing) return res.status(404).json({ error: "Transaction not found" });

        const updated = await prisma.transaction.update({
            where: { id: numericId },
            data: {
                type: data.type ?? undefined,
                description: data.description ?? undefined,
                amount: data.amount ? parseFloat(data.amount) : undefined,
                currency: data.currency ?? undefined,
                date: data.date ? new Date(data.date) : undefined,
                relatedId: data.relatedId === 'none' ? null : (data.relatedId ?? undefined),
                bank: data.bank !== undefined ? data.bank : undefined,
                blNumber: data.blNumber !== undefined ? data.blNumber : undefined,
                invoiceNumber: data.invoiceNumber !== undefined ? data.invoiceNumber : undefined,
            }
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error("❌ Update Error:", error);
        return res.status(400).json({ error: "Update failed" });
    }
};


exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        // 1. التأكد أن الـ ID رقم صحيح وليس NaN
        if (isNaN(numericId)) {
            console.error("❌ Invalid ID received:", id);
            return res.status(400).json({ error: "Invalid ID format" });
        }

        
        const record = await prisma.transaction.findUnique({
            where: { id: numericId }
        });

        if (!record) {
            console.error(`❌ Record with ID ${numericId} not found in DB`);
            return res.status(404).json({ error: "Record not found in database" });
        }

        await prisma.transaction.delete({
            where: { id: numericId }
        });

        console.log(`✅ Transaction ${numericId} deleted successfully`);
        return res.status(200).json({ 
            success: true, 
            message: "Deleted successfully" 
        });

    } catch (error) {
        console.error("❌ Delete Error Detail:", error.message);
        return res.status(500).json({ 
            error: "Server error", 
            details: error.message 
        });
    }
};