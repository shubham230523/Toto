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
   * @param systemPrompt Optional system level instructions.
   * @param timeoutMs Maximum time to wait for a response.
   * @returns The generated text response.
   */
  async generateText(prompt: string, systemPrompt?: string, timeoutMs: number = 60000): Promise<string> {
    if (config.ai.useMockAi) {
      throw new AppError('OpenRouterService called while MOCK_AI is enabled. This is a bug in the generation pipeline.', 500);
    }

    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const messages: any[] = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            headers: {
              'HTTP-Referer': 'https://toto.example.com',
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

        if (!text || text.trim().length === 0) {
          throw new AppError('OpenRouter returned an empty response', 502);
        }

        return text;
      } catch (error: any) {
        lastError = error;
        const statusCode = error.response?.status;

        // Don't retry on 4xx errors except 408 (timeout) and 429 (rate limit)
        if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429) {
          break;
        }

        console.warn(`[OpenRouterService]: Attempt ${attempt + 1} failed: ${error.message}. Retrying...`);

        if (attempt < maxRetries) {
          // Wait with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    const statusCode = lastError.response?.status || 502;
    const errorMessage = lastError.response?.data?.error?.message || lastError.message || 'Unknown error';

    throw new AppError(
      `Failed to generate content via OpenRouter after ${maxRetries + 1} attempts: ${errorMessage}`,
      statusCode
    );
  }

  /**
   * Generates JSON content with robust extraction.
   */
  async generateJson<T>(prompt: string, timeoutMs: number = 45000): Promise<T> {
    const systemPrompt = "You are a specialized JSON generator. You MUST return ONLY valid JSON. No conversational text, no markdown code blocks, no preamble, and no postscript. Ensure all fields are present and correctly typed.";

    const text = await this.generateText(prompt, systemPrompt, timeoutMs);

    try {
      // 1. Try direct parse
      return JSON.parse(text) as T;
    } catch (e1) {
      try {
        // 2. Try cleaning markdown and trimming
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned) as T;
      } catch (e2) {
        try {
          // 3. Robust Extraction: find first { and last }
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            const extracted = text.substring(start, end + 1);
            return JSON.parse(extracted) as T;
          }
          throw new Error('No JSON structure found in response');
        } catch (e3) {
          console.error('[OpenRouterService]: JSON parsing error. Raw text received:', text);
          throw new AppError('Failed to parse OpenRouter response as JSON. The model returned non-structured text.', 502);
        }
      }
    }
  }
}

export const openRouterService = new OpenRouterService();
