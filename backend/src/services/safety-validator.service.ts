import { geminiService } from './gemini.service';
import { CreateStoryDto } from '../models/story.model';

export interface SafetyResult {
  isSafe: boolean;
  reason?: string;
  flaggedCategories?: string[];
}

export class SafetyValidatorService {
  /**
   * Audits generated story content for toddler appropriateness and general safety.
   */
  async validateContent(story: CreateStoryDto): Promise<SafetyResult> {
    const safetyPrompt = this.buildSafetyPrompt(story);

    try {
      const result = await geminiService.generateJson<SafetyResult>(safetyPrompt);

      if (typeof result.isSafe !== 'boolean') {
        throw new Error('Invalid safety check response');
      }

      return result;
    } catch (error) {
      console.error('[SafetyValidator]: Check failed', error);
      // Fallback to unsafe if the check itself fails to be cautious
      return { isSafe: false, reason: 'Safety check failed to execute' };
    }
  }

  private buildSafetyPrompt(story: CreateStoryDto): string {
    return "You are a child safety expert and content moderator specializing in toddler media (ages 2-4).\n" +
      "Review the following animated story script for \"Toto\" and determine if it is safe and appropriate.\n\n" +
      "### STORY CONTENT:\n" +
      "Title: " + story.title + "\n" +
      "Learning Concept: " + story.learningConcept + "\n" +
      "Characters: " + story.characters.join(', ') + "\n\n" +
      "SCENES:\n" +
      JSON.stringify(story.scenes, null, 2) + "\n\n" +
      "### SAFETY GUIDELINES:\n" +
      "1. **No Violence**: No hitting, pushing, or aggressive behavior.\n" +
      "2. **No Scary Themes**: No monsters, darkness as a threat, or abandonment.\n" +
      "3. **No Inappropriate Language**: No slang, insults, or adult concepts.\n" +
      "4. **No Unsafe Imitation**: No character playing near traffic, water without supervision, or handling sharp objects.\n" +
      "5. **Tone**: Must be gentle, kind, and educational.\n\n" +
      "### OUTPUT FORMAT:\n" +
      "Return ONLY a valid JSON object:\n" +
      "{\n" +
      "  \"isSafe\": true | false,\n" +
      "  \"reason\": \"Brief explanation if not safe\",\n" +
      "  \"flaggedCategories\": [\"List of violated categories if any\"]\n" +
      "}";
  }
}

export const safetyValidatorService = new SafetyValidatorService();
