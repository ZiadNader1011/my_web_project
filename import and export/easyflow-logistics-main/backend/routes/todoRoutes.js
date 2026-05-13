import express from 'express';
import { getTodos, createTodo, toggleTodo } from '../controllers/todoController.js';

const router = express.Router();

router.get('/', getTodos);
router.post('/', createTodo);
router.patch('/:id/toggle', toggleTodo);

// ✅ لازم السطر ده كمان
export default router;