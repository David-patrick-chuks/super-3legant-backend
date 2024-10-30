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
exports.createProduct = exports.uploadImage = void 0;
const Product_1 = require("../models/Product");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_1 = __importDefault(require("multer"));
// Set up multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const result = yield cloudinary_1.default.uploader.upload(file.buffer.toString('base64'), {
            resource_type: 'auto',
        });
        res.status(200).json({ url: result.secure_url });
    }
    catch (error) {
        res.status(500).json({ message: 'Error uploading image' });
    }
});
exports.uploadImage = uploadImage;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, description, imageUrl } = req.body;
    const product = new Product_1.Product({ name, price, description, imageUrl });
    try {
        yield product.save();
        res.status(201).json({ message: 'Product created successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating product' });
    }
});
exports.createProduct = createProduct;
// Other CRUD operations (getProduct, updateProduct, deleteProduct) can be added here
