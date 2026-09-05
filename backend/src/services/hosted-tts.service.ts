import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { ITTSService } from './tts.interface';
import { AppError } from '../utils/app-error';

export class HostedTTSService implements ITTSService {
  private client: AxiosInstance;

  constructor() {
    if (!config.ai.ttsProvider.url || !config.ai.ttsProvider.apiKey) {
      // We'll allow it to be missing for now but warn, so the pipeline doesn't crash during init
      console.warn('[HostedTTSService]: TTS provider not fully configured.');
    }

    this.client = axios.create({
      baseURL: config.ai.ttsProvider.url,
      headers: {
        'Authorization': `Bearer ${config.ai.ttsProvider.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async generateSpeech(text: string, voice: string = 'standard'): Promise<Buffer> {
    if (!config.ai.ttsProvider.url) {
       throw new AppError('TTS Provider URL not configured', 500);
    }

    try {
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
