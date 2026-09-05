import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { geminiService } from '../services/gemini.service';
import { hostedImageService } from '../services/hosted-image.service';
import { localStorageService } from '../services/local-storage.service';
import { characterRepository } from '../repositories/character.repository';
import { storyRepository } from '../repositories/story.repository';
import { assetRepository } from '../repositories/asset.repository';
import { getStoryGenerationPrompt } from '../utils/prompt-templates';
import { validateGeneratedStory } from '../utils/story-validator';
import { CreateStoryDto } from '../models/story.model';
import { AssetType } from '../models/asset.model';
import { AppError } from '../utils/app-error';

const router = Router();

/**
 * POST /content/stories/generate
 * Generates a story script using Gemini.
 */
router.post('/content/stories/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { learningConcept } = req.body;

    if (!learningConcept || typeof learningConcept !== 'string') {
      return next(new AppError('Learning concept is required', 400));
    }

    // 1. Load available characters
    const characters = await characterRepository.listAll();
    const characterNames = characters.map(c => c.name);

    // 2. Build prompt
    const prompt = getStoryGenerationPrompt(learningConcept, characterNames);

    // 3. Call Gemini
    const storyData = await geminiService.generateJson<CreateStoryDto>(prompt);

    // 4. Validate AI Output
    validateGeneratedStory(storyData, characterNames);

    // 5. Persist the validated story
    const story = await storyRepository.create(storyData);

    res.status(201).json({
      status: 'success',
      data: { story },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-character
 * Generates the canonical image for a character based on its Bible.
 */
router.post('/content/assets/generate-character', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterName } = req.body;

    if (!characterName) {
      return next(new AppError('Character name is required', 400));
    }

    // 1. Load the Character Bible
    const biblePath = path.resolve(__dirname, `../../docs/character_bibles/${characterName.toLowerCase()}.bible.md`);
    let bibleContent: string;

    try {
      bibleContent = await fs.readFile(biblePath, 'utf-8');
    } catch (error) {
      return next(new AppError(`Character bible for "${characterName}" not found`, 404));
    }

    // 2. Construct the Image Generation Prompt
    const imagePrompt = `
      Create a high-quality, professional 2D vector-style cartoon character asset for a children's animation series.
      Character: ${characterName}

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

    // 3. Generate Image
    const generationResult = await hostedImageService.generateImage(imagePrompt, {
      width: 1024,
      height: 1024,
    });

    // 4. Store the image
    const fileName = `${characterName.toLowerCase()}_canonical.png`;
    const publicUrl = await localStorageService.uploadImage(
      generationResult.url,
      fileName,
      'characters'
    );

    // 5. Save Asset Metadata
    const asset = await assetRepository.create({
      name: characterName,
      type: AssetType.CHARACTER,
      url: publicUrl,
      metadata: {
        is_canonical: true,
        generated_prompt: imagePrompt,
        revised_prompt: generationResult.revisedPrompt,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-expression
 * Generates a specific emotional expression for a character.
 */
router.post('/content/assets/generate-expression', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterName, expression } = req.body;

    const validExpressions = ['idle', 'happy', 'surprised', 'sad', 'excited'];
    if (!characterName || !expression || !validExpressions.includes(expression.toLowerCase())) {
      return next(new AppError(`Invalid request. Supported expressions: ${validExpressions.join(', ')}`, 400));
    }

    // 1. Load the Character Bible for visual consistency
    const biblePath = path.resolve(__dirname, `../../docs/character_bibles/${characterName.toLowerCase()}.bible.md`);
    let bibleContent: string;
    try {
      bibleContent = await fs.readFile(biblePath, 'utf-8');
    } catch (error) {
      return next(new AppError(`Character bible for "${characterName}" not found`, 404));
    }

    // 2. Construct the Expression-specific Prompt
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
      - Professional animation asset quality.
    `;

    // 3. Generate Image
    const generationResult = await hostedImageService.generateImage(imagePrompt, {
      width: 1024,
      height: 1024,
    });

    // 4. Store the image
    const fileName = `${characterName.toLowerCase()}_expression_${expression.toLowerCase()}.png`;
    const publicUrl = await localStorageService.uploadImage(
      generationResult.url,
      fileName,
      'expressions'
    );

    // 5. Save to Asset Library
    const asset = await assetRepository.create({
      name: `${characterName}_${expression}`,
      type: AssetType.EXPRESSION,
      url: publicUrl,
      metadata: {
        character_name: characterName,
        expression_type: expression.toLowerCase(),
        generated_prompt: imagePrompt,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-background
 * Generates a background asset for scene composition.
 */
router.post('/content/assets/generate-background', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(new AppError('Background name is required', 400));
    }

    const imagePrompt = `
      Create a high-quality 2D vector-style cartoon background for a children's animation series.
      Theme: ${name}

      Requirements:
      - Clean 2D children's cartoon style, similar to Cocomelon or Bluey.
      - Bright, cheerful colors and soft lighting.
      - Flat perspective or simple 2.5D, optimized for Godot scene composition.
      - No characters in the image.
      - High detail on scenery (e.g., trees, sky, flowers) but simplified for animation.
      - 16:9 aspect ratio aesthetic (though generated as 1024x1024).
      - Professional animation background asset.
    `;

    // 1. Generate Image
    const generationResult = await hostedImageService.generateImage(imagePrompt, {
      width: 1024,
      height: 1024,
    });

    // 2. Store the image
    const fileName = `bg_${name.toLowerCase()}.png`;
    const publicUrl = await localStorageService.uploadImage(
      generationResult.url,
      fileName,
      'backgrounds'
    );

    // 3. Save to Asset Library
    const asset = await assetRepository.create({
      name: name,
      type: AssetType.BACKGROUND,
      url: publicUrl,
      metadata: {
        generated_prompt: imagePrompt,
        style: '2d-cartoon',
      },
    });

    res.status(201).json({
      status: 'success',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
