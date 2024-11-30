import { Schema, model, Document } from 'mongoose';

import { connections } from '../config/db';  // Adjust the import according to your project structure

// Define the Product interface
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

// Define the Product schema
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

// Compile and export the Product model
export const Product = model<IProduct>('Product', productSchema);

// Function to save product to a specific MongoDB cluster
export const saveProductToCluster = async (data: any, clusterName: string) => {
  try {
    const connection = connections[clusterName]; // Use the connection for the specific cluster
    if (!connection) {
      throw new Error(`No MongoDB connection found for ${clusterName}`);
    }

    // Create the model using the selected connection
    const ProductModel = connection.model<IProduct>('Product', productSchema);

    // Save the product data
    const product = new ProductModel(data);
    await product.save();
    console.log(`Product saved to ${clusterName}`);
  } catch (error) {
    console.error(`Error saving product to ${clusterName}:`, error);
  }
};
