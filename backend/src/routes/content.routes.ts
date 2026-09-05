import { Router, Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service';
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

export default router;
