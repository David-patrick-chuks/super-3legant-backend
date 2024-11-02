"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = exports.uploadImages = void 0;
const Product_1 = require("../models/Product");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_1 = __importDefault(require("multer"));
// Set up multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage }).array('images', 4); // Expect 4 images for products
// Upload multiple images
const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files; // Type assertion for TypeScript
    if (!files || files.length !== 4) {
        res.status(400).json({ message: 'Four images are required' });
        return;
    }
    try {
        const uploadPromises = files.map(file => cloudinary_1.default.uploader.upload(file.buffer.toString('base64'), {
            resource_type: 'image',
        }));
        const results = yield Promise.all(uploadPromises);
        const imageUrls = results.map(result => result.secure_url);
        res.status(200).json({ imageUrls }); // Send back the array of URLs
    }
    catch (error) {
        res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
});
exports.uploadImages = uploadImages;
// Create product with images
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, description, category, brand, stock } = req.body;
    const images = req.body.images; // Expect images URLs to be in the request body
    if (!images || images.length !== 4) {
        res.status(400).json({ message: 'Four images are required for product creation' });
        return;
    }
    const product = new Product_1.Product({
        name,
        price,
        description,
        images,
        category,
        brand,
        stock: {
            quantity: (stock === null || stock === void 0 ? void 0 : stock.quantity) || 0,
            unit: (stock === null || stock === void 0 ? void 0 : stock.unit) || 'pieces',
        },
    });
    try {
        yield product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});
exports.createProduct = createProduct;
