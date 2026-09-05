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
    url: process.env.STORAGE_URL || '',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    imageProvider: {
      url: process.env.IMAGE_PROVIDER_URL || '',
      apiKey: process.env.IMAGE_PROVIDER_API_KEY || '',
    },
  },
};
