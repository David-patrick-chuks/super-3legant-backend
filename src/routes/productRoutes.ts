import { Router } from 'express';
import { createProduct, uploadImage } from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Set up multer

router.post('/upload', upload.single('image'), uploadImage); // Use multer to handle image uploads
router.post('/', authMiddleware, createProduct); // Create product route

export default router;
