import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  storage: {
    url: process.env.STORAGE_URL || 'http://localhost:3000/uploads',
    path: process.env.STORAGE_PATH || './uploads',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    imageProvider: {
      url: process.env.IMAGE_PROVIDER_URL || '',
      apiKey: process.env.IMAGE_PROVIDER_API_KEY || '',
      model: process.env.IMAGE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0',
    },
  },
};
