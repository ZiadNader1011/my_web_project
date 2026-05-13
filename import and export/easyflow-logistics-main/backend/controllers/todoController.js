import { prisma } from '../lib/prisma.js';

export const getTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      include: {
        job: { select: { jobNumber: true, title: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { task, jobId } = req.body;
    const todo = await prisma.todo.create({
      data: {
        task,
        jobId: jobId ? Number(jobId) : null
      }
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const currentTodo = await prisma.todo.findUnique({ where: { id: Number(id) } });
    const updated = await prisma.todo.update({
      where: { id: Number(id) },
      data: { completed: !currentTodo.completed }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
};