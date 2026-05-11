import { prisma } from '../lib/prisma.js';
import fs from 'fs/promises';
import path from 'path';

const getFileUrl = (req, filename) => `${req.protocol}://${req.get('host')}/uploads/operations/${filename}`;

export const getOperations = async (req, res) => {
    try {
        const operations = await prisma.shipmentOperation.findMany({
            orderBy: { operationDate: 'desc' },
        });
        return res.status(200).json(operations);
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const createOperation = async (req, res) => {
    try {
        const data = req.body;
        
        
        const finalJobId = (data.jobId === 'none' || !data.jobId || data.jobId === "") ? null : parseInt(data.jobId);

        const newAttachments = (req.files || []).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: getFileUrl(req, file.filename),
            description: file.originalname,
            createdAt: new Date().toISOString()
        }));

        const newOp = await prisma.shipmentOperation.create({
            data: {
                operationDate: new Date(data.operationDate),
                loadingDate: (data.loadingDate && data.loadingDate !== "") ? new Date(data.loadingDate) : null,
                clientName: data.clientName,
                jobId: finalJobId, 
                product: data.product || null,
                quantity: data.quantity || null,
                containerNumber: data.containerNumber || null,
                responsiblePerson: data.responsiblePerson || null,
                qualityRepresentative: data.qualityRepresentative || null,
                notes: data.notes || null,
                attachments: newAttachments,
                numberOfContainers: data.numberOfContainers ? data.numberOfContainers.toString() : "0",
            }
        });
        return res.status(201).json(newOp);
    } catch (error) {
        console.error("❌ Create Error:", error);
        return res.status(400).json({ error: error.message });
    }
};

export const updateOperation = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existingOp = await prisma.shipmentOperation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingOp) return res.status(404).json({ error: "Operation not found" });

        
        let updatedAttachments = [];
        if (data.attachments) {
            updatedAttachments = typeof data.attachments === 'string' 
                ? JSON.parse(data.attachments) 
                : data.attachments;
        } else {
            updatedAttachments = existingOp.attachments || [];
        }

        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: getFileUrl(req, file.filename),
                description: file.originalname,
                createdAt: new Date().toISOString()
            }));
            updatedAttachments = [...updatedAttachments, ...newFiles];
        }

        
        const finalJobId = (data.jobId === 'none' || !data.jobId || data.jobId === "") ? null : parseInt(data.jobId);

    
const updated = await prisma.shipmentOperation.update({
    where: { id: parseInt(id) },
    data: {
        operationDate: data.operationDate ? new Date(data.operationDate) : undefined,
        loadingDate: (data.loadingDate && data.loadingDate !== "") ? new Date(data.loadingDate) : null,
        clientName: data.clientName !== undefined ? data.clientName : undefined,
        jobId: finalJobId, 
        product: data.product !== undefined ? data.product : undefined,
        quantity: data.quantity !== undefined ? data.quantity : undefined,
        containerNumber: data.containerNumber !== undefined ? data.containerNumber : undefined,
        responsiblePerson: data.responsiblePerson !== undefined ? data.responsiblePerson : undefined,
        qualityRepresentative: data.qualityRepresentative !== undefined ? data.qualityRepresentative : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        numberOfContainers: data.numberOfContainers !== undefined ? data.numberOfContainers.toString() : undefined,
        attachments: updatedAttachments, 
    },
});

        res.json(updated);
    } catch (error) {
        console.error("❌ Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteOperation = async (req, res) => {
    try {
        const numericId = parseInt(req.params.id);
        const record = await prisma.shipmentOperation.findUnique({ where: { id: numericId } });
        
        if (!record) return res.status(404).json({ error: "Record not found" });

        if (record.attachments && Array.isArray(record.attachments)) {
            for (const file of record.attachments) {
                try {
                    const filename = file.url.split('/').pop();
                    const filePath = path.join(process.cwd(), 'uploads/operations', filename);
                    await fs.unlink(filePath);
                } catch (err) { console.log("File cleanup failed or file not found"); }
            }
        }

        await prisma.shipmentOperation.delete({ where: { id: numericId } });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        return res.status(500).json({ error: "Delete failed" });
    }
};