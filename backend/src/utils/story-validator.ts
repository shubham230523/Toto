import { CreateStoryDto } from '../models/story.model';
import { AppError } from './app-error';

export const validateGeneratedStory = (story: CreateStoryDto, availableCharacters: string[]) => {
  // 1. Missing required fields in Story
  if (!story.title) throw new AppError('Story title is missing', 502);
  if (!story.learningConcept) throw new AppError('Learning concept is missing', 502);
  if (!story.characters || !Array.isArray(story.characters)) throw new AppError('Characters list is missing or malformed', 502);
  if (!story.scenes || !Array.isArray(story.scenes)) throw new AppError('Scenes list is missing or malformed', 502);
  if (typeof story.estimatedDuration !== 'number') throw new AppError('Estimated duration is missing or not a number', 502);
  if (!story.dialogue || !Array.isArray(story.dialogue)) throw new AppError('Dialogue list is missing or malformed', 502);

  // 2. Empty scenes
  if (story.scenes.length === 0) throw new AppError('Story contains no scenes', 502);

  // 3. Invalid characters referenced in Story
  const invalidCharacters = story.characters.filter(name => !availableCharacters.includes(name));
  if (invalidCharacters.length > 0) {
    throw new AppError(`Story references unauthorized characters: ${invalidCharacters.join(', ')}`, 502);
  }

  // 4. Invalid duration
  if (story.estimatedDuration < 10 || story.estimatedDuration > 120) {
    throw new AppError(`Invalid story duration: ${story.estimatedDuration}s. Must be between 10s and 120s.`, 502);
  }

  // 5. Scene validation
  for (let i = 0; i < story.scenes.length; i++) {
    const scene = story.scenes[i] as any;

    // Check required fields for Story Script Phase
    if (!scene.description || !scene.setting || typeof scene.duration !== 'number') {
      throw new AppError(`Scene ${i + 1} is missing required fields (description, setting, or duration)`, 502);
    }
  }

  return true;
};
