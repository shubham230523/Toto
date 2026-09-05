import { Storyboard } from '../models/storyboard.model';
import { ActionType } from '../models/animation-action.model';
import { AppError } from './app-error';

export const validateGeneratedStoryboard = (storyboard: Storyboard) => {
  if (!storyboard.title) throw new AppError('Storyboard title is missing', 502);
  if (!storyboard.requiredAssets || !Array.isArray(storyboard.requiredAssets)) {
    throw new AppError('Storyboard requiredAssets list is missing or malformed', 502);
  }
  if (!storyboard.scenes || !Array.isArray(storyboard.scenes)) {
    throw new AppError('Storyboard scenes list is missing or malformed', 502);
  }

  const validActionTypes = Object.values(ActionType);

  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i];
    if (!scene.background || typeof scene.duration !== 'number' || !scene.actions) {
      throw new AppError(`Storyboard scene ${i + 1} is missing required fields`, 502);
    }

    for (let j = 0; j < scene.actions.length; j++) {
      const action = scene.actions[j];
      if (!validActionTypes.includes(action.type)) {
        throw new AppError(`Storyboard scene ${i + 1} action ${j + 1} has invalid type: ${action.type}`, 502);
      }
      if (!action.params) {
        throw new AppError(`Storyboard scene ${i + 1} action ${j + 1} is missing params`, 502);
      }
    }
  }

  return true;
};
