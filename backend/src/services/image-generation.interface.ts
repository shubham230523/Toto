export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  style?: string;
  count?: number;
}

export interface ImageGenerationResult {
  url: string;
  revisedPrompt?: string;
}

/**
 * Interface for image generation services.
 * This allows the application to remain decoupled from specific providers
 * (e.g., OpenAI DALL-E, Midjourney, Stable Diffusion, etc.).
 */
export interface IImageGenerationService {
  /**
   * Generates one or more images based on a textual prompt.
   * @param prompt The descriptive text for the image.
   * @param options Configuration for dimensions, quality, and style.
   * @returns A promise resolving to the image result(s).
   */
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
}
