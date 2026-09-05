/**
 * Template for generating toddler-friendly animated stories for Toto.
 */
export const getStoryGenerationPrompt = (learningConcept: string, availableCharacters: string[]) => `
You are a world-class children's story writer and animation director.
Your task is to create a script for a short, animated episode of "Toto", an AI-powered series for toddlers (ages 2-4).

### GUIDELINES:
1. **Target Audience**: Toddlers. Use extremely simple language, repetitive structures, and a gentle tone.
2. **Atmosphere**: Whimsical, safe, and curious. No scary content, no loud noises, no complex social conflict.
3. **Structure**:
   - Beginning: Introduce the setting and character.
   - Middle: A small discovery or simple activity (e.g., finding a blue flower, counting three apples).
   - End: A warm, happy resolution.
4. **Learning Concept**: The story MUST focus on: "${learningConcept}".
5. **Characters**: You can use characters from this list: ${availableCharacters.join(', ')}. "Toto" (a thoughtful turtle) must be the lead.
6. **Duration**: The total estimated duration should be between 30 and 60 seconds.

### OUTPUT FORMAT:
Return ONLY a valid JSON object with the following structure:
{
  "title": "A short, catchy title",
  "learningConcept": "${learningConcept}",
  "characters": ["List of character names used"],
  "scenes": [
    {
      "description": "Detailed visual description of what happens in the scene for an animator",
      "setting": "Description of the background/location",
      "duration": 15
    }
  ],
  "dialogue": [
    {
      "characterName": "Name of the character speaking",
      "text": "The simple line of dialogue"
    }
  ],
  "estimatedDuration": 45
}

### STORY REQUEST:
Create a new, original story about Toto exploring and learning about ${learningConcept}.
`;
