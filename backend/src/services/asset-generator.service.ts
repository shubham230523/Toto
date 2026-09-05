import path from 'path';
import fs from 'fs/promises';
import { hostedImageService } from './hosted-image.service';
import { hostedTTSService } from './hosted-tts.service';
import { localStorageService } from './local-storage.service';
import { assetRepository } from '../repositories/asset.repository';
import { Asset, AssetType } from '../models/asset.model';
import { AppError } from '../utils/app-error';

export class AssetGeneratorService {
  /**
   * Generates a character asset using its bible.
   */
  async generateCharacter(name: string): Promise<Asset> {
    const biblePath = path.resolve(__dirname, `../../docs/character_bibles/${name.toLowerCase()}.bible.md`);
    let bibleContent: string;
    try {
      bibleContent = await fs.readFile(biblePath, 'utf-8');
    } catch (error) {
      throw new AppError(`Character bible for "${name}" not found`, 404);
    }

    const imagePrompt = `
      Create a high-quality, professional 2D vector-style cartoon character asset for a children's animation series.
      Character: ${name}
      Details from Character Bible:
      ${bibleContent}
      Requirements:
      - Full body shot, neutral T-pose or friendly standing pose.
      - Clean, thick outlines (darker than fill colors).
      - Soft minimalist gradients.
      - Solid white background (for easy removal).
      - High resolution, 2D vector aesthetic.
      - Toddler-friendly, cute, and gentle.
    `;

    const generationResult = await hostedImageService.generateImage(imagePrompt, { width: 1024, height: 1024 });
    const fileName = `${name.toLowerCase()}_canonical.png`;
    const publicUrl = await localStorageService.uploadImage(generationResult.url, fileName, 'characters');

    return assetRepository.create({
      name,
      type: AssetType.CHARACTER,
      url: publicUrl,
      metadata: { is_canonical: true, generated_prompt: imagePrompt },
    });
  }

  /**
   * Generates a character expression.
   */
  async generateExpression(characterName: string, expression: string): Promise<Asset> {
    const biblePath = path.resolve(__dirname, `../../docs/character_bibles/${characterName.toLowerCase()}.bible.md`);
    let bibleContent: string;
    try {
      bibleContent = await fs.readFile(biblePath, 'utf-8');
    } catch (error) {
      throw new AppError(`Character bible for "${characterName}" not found`, 404);
    }

    const imagePrompt = `
      Create a high-quality 2D vector-style cartoon asset of ${characterName}'s face showing a ${expression.toUpperCase()} expression.
      Character Bible Context:
      ${bibleContent}
      Expression Requirements:
      - Current Expression: ${expression.toUpperCase()}
      - Maintain exactly the same colors, line thickness, and character design as defined in the bible.
      - Close-up or medium shot of the head/face to capture the expression details.
      - Clean, thick outlines.
      - Solid white background.
    `;

    const generationResult = await hostedImageService.generateImage(imagePrompt, { width: 1024, height: 1024 });
    const fileName = `${characterName.toLowerCase()}_expression_${expression.toLowerCase()}.png`;
    const publicUrl = await localStorageService.uploadImage(generationResult.url, fileName, 'expressions');

    return assetRepository.create({
      name: `${characterName}_${expression}`,
      type: AssetType.EXPRESSION,
      url: publicUrl,
      metadata: { character_name: characterName, expression_type: expression.toLowerCase(), generated_prompt: imagePrompt },
    });
  }

  /**
   * Generates a background asset.
   */
  async generateBackground(name: string): Promise<Asset> {
    const imagePrompt = `
      Create a high-quality 2D vector-style cartoon background for a children's animation series.
      Theme: ${name}
      Requirements:
      - Clean 2D children's cartoon style.
      - Bright, cheerful colors and soft lighting.
      - Flat perspective or simple 2.5D, optimized for Godot scene composition.
      - No characters.
      - Solid detail on scenery, simplified for animation.
    `;

    const generationResult = await hostedImageService.generateImage(imagePrompt, { width: 1024, height: 1024 });
    const fileName = `bg_${name.toLowerCase()}.png`;
    const publicUrl = await localStorageService.uploadImage(generationResult.url, fileName, 'backgrounds');

    return assetRepository.create({
      name,
      type: AssetType.BACKGROUND,
      url: publicUrl,
      metadata: { generated_prompt: imagePrompt, style: '2d-cartoon' },
    });
  }

  /**
   * Generates a reusable object asset.
   */
  async generateObject(name: string): Promise<Asset> {
    const imagePrompt = `
      Create a high-quality 2D vector-style cartoon object asset for a children's animation series.
      Object: ${name}
      Requirements:
      - Clean 2D children's cartoon style.
      - Single object centered.
      - Bright, vibrant, toddler-friendly colors.
      - Thick, clean outlines.
      - Solid white background.
    `;

    const generationResult = await hostedImageService.generateImage(imagePrompt, { width: 1024, height: 1024 });
    const fileName = `obj_${name.toLowerCase()}.png`;
    const publicUrl = await localStorageService.uploadImage(generationResult.url, fileName, 'objects');

    return assetRepository.create({
      name,
      type: AssetType.OBJECT,
      url: publicUrl,
      metadata: { generated_prompt: imagePrompt, object_type: name.toLowerCase() },
    });
  }

  /**
   * Generates a speech audio asset.
   */
  async generateSpeech(name: string, text: string, voice?: string): Promise<Asset> {
    const audioBuffer = await hostedTTSService.generateSpeech(text, voice);
    const fileName = `audio_${name.toLowerCase()}.mp3`;
    const publicUrl = await localStorageService.saveFile(audioBuffer, fileName, 'audio');

    return assetRepository.create({
      name,
      type: AssetType.AUDIO,
      url: publicUrl,
      metadata: { text, voice },
    });
  }
}

export const assetGeneratorService = new AssetGeneratorService();
