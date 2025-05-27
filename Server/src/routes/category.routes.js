import express from 'express';
import { createCategory, deleteCategory, getAllCategories } from '../controllers/category.controller.js';
import upload from '../middleware/multer.middleware.js';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/create-category", authMiddleware , checkAdmin , upload.single("image"), createCategory)
router.get("/get-category", getAllCategories);
router.delete("/del-category/:id", authMiddleware, checkAdmin, deleteCategory);

export default router