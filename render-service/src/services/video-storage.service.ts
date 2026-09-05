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
      // In this local setup, the renderer outputs to renderer/output/
      // We read the file and could POST it to the main backend's upload endpoint if implemented.
      // For now, we'll return the expected public URL based on the config.

      const absoluteLocalPath = path.resolve(localPath.toString());

      // Verification
      await fs.access(absoluteLocalPath);

      // Simulate upload delay
      console.log(`[VideoStorage]: Uploading ${fileName} to storage...`);

      // return the public URL where the file will be accessible
      return `${config.storage.uploadUrl}/episodes/${fileName}`;
    } catch (error: any) {
      console.error('[VideoStorage]: Upload failed', error);
      throw new AppError(`Failed to upload video: ${error.message}`, 500);
    }
  }
}

export const videoStorageService = new VideoStorageService();
