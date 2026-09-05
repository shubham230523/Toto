import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },
  godot: {
    binaryPath: process.env.GODOT_BINARY_PATH || 'godot',
    projectPath: process.env.GODOT_PROJECT_PATH || '../renderer',
  },
  storage: {
    uploadUrl: process.env.STORAGE_UPLOAD_URL || 'http://localhost:3000/uploads',
  },
  backend: {
    apiUrl: process.env.BACKEND_API_URL || 'http://localhost:3000',
  }
};
