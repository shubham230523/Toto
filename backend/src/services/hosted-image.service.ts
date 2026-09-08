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
  private readonly isPollinations: boolean;

  constructor() {
    const url = config.ai.imageProvider.url || 'https://image.pollinations.ai/prompt';
    this.isPollinations = url.includes('pollinations.ai');

    if (!this.isPollinations && (!config.ai.imageProvider.url || !config.ai.imageProvider.apiKey)) {
      console.warn('[HostedImageService]: Image provider not fully configured. Falling back to Pollinations.');
    }

    this.model = config.ai.imageProvider.model;
    this.client = axios.create({
      baseURL: this.isPollinations ? 'https://image.pollinations.ai/prompt' : config.ai.imageProvider.url,
      headers: {
        ...(config.ai.imageProvider.apiKey ? { 'Authorization': `Bearer ${config.ai.imageProvider.apiKey}` } : {}),
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes timeout for image generation
    });
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      if (this.isPollinations) {
        // Pollinations uses a simple GET with URL-encoded prompt
        const encodedPrompt = encodeURIComponent(prompt);
        const width = options?.width || 1024;
        const height = options?.height || 1024;
        const seed = Math.floor(Math.random() * 1000000);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

        // We still fetch it to verify it works and get the buffer for the storage layer
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        return {
          url: `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`,
          revisedPrompt: prompt,
        };
      }

      // Standard POST implementation
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
        responseType: 'arraybuffer',
      });

      if (response.status !== 200) {
        throw new AppError(`Image provider returned status ${response.status}`, 502);
      }

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

      throw new AppError(`Failed to connect to image generation provider: ${error.message}`, 504);
    }
  }
}

export const hostedImageService = new HostedImageService();
