import express from 'express';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createRating, deleteRating, getAllRating, getRatings } from '../controllers/rating.controller.js';

const router = express.Router();

router.post("/create-rating", authMiddleware , createRating)
router.get("/get-rating/:productId", getRatings);
router.delete("/del-rating/:ratingId", authMiddleware, deleteRating);
router.get("/get-ratings", authMiddleware, checkAdmin, getAllRating)

export default router