import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/CategoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;