import { Scene } from './scene.model';

export interface Story {
  id: string;
  title: string;
  learningConcept: string;
  characters: string[];
  scenes: Scene[];
  estimatedDuration: number;
  created_at: Date;
}

export interface CreateStoryDto {
  title: string;
  learningConcept: string;
  characters: string[];
  scenes: Scene[];
  estimatedDuration: number;
}
