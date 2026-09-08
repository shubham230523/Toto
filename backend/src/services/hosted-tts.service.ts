import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { ITTSService } from './tts.interface';
import { AppError } from '../utils/app-error';

export class HostedTTSService implements ITTSService {
  private client: AxiosInstance;
  private readonly isFallback: boolean;

  constructor() {
    const url = config.ai.ttsProvider.url;
    this.isFallback = !url || !config.ai.ttsProvider.apiKey;

    if (this.isFallback) {
      console.warn('[HostedTTSService]: TTS provider not configured. Using Google Translate fallback.');
    }

    this.client = axios.create({
      baseURL: url || 'https://translate.google.com/translate_tts',
      headers: {
        ...(config.ai.ttsProvider.apiKey ? { 'Authorization': `Bearer ${config.ai.ttsProvider.apiKey}` } : {}),
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateSpeech(text: string, voice: string = 'en'): Promise<Buffer> {
    try {
      if (this.isFallback) {
        // Unofficial Google Translate TTS URL
        const lang = voice.length <= 5 ? voice : 'en';
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        return Buffer.from(response.data);
      }

      // Standard implementation
      const response = await this.client.post('', {
        input: { text },
        voice: { name: voice },
        audioConfig: { audioEncoding: 'MP3' },
        model: config.ai.ttsProvider.model,
      }, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('[HostedTTSService]: Generation error', error.message);
      throw new AppError(`TTS generation failed: ${error.message}`, 502);
    }
  }
}

export const hostedTTSService = new HostedTTSService();
