import { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  images: string[]; // Should always be an array of exactly 4 images
  category: string;
  brand?: string;
  stock: {
    quantity: number;
    unit: string;
  };
  isAIGenerated?: boolean; // Optional field to mark if the product was AI-generated
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (val: string[]) => val.length === 4,
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
  },
  { timestamps: true }
);

// Compile and export the model
export const Product = model<IProduct>('Product', productSchema);
