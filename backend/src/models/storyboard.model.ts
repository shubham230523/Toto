import { Scene } from './scene.model';
import { AssetType } from './asset.model';

export interface RequiredAsset {
  name: string;
  type: AssetType;
  url?: string; // Resolved URL
}

/**
 * Storyboard model representing a production-ready plan for an episode.
 * It combines high-level episode information with technical scene
 * instructions and a manifest of required assets.
 */
export interface Storyboard {
  title: string;
  learningConcept: string;
  scenes: Scene[];
  requiredAssets: RequiredAsset[];
  estimatedDuration: number;
}

export interface StoryboardRecord extends Storyboard {
  id: string;
  created_at: Date;
}
