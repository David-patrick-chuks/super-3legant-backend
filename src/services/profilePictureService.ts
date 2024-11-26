import sharp from 'sharp';
import cloudinary from '../config/cloudinary';
import dotenv from 'dotenv';

dotenv.config();

export async function generateProfilePicture(username: string): Promise<string> {
    const generateRandomColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215);
        return `#${randomColor.toString(16)}`; // Convert to hex color
    };

    const generateRandomNumber = (length: number) => {
        return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
    };

    const randomColor = generateRandomColor();
    const randomValue = generateRandomNumber(10); // Generate a 10-digit random number

    // Create a unique public ID for Cloudinary
    const publicId = `${username}_${randomValue}_3legant`;

    // Create initials from the username
    const initials = username.split(' ').map(word => word[0]).join('').toUpperCase();

    // Create an image with sharp
    const image = sharp({
        create: {
            width: 200,
            height: 200,
            channels: 3,
            background: randomColor, // Set the background color
        }
    })
    .composite([{
        input: Buffer.from(`<svg width="200" height="200">
            <text x="50%" y="50%" font-size="64" font-family="sans-serif" text-anchor="middle" fill="white" dy=".3em">${initials}</text>
        </svg>`), // Add text as SVG
        gravity: 'center' // Position text in the center
    }])
    .png(); // Output as PNG

    // Convert image to buffer
    const buffer = await image.toBuffer();

    // Upload the buffer to Cloudinary with a custom public ID
    const uploadResponse = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: publicId }, // Specify the public ID here
            (error, result) => {
                if (error) {
                    console.error('Failed to upload to Cloudinary:', error);
                    reject(new Error('Failed to upload profile picture'));
                } else if (result) {
                    resolve(result.secure_url); // Resolve with the public URL
                }
            }
        ).end(buffer); // Pass the image data as the stream content
    });

    console.log(uploadResponse);
    return uploadResponse; // Return the URL of the uploaded image
}
