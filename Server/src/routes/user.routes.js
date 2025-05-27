import express from 'express';
import {signUp, login, forgotPassword, validateOTP, resetPassword, getUsers} from '../controllers/user.controller.js';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/sign-up', signUp)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/otp-verification', validateOTP)
router.post('/reset-password', resetPassword)
router.get('/get-users', authMiddleware, checkAdmin ,getUsers)

export default router