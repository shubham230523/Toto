import { Router, Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service';
import { assetGeneratorService } from '../services/asset-generator.service';
import { contentGenerationService } from '../services/content-generation.service';
import { characterRepository } from '../repositories/character.repository';
import { storyRepository } from '../repositories/story.repository';
import { storyboardRepository } from '../repositories/storyboard.repository';
import { getStoryGenerationPrompt, getStoryboardGenerationPrompt } from '../utils/prompt-templates';
import { validateGeneratedStory } from '../utils/story-validator';
import { validateGeneratedStoryboard } from '../utils/storyboard-validator';
import { CreateStoryDto } from '../models/story.model';
import { Storyboard } from '../models/storyboard.model';
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
 * POST /content/storyboards/generate
 * Generates a detailed storyboard from an existing story script.
 */
router.post('/content/storyboards/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storyId } = req.body;

    if (!storyId) {
      return next(new AppError('Story ID is required', 400));
    }

    // 1. Load the story
    const story = await storyRepository.findById(storyId);
    if (!story) {
      return next(new AppError('Story not found', 404));
    }

    // 2. Build Director AI prompt
    const prompt = getStoryboardGenerationPrompt(story);

    // 3. Call Gemini
    const storyboardData = await geminiService.generateJson<Storyboard>(prompt);

    // 4. Validate
    validateGeneratedStoryboard(storyboardData);

    // 5. Persist the storyboard
    const storyboard = await storyboardRepository.create(storyboardData);

    res.status(201).json({
      status: 'success',
      data: { storyboard },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/episodes/generate
 * Orchestrates the full creation of a new episode package from a concept.
 * Stores the package as a JSON file for the renderer.
 */
router.post('/content/episodes/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { learningConcept } = req.body;

    if (!learningConcept) {
      return next(new AppError('Learning concept is required', 400));
    }

    const episodePackage = await contentGenerationService.generateCompleteEpisode(learningConcept);

    res.status(201).json({
      status: 'success',
      data: episodePackage,
    });
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
