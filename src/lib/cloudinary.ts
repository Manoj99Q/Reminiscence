import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(imageUrl: string): Promise<string> {
  try {
    // Upload the image from the provided URL
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'diary-entries', // Store in a specific folder
      resource_type: 'image',
    });

    // Return the secure URL of the uploaded image
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
} 