import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import {
  IImageGenerationService,
  ImageGenerationOptions,
  ImageGenerationResult
} from './image-generation.interface';
import { AppError } from '../utils/app-error';

export class HostedImageService implements IImageGenerationService {
  private client: AxiosInstance;
  private readonly model: string;

  constructor() {
    if (!config.ai.imageProvider.url || !config.ai.imageProvider.apiKey) {
      throw new AppError('Image provider configuration (URL or API Key) is missing', 500);
    }

    this.model = config.ai.imageProvider.model;
    this.client = axios.create({
      baseURL: config.ai.imageProvider.url,
      headers: {
        'Authorization': `Bearer ${config.ai.imageProvider.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout for image generation
    });
  }

  /**
   * Generates an image using a hosted inference API.
   * This implementation is designed to be compatible with common patterns
   * found in providers like Hugging Face, Replicate, or custom Stable Diffusion setups.
   */
  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      // Typical payload for open-weight models (Stable Diffusion XL, etc.)
      const payload = {
        inputs: prompt,
        parameters: {
          width: options?.width || 1024,
          height: options?.height || 1024,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
      };

      const response = await this.client.post('', payload, {
        responseType: 'arraybuffer', // Many hosted APIs return binary image data directly
      });

      if (response.status !== 200) {
        throw new AppError(`Image provider returned status ${response.status}`, 502);
      }

      // Note: In a real flow, we would upload this binary data to our STORAGE_URL
      // and return that URL. For now, we return a placeholder or data URI if small.
      // This will be handled in the asset management layer.

      return {
        url: `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`,
        revisedPrompt: prompt,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      console.error('[HostedImageService]: Generation error', error.message);

      if (error.response) {
        throw new AppError(
          `Image generation failed: ${error.response.statusText || 'Provider error'}`,
          502
        );
      }

      throw new AppError('Failed to connect to image generation provider', 504);
    }
  }
}

export const hostedImageService = new HostedImageService();
