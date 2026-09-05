import { CreateStoryDto } from '../models/story.model';
import { AppError } from './app-error';

export const validateGeneratedStory = (story: CreateStoryDto, availableCharacters: string[]) => {
  // 1. Missing required fields in Story
  if (!story.title) throw new AppError('Story title is missing', 502);
  if (!story.learningConcept) throw new AppError('Learning concept is missing', 502);
  if (!story.characters || !Array.isArray(story.characters)) throw new AppError('Characters list is missing or malformed', 502);
  if (!story.scenes || !Array.isArray(story.scenes)) throw new AppError('Scenes list is missing or malformed', 502);
  if (typeof story.estimatedDuration !== 'number') throw new AppError('Estimated duration is missing or not a number', 502);

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
    const scene = story.scenes[i];

    // Check required fields in Scene
    if (!scene.background || typeof scene.duration !== 'number' || !scene.characters || !scene.objects || !scene.actions) {
      throw new AppError(`Scene ${i + 1} is missing required fields`, 502);
    }

    // Check dialogue in Scene if it exists
    if (scene.dialogue) {
      if (!Array.isArray(scene.dialogue)) throw new AppError(`Scene ${i + 1} dialogue is not an array`, 502);
      for (let j = 0; j < scene.dialogue.length; j++) {
        const line = scene.dialogue[j];
        if (!line.characterName || !line.text) {
          throw new AppError(`Scene ${i + 1} dialogue line ${j + 1} is malformed`, 502);
        }
        if (!availableCharacters.includes(line.characterName)) {
           throw new AppError(`Scene ${i + 1} dialogue line ${j + 1} references unknown character: ${line.characterName}`, 502);
        }
      }
    }

    // Check actions in Scene
    if (!Array.isArray(scene.actions)) throw new AppError(`Scene ${i + 1} actions is not an array`, 502);
    for (let j = 0; j < scene.actions.length; j++) {
      const action = scene.actions[j];
      if (!action.type || !action.params) {
        throw new AppError(`Scene ${i + 1} action ${j + 1} is malformed`, 502);
      }
    }
  }

  return true;
};
