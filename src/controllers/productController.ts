import { Request, Response } from 'express';
import { Product } from '../models/Product';
import cloudinary from '../config/cloudinary';
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Change the uploadImage function to ensure it returns void or Promise<void>
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  const file = req.file; // Get the uploaded file from the request
  if (!file) {
    res.status(400).json({ message: 'No file uploaded' })
    return;
  }

  try {
    const result = await cloudinary.uploader.upload(file.buffer.toString('base64'), {
      resource_type: 'auto',
    });
    res.status(200).json({ url: result.secure_url }); // Send the image URL back in the response
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image' }); // Handle errors during upload
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, price, description, imageUrl } = req.body;

  const product = new Product({ name, price, description, imageUrl });
  try {
    await product.save();
    res.status(201).json({ message: 'Product created successfully' }); // Respond with success message
  } catch (error) {
    res.status(400).json({ message: 'Error creating product' }); // Handle errors during product creation
  }
};

// Other CRUD operations (getProduct, updateProduct, deleteProduct) can be added here
