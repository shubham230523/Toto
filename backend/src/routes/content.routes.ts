import { Router, Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service';
import { assetGeneratorService } from '../services/asset-generator.service';
import { characterRepository } from '../repositories/character.repository';
import { storyRepository } from '../repositories/story.repository';
import { getStoryGenerationPrompt } from '../utils/prompt-templates';
import { validateGeneratedStory } from '../utils/story-validator';
import { CreateStoryDto } from '../models/story.model';
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

    const characters = await characterRepository.listAll();
    const prompt = getStoryGenerationPrompt(learningConcept, characters.map(c => c.name));

    const storyData = await geminiService.generateJson<CreateStoryDto>(prompt);
    validateGeneratedStory(storyData, characters.map(c => c.name));

    const story = await storyRepository.create(storyData);

    res.status(201).json({ status: 'success', data: { story } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-character
 */
router.post('/content/assets/generate-character', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterName } = req.body;
    if (!characterName) return next(new AppError('Character name is required', 400));

    const asset = await assetGeneratorService.generateCharacter(characterName);
    res.status(201).json({ status: 'success', data: { asset } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-expression
 */
router.post('/content/assets/generate-expression', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterName, expression } = req.body;
    if (!characterName || !expression) return next(new AppError('Character name and expression are required', 400));

    const asset = await assetGeneratorService.generateExpression(characterName, expression);
    res.status(201).json({ status: 'success', data: { asset } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-background
 */
router.post('/content/assets/generate-background', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) return next(new AppError('Background name is required', 400));

    const asset = await assetGeneratorService.generateBackground(name);
    res.status(201).json({ status: 'success', data: { asset } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/assets/generate-object
 */
router.post('/content/assets/generate-object', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) return next(new AppError('Object name is required', 400));

    const asset = await assetGeneratorService.generateObject(name);
    res.status(201).json({ status: 'success', data: { asset } });
  } catch (error) {
    next(error);
  }
});

export default router;
