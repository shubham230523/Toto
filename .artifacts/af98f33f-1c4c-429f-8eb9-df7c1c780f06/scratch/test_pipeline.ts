import { contentGenerationService } from '../../../backend/src/services/content-generation.service';
import { geminiService } from '../../../backend/src/services/gemini.service';
import { characterRepository } from '../../../backend/src/repositories/character.repository';

// This is a scratch script to verify the generation pipeline logic
async function runTest() {
  console.log('Starting Pipeline Test...');

  // 1. Mock Gemini Responses
  jest.spyOn(geminiService, 'generateJson').mockImplementation(async (prompt: string) => {
    if (prompt.includes('STORY')) {
      return {
        title: 'Toto and the Big Red Apple',
        learningConcept: 'Colors',
        characters: ['Toto'],
        scenes: [
          {
            background: 'forest',
            duration: 5,
            actions: [{ type: 'SHOW', target: 'Toto' }]
          }
        ]
      };
    } else {
      return {
        title: 'Toto and the Big Red Apple',
        requiredAssets: [
          { name: 'Toto', type: 'character', description: 'A turtle' },
          { name: 'forest', type: 'background', description: 'A lush forest' }
        ],
        scenes: []
      };
    }
  });

  // 2. Mock Character Repo
  jest.spyOn(characterRepository, 'listAll').mockResolvedValue([
    { id: '1', name: 'Toto', weight: 10, metadata: {} } as any
  ]);

  try {
    const result = await contentGenerationService.generateCompleteEpisode('Apples');
    console.log('Pipeline Success!', result.episode.id);
  } catch (error) {
    console.error('Pipeline Failed!', error);
  }
}

// In a real environment, I'd run this with ts-node
