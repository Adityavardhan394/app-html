import { Router } from 'express';
import { sendOTP, verifyOTP, refreshToken } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.post('/refresh-token', authenticate, refreshToken);

export default router; 