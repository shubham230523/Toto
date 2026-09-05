/**
 * Interface for image storage services.
 * Allows the application to use different providers (S3, Cloud Storage, Local, etc.)
 */
export interface IImageStorageService {
  /**
   * Uploads an image buffer or base64 string to storage.
   * @param data The image data (Buffer or Base64 string)
   * @param fileName Desired name for the file in storage
   * @param folder Optional folder/directory to place the file in
   * @returns The public URL of the uploaded image
   */
  uploadImage(data: Buffer | string, fileName: string, folder?: string): Promise<string>;

  /**
   * Retrieves the storage URL for a specific file path.
   * @param path The relative path to the file in storage
   * @returns The full URL
   */
  getStorageUrl(path: string): string;

  /**
   * Deletes an image from storage.
   * @param path The relative path to the file in storage
   */
  deleteImage(path: string): Promise<void>;
}
