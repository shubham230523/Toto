/**
 * Interface for Text-to-Speech services.
 * Allows the application to remain decoupled from specific providers
 * (e.g., Google Cloud TTS, Azure Speech, Amazon Polly, OpenAI TTS, etc.).
 */
export interface ITTSService {
  /**
   * Generates audio from text.
   * @param text The text to convert to speech.
   * @param voice Optional voice identifier or name.
   * @returns A promise resolving to the audio data as a Buffer.
   */
  generateSpeech(text: string, voice?: string): Promise<Buffer>;
}
