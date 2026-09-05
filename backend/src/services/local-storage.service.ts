import fs from 'fs/promises';
import path from 'path';
import { IImageStorageService } from './image-storage.interface';
import { config } from '../config';
import { AppError } from '../utils/app-error';

export class LocalStorageService implements IImageStorageService {
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor() {
    this.uploadDir = path.resolve(config.storage.path);
    this.publicUrl = config.storage.url;
    this.ensureDirectory();
  }

  private async ensureDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('[LocalStorageService]: Failed to create upload directory', error);
    }
  }

  async uploadImage(data: Buffer | string, fileName: string, folder: string = ''): Promise<string> {
    try {
      const targetDir = path.join(this.uploadDir, folder);
      await fs.mkdir(targetDir, { recursive: true });

      const filePath = path.join(targetDir, fileName);
      const buffer = typeof data === 'string' ? Buffer.from(data.split(',')[1] || data, 'base64') : data;

      await fs.writeFile(filePath, buffer);

      const relativePath = path.join(folder, fileName).replace(/\\/g, '/');
      return this.getStorageUrl(relativePath);
    } catch (error: any) {
      console.error('[LocalStorageService]: Upload error', error);
      throw new AppError(`Failed to upload image: ${error.message}`, 500);
    }
  }

  getStorageUrl(relativePath: string): string {
    return `${this.publicUrl}/${relativePath}`;
  }

  async deleteImage(relativePath: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, relativePath);
      await fs.unlink(filePath);
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        console.error('[LocalStorageService]: Delete error', error);
        throw new AppError(`Failed to delete image: ${error.message}`, 500);
      }
    }
  }
}

export const localStorageService = new LocalStorageService();
