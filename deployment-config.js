// Deployment Configuration
// This file helps configure the app for production deployment

const deploymentConfig = {
  // Environment settings for different deployment scenarios
  environments: {
    development: {
      USE_TEST_DATA: 'false',
      API_FALLBACK_ENABLED: 'true',
      LOGGING_LEVEL: 'debug'
    },
    production: {
      USE_TEST_DATA: 'false', 
      API_FALLBACK_ENABLED: 'true',
      LOGGING_LEVEL: 'error'
    },
    free_tier: {
      USE_TEST_DATA: 'true',
      API_FALLBACK_ENABLED: 'false', 
      LOGGING_LEVEL: 'info'
    }
  },

  // API Configuration
  apis: {
    huggingface: {
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      fallback_model: 'runwayml/stable-diffusion-v1-5',
      timeout: 30000
    },
    openai: {
      text_model: 'gpt-3.5-turbo', // Cheaper than gpt-4o
      image_model: 'dall-e-3',
      timeout: 30000
    }
  },

  // Deployment recommendations
  recommendations: {
    vercel: {
      env_vars: [
        'MONGODB_URI',
        'JWT_SECRET', 
        'HUGGINGFACE_API_KEY',
        'OPENAI_API_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
      ],
      functions_timeout: 30
    },
    netlify: {
      env_vars: [
        'MONGODB_URI',
        'JWT_SECRET',
        'HUGGINGFACE_API_KEY', 
        'OPENAI_API_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
      ],
      functions_timeout: 10
    }
  }
};

module.exports = deploymentConfig;

