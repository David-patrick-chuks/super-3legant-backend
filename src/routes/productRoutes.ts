import { Router } from 'express';
import { createProduct, uploadImages } from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';
import { generateProduct } from '../controllers/productGenerationController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Set up multer

router.post('/upload', upload.array('images', 4), uploadImages); // Use multer to handle up to 4 image uploads

// Route for generating product details using AI
router.post('/generate', authMiddleware, generateProduct); // Generate product details route

// Route for creating a product
router.post('/createproduct', authMiddleware, createProduct); // Create product route

export default router;
