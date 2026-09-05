import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config';
import { AppError } from '../utils/app-error';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(modelName: string = config.ai.geminiModel) {
    if (!config.ai.geminiApiKey) {
      throw new AppError('GEMINI_API_KEY is not configured', 500);
    }
    this.genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Generates text based on a prompt with timeout and error handling.
   * @param prompt The string prompt to send to Gemini.
   * @param timeoutMs Maximum time to wait for a response (default 30 seconds).
   * @returns The generated text response.
   */
  async generateText(prompt: string, timeoutMs: number = 30000): Promise<string> {
    try {
      // Wrap the generation in a promise that can be timed out
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new AppError('Gemini request timed out', 504)), timeoutMs)
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new AppError('Gemini returned an empty response', 502);
      }

      return text;
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      console.error('[GeminiService]: Generation error', error);
      throw new AppError(
        `Failed to generate content: ${error.message || 'Unknown error'}`,
        502
      );
    }
  }

  /**
   * Generates JSON content by adding specific instructions to the prompt.
   * Useful for structured data like storyboards or metadata.
   */
  async generateJson<T>(prompt: string, timeoutMs: number = 30000): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting or explanations.`;
    const text = await this.generateText(jsonPrompt, timeoutMs);

    try {
      // Remove possible markdown code blocks if the model ignored instructions
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText) as T;
    } catch (error) {
      console.error('[GeminiService]: JSON parsing error', error, 'Raw text:', text);
      throw new AppError('Failed to parse Gemini response as JSON', 502);
    }
  }
}

export const geminiService = new GeminiService();
