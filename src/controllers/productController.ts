import { Request, Response } from 'express';
import { Product } from '../models/Product';
import cloudinary from '../config/cloudinary';
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('images', 4); // Expect 4 images for products

// Upload multiple images
export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[]; // Type assertion for TypeScript

  if (!files || files.length !== 4) {
    res.status(400).json({ message: 'Four images are required' });
    return;
  }

  try {
    const uploadPromises = files.map(file => 
      cloudinary.uploader.upload(file.buffer.toString('base64'), {
        resource_type: 'image',
      })
    );
    
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);
    
    res.status(200).json({ imageUrls }); // Send back the array of URLs
  } catch (error) {
    res.status(500).json({ message: 'Error uploading images', error: (error as Error).message });
  }
};

// Create product with images
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, price, description, category, brand, stock } = req.body;
  const images = req.body.images as string[]; // Expect images URLs to be in the request body

  if (!images || images.length !== 4) {
    res.status(400).json({ message: 'Four images are required for product creation' });
    return;
  }

  const product = new Product({
    name,
    price,
    description,
    images,
    category,
    brand,
    stock: {
      quantity: stock?.quantity || 0,
      unit: stock?.unit || 'pieces',
    },
  });

  try {
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: (error as Error).message });
  }
};
