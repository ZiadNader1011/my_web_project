import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma.js';
router.get('/', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { id: 'desc' }
        });
        res.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// 2. إضافة موظف جديد - POST
router.post('/', async (req, res) => {
    try {
        const { name, phone, jobTitle } = req.body;
        
        const newEmployee = await prisma.employee.create({
            data: {
                name: name,
                phone: phone || null,
                jobTitle: jobTitle || null
            }
        });
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ error: "Failed to create employee" });
    }
});

// 3. تحديث بيانات موظف - PUT
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, jobTitle } = req.body;

        const updatedEmployee = await prisma.employee.update({
            where: { id: parseInt(id) },
            data: {
                name: name,
                phone: phone,
                jobTitle: jobTitle
            }
        });
        res.json(updatedEmployee);
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(400).json({ error: "Failed to update employee" });
    }
});

// 4. حذف موظف - DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.employee.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(400).json({ error: "Failed to delete employee" });
    }
});

export default router;