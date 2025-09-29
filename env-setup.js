// Environment setup for development
// This file sets up the required environment variables for the application to work

// Essential variables for the app to function
process.env.MONGODB_URI = '';
process.env.JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production_12345';
process.env.USE_TEST_DATA = 'true';

console.log('Environment variables set for development mode');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('USE_TEST_DATA:', process.env.USE_TEST_DATA);
