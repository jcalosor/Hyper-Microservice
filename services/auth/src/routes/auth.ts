import express from 'express';
// @ts-ignore
import { register, login, getProfile } from '../controllers/AuthController';
// @ts-ignore
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

export default router;