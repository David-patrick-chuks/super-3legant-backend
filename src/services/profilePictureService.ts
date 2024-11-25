import { createCanvas, loadImage } from 'node:canvas';
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

    // Create a canvas and context
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');

    // Set the background color
    ctx.fillStyle = randomColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create initials from the username
    const initials = username.split(' ').map(word => word[0]).join('').toUpperCase();

    // Set text properties
    ctx.fillStyle = 'white'; // Text color
    ctx.font = 'bold 64px sans-serif'; // Font style
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the initials on the canvas
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

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



// // Example usage
// generateProfilePicture('David Patrick')
//     .then(url => console.log('Profile picture URL:', url))
//     .catch(err => console.error(err));
