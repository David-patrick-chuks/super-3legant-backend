"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (val) => val.length === 4,
            message: 'Requires exactly 4 images',
        },
    },
    category: { type: String, required: true },
    brand: { type: String, required: false },
    stock: {
        quantity: { type: Number, required: true, default: 0 },
        unit: { type: String, required: true, default: 'pieces' },
    },
    isAIGenerated: { type: Boolean, default: false }, // Flag for AI-generated products
}, { timestamps: true });
// Compile and export the model
exports.Product = (0, mongoose_1.model)('Product', productSchema);
