import { Episode } from './episode.model';
import { Story } from './story.model';
import { StoryboardRecord } from './storyboard.model';
import { Character } from './character.model';
import { Asset } from './asset.model';

/**
 * A comprehensive package containing everything needed for production
 * and playback of a Toto episode.
 */
export interface EpisodePackage {
  episode: Episode;
  story: Story;
  storyboard: StoryboardRecord;
  characters: Character[];
  assets: Asset[];
  packageUrl?: string; // URL to the hosted JSON package
}
