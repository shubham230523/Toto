import axios from 'axios';
import { config } from '../config';
import { AppError } from '../utils/app-error';

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.apiKey = config.ai.openRouter.apiKey;
    this.baseUrl = config.ai.openRouter.baseUrl;
    this.model = config.ai.openRouter.model;

    if (!this.apiKey) {
      throw new AppError('OPENROUTER_API_KEY is not configured', 500);
    }
  }

  /**
   * Generates text based on a prompt using OpenRouter.
   * @param prompt The string prompt to send.
   * @param timeoutMs Maximum time to wait for a response.
   * @returns The generated text response.
   */
  async generateText(prompt: string, timeoutMs: number = 45000): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          // OpenRouter supports extra headers for app identification
          headers: {
            'HTTP-Referer': 'https://toto.example.com', // Optional, for OpenRouter rankings
            'X-Title': 'Toto AI Assistant',
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: timeoutMs,
        }
      );

      const text = response.data.choices[0]?.message?.content;

      if (!text) {
        throw new AppError('OpenRouter returned an empty response', 502);
      }

      return text;
    } catch (error: any) {
      console.error('[OpenRouterService]: Generation error', error.response?.data || error.message);

      const statusCode = error.response?.status || 502;
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';

      throw new AppError(
        `Failed to generate content via OpenRouter: ${errorMessage}`,
        statusCode
      );
    }
  }

  /**
   * Generates JSON content.
   */
  async generateJson<T>(prompt: string, timeoutMs: number = 45000): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting or explanations.`;
    const text = await this.generateText(jsonPrompt, timeoutMs);

    try {
      // Remove possible markdown code blocks if the model ignored instructions
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText) as T;
    } catch (error) {
      console.error('[OpenRouterService]: JSON parsing error', error, 'Raw text:', text);
      throw new AppError('Failed to parse OpenRouter response as JSON', 502);
    }
  }
}

export const openRouterService = new OpenRouterService();
