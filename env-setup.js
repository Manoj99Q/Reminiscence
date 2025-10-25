// Environment setup for development
// This file sets up the required environment variables for the application to work
// Note: Sensitive credentials should be set in .env.local file, not hardcoded here

// Essential variables for the app to function
// These should be set in .env.local file for security
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set. Please set it in .env.local file');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set. Please set it in .env.local file');
}

// Set default values for development
process.env.USE_TEST_DATA = process.env.USE_TEST_DATA || 'false';

// OpenAI Configuration - DISABLED (using Hugging Face instead)
// process.env.OPENAI_API_KEY = 'sk-proj-...';

// Hugging Face Configuration - Should be set in .env.local
if (!process.env.HUGGINGFACE_API_KEY) {
  console.warn('⚠️  HUGGINGFACE_API_KEY not set. Please set it in .env.local file');
}

// Cloudinary Configuration - Should be set in .env.local
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️  CLOUDINARY_CLOUD_NAME not set. Please set it in .env.local file');
}

// Redis Configuration - Should be set in .env.local
if (!process.env.REDIS_URL) {
  console.warn('⚠️  REDIS_URL not set. Please set it in .env.local file');
}

console.log('Environment variables set for development mode');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('USE_TEST_DATA:', process.env.USE_TEST_DATA);
console.log('OPENAI_API_KEY: DISABLED (using Hugging Face)');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
console.log('REDIS_URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET');
