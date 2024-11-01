import { Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';
// const fetch = await import('node-fetch').then(module => module.default);

// Load environment variables
dotenv.config();
// Configure your Hugging Face and Gemini models
const huggingFaceUrl = process.env.HF_API_URL as string;
const huggingFaceToken = `Bearer ${process.env.HF_API_KEY}`; // using token from environment variable
const genimiApiKey = process.env.GEMINI_API_KEY as string;

// Define the schema for the generated product details
const productSchema = {
  description: "Schema for AI-Generated Product Details",
  type: SchemaType.OBJECT,
  properties: {
    name: {
      type: SchemaType.STRING,
      description: "The name of the product.",
      nullable: false,
    },
    price: {
      type: SchemaType.NUMBER,
      description: "The price of the product, expressed as a numeric value.",
      nullable: false,
    },
    description: {
      type: SchemaType.STRING,
      description: "A detailed description of the product, highlighting key features and benefits.",
      nullable: false,
    },
    category: {
      type: SchemaType.STRING,
      description: "The category of the product (e.g., electronics, clothing, food).",
      nullable: false,
    },
    brand: {
      type: SchemaType.STRING,
      description: "The brand name of the product. Optional if not specified.",
      nullable: true,
    },
    stock: {
      type: SchemaType.OBJECT,
      description: "Stock information related to the product.",
      properties: {
        quantity: {
          type: SchemaType.NUMBER,
          description: "The available stock quantity of the product.",
          nullable: false,
        },
        unit: {
          type: SchemaType.STRING,
          description: "The unit of measurement for the stock quantity (e.g., pieces, kg).",
          nullable: false,
        },
      },
      required: ["quantity", "unit"],
    },
    isAIGenerated: {
      type: SchemaType.BOOLEAN,
      description: "Indicates whether the product details were generated by AI. Default is false.",
      nullable: true,
    },
  },
  required: ["name", "price", "description", "category", "stock"],
};

const genAI = new GoogleGenerativeAI(genimiApiKey); // Use your environment variable for Gemini
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: productSchema,
  },
});

// Function to query Hugging Face API for image generation
async function queryHuggingFace(data: any): Promise<string[]> {
  const fetch = await import('node-fetch').then(module => module.default);
  const response = await fetch(huggingFaceUrl, {
    headers: {
      Authorization: huggingFaceToken,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to generate image");
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  return [imageUrl]; // Return an array of image URLs 
}

// Controller to generate product details and images
export const generateProduct = async (req: Request, res: Response): Promise<void> => {
  const userPrompt = req.body.prompt;

  // Define the system prompt for context
  const textSystemPrompt = "You are a professional product description generator. Please provide detailed, creative, and engaging product information.";
  const imageSystemPrompt = "Generate high-quality, visually appealing product images suitable for marketing.";

  // Combine system prompts with user prompt for each model
  const combinedTextPrompt = textSystemPrompt + " " + userPrompt;
  const combinedImagePrompt = imageSystemPrompt + " " + userPrompt;

  // Combine system prompt with user prompt
  try {
    // Generate product images
    const imageData = await queryHuggingFace({ inputs: combinedImagePrompt });

    // Generate product details using Gemini
    const result = await model.generateContent([combinedTextPrompt]);
    const responseText = result.response.text();
    const productDetails = JSON.parse(responseText);

    // Ensure product details follow the schema
    if (productDetails && productDetails.images && Array.isArray(productDetails.images)) {
      const generatedProduct = {
        ...productDetails,
        images: imageData,
        isAIGenerated: true, // Set flag indicating AI generation
      };

      res.status(200).json({
        message: "Product generated successfully",
        product: generatedProduct,
      });
    } else {
      res.status(400).json({ message: 'Failed to generate valid product details' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error generating product', error: (error as Error).message });
  }
};
