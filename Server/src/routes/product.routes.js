import express from 'express';
import upload from '../middleware/multer.middleware.js';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createProduct, deleteProduct, getProducts, getSingleProduct, searchProduct, updateProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.post("/create-product", authMiddleware , checkAdmin , upload.array('images', 6), createProduct)
router.delete("/delete-product/:id", authMiddleware, checkAdmin, deleteProduct);
router.patch("/update-product/:id", authMiddleware, checkAdmin, upload.array('images', 6), updateProduct)
router.get("/get-products", getProducts);
router.get('/get-single-product/:id', getSingleProduct)
router.get('/search', searchProduct)

export default router