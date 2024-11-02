"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const productGenerationController_1 = require("../controllers/productGenerationController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() }); // Set up multer
router.post('/upload', upload.array('images', 4), productController_1.uploadImages); // Use multer to handle up to 4 image uploads
// Route for generating product details using AI
router.post('/generate', authMiddleware_1.authMiddleware, productGenerationController_1.generateProduct); // Generate product details route
// Route for creating a product
router.post('/createproduct', authMiddleware_1.authMiddleware, productController_1.createProduct); // Create product route
exports.default = router;
