import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { config } from '../config';
import { AppError } from '../utils/app-error';

export class VideoStorageService {
  /**
   * Uploads a local video file to the central storage.
   * In a real production app, this would upload to S3/GCS.
   * For this setup, we simulate it by notifying the backend or moving the file.
   */
  async uploadVideo(localPath: String, fileName: string): Promise<string> {
    try {
      const absoluteLocalPath = path.resolve(localPath.toString());
      const destinationDir = path.resolve(__dirname, '../../', config.storage.backendUploadsPath, 'episodes');
      const destinationPath = path.join(destinationDir, fileName);

      // Ensure destination directory exists
      await fs.mkdir(destinationDir, { recursive: true });

      // Verification
      await fs.access(absoluteLocalPath);

      // In this local setup, we "upload" by copying the file to the backend's uploads directory
      console.log(`[VideoStorage]: Copying ${fileName} to ${destinationPath}...`);
      await fs.copyFile(absoluteLocalPath, destinationPath);

      // return the public URL where the file will be accessible
      return `${config.storage.uploadUrl}/episodes/${fileName}`;
    } catch (error: any) {
      console.error('[VideoStorage]: Upload failed', error);
      throw new AppError(`Failed to upload video: ${error.message}`, 500);
    }
  }
}

export const videoStorageService = new VideoStorageService();
