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

/**
 * Template for converting a Story script into a technical Storyboard for Godot.
 */
export const getStoryboardGenerationPrompt = (story: any) => `
You are a technical Animation Director.
Your task is to convert a children's story script into a detailed, machine-readable Storyboard for the Godot animation engine.

### INPUT STORY:
Title: ${story.title}
Concept: ${story.learningConcept}
Characters: ${story.characters.join(', ')}
Total Duration: ${story.estimatedDuration} seconds

### CONSTRAINTS:
1. **No Code**: Do NOT return any Godot GDScript or programming code.
2. **Strict Actions**: Use ONLY these action types: SHOW, HIDE, MOVE, ANIMATE, WAIT, SPEAK, PLAY_SOUND, ROTATE, SCALE.
3. **Asset Manifest**: Identify all unique assets (characters, backgrounds, objects, expressions, audio) required.
4. **Target Coordinates**: For MOVE actions, use a 1920x1080 coordinate system.
5. **JSON Only**: Return ONLY a valid JSON object.

### OUTPUT FORMAT:
{
  "title": "${story.title}",
  "learningConcept": "${story.learningConcept}",
  "requiredAssets": [
    { "name": "asset_name", "type": "character|background|object|expression|audio" }
  ],
  "scenes": [
    {
      "background": "background_name",
      "duration": 15,
      "characters": ["name1", "name2"],
      "objects": ["obj1"],
      "dialogue": [
        { "characterName": "Toto", "text": "Hello!" }
      ],
      "actions": [
        {
          "type": "MOVE",
          "target": "Toto",
          "params": { "x": 500, "y": 800 },
          "startTime": 0,
          "duration": 2
        }
      ]
    }
  ],
  "estimatedDuration": ${story.estimatedDuration}
}

### SCRIPT TO CONVERT:
${JSON.stringify(story.scenes, null, 2)}
`;
