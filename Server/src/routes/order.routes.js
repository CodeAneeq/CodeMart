import express from 'express';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { changeStatusByAdmin, createOrder, getOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.post("/create-order", authMiddleware , createOrder)
router.get("/get-order", authMiddleware, getOrders);
router.post("/change-status", authMiddleware, checkAdmin, changeStatusByAdmin);

export default router