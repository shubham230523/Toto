import { AnimationAction } from './animation-action.model';

export interface SceneDialogue {
  characterName: string;
  text: string;
}

export interface Scene {
  background: string; // Name or ID of the background asset
  duration: number; // in seconds
  characters: string[]; // List of character names/IDs present in the scene
  objects: string[]; // List of object names/IDs present in the scene
  dialogue: SceneDialogue[];
  actions: AnimationAction[];
}
