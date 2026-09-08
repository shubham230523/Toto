import { Scene, SceneDialogue } from './scene.model';

export interface Story {
  id: string;
  title: string;
  learningConcept: string;
  characters: string[];
  scenes: Scene[];
  dialogue: SceneDialogue[];
  estimatedDuration: number;
  created_at: Date;
}

export interface CreateStoryDto {
  title: string;
  learningConcept: string;
  characters: string[];
  scenes: any[]; // Use any because script phase has different scene fields
  dialogue: SceneDialogue[];
  estimatedDuration: number;
}
