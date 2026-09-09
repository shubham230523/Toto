import { CreateStoryDto } from '../models/story.model';
import { Storyboard } from '../models/storyboard.model';
import { AssetType } from '../models/asset.model';
import { ActionType } from '../models/animation-action.model';

export const getMockStory = (concept: string): CreateStoryDto => ({
  title: `Mock: ${concept}`,
  learningConcept: concept,
  characters: ['Toto', 'Bobo'],
  scenes: [
    {
      description: "Toto is walking in a bright meadow.",
      setting: "A sunny meadow with green grass.",
      duration: 10
    },
    {
      description: "Bobo joins Toto and they wave hello.",
      setting: "The same sunny meadow.",
      duration: 10
    }
  ],
  dialogue: [
    { characterName: 'Toto', text: 'Hello Bobo!' },
    { characterName: 'Bobo', text: 'Hello Toto! Let us learn about things.' }
  ],
  estimatedDuration: 20
});

export const getMockStoryboard = (story: any): Storyboard => ({
  title: story.title,
  learningConcept: story.learningConcept,
  requiredAssets: [
    { name: 'Toto', type: AssetType.CHARACTER, metadata: { species: 'turtle' } },
    { name: 'Bobo', type: AssetType.CHARACTER, metadata: { species: 'bear' } },
    { name: 'bg_meadow', type: AssetType.BACKGROUND, metadata: { description: 'sunny meadow' } },
    { name: 'audio_toto_hello', type: AssetType.AUDIO, metadata: { text: 'Hello Bobo!' } },
    { name: 'audio_bobo_hello', type: AssetType.AUDIO, metadata: { text: 'Hello Toto!' } }
  ],
  scenes: [
    {
      background: 'bg_meadow',
      duration: 10,
      characters: ['Toto'],
      objects: [],
      dialogue: [],
      actions: [
        { type: ActionType.SHOW, target: 'Toto', params: { x: 400, y: 800 }, startTime: 0, duration: 1 },
        { type: ActionType.MOVE, target: 'Toto', params: { x: 800, y: 800 }, startTime: 1, duration: 5 }
      ]
    },
    {
      background: 'bg_meadow',
      duration: 10,
      characters: ['Toto', 'Bobo'],
      objects: [],
      dialogue: [],
      actions: [
        { type: ActionType.SHOW, target: 'Bobo', params: { x: 1200, y: 800 }, startTime: 0, duration: 1 },
        { type: ActionType.SPEAK, target: 'Toto', params: { sound: 'audio_toto_hello' }, startTime: 1, duration: 2 },
        { type: ActionType.SPEAK, target: 'Bobo', params: { sound: 'audio_bobo_hello' }, startTime: 4, duration: 2 }
      ]
    }
  ],
  estimatedDuration: 20
});
