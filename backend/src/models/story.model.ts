export interface Scene {
  description: string;
  setting: string;
  duration: number; // seconds
}

export interface DialogueLine {
  characterName: string;
  text: string;
}

export interface Story {
  id: string;
  title: string;
  learningConcept: string;
  characters: string[]; // List of character names or IDs
  scenes: Scene[];
  dialogue: DialogueLine[];
  estimatedDuration: number; // Total seconds
  created_at: Date;
}

export interface CreateStoryDto {
  title: string;
  learningConcept: string;
  characters: string[];
  scenes: Scene[];
  dialogue: DialogueLine[];
  estimatedDuration: number;
}
