import { Schema, model, Document } from 'mongoose';

// 1. Define an interface for the Product document
interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  imageUrl?: string; // Optional field
}

// 2. Define the product schema with TypeScript types
const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: false }, // Optional
});

// 3. Export the Product model, specifying the IProduct interface as the type
export const Product = model<IProduct>('Product', productSchema);
