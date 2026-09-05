import axios from 'axios';
import { config } from '../config';
import { localStorageService } from './local-storage.service';
import { geminiService } from './gemini.service';
import { assetResolver } from './asset-resolver.service';
import { characterRepository } from '../repositories/character.repository';
import { storyRepository } from '../repositories/story.repository';
import { storyboardRepository } from '../repositories/storyboard.repository';
import { episodeRepository } from '../repositories/episode.repository';
import { getStoryGenerationPrompt, getStoryboardGenerationPrompt } from '../utils/prompt-templates';
import { validateGeneratedStory } from '../utils/story-validator';
import { validateGeneratedStoryboard } from '../utils/storyboard-validator';
import { CreateStoryDto } from '../models/story.model';
import { Storyboard } from '../models/storyboard.model';
import { EpisodePackage } from '../models/episode-package.model';
import { EpisodeStatus } from '../models/episode.model';
import { AppError } from '../utils/app-error';

export class ContentGenerationService {
  /**
   * Orchestrates the complete flow from a learning concept to a finalized storyboard
   * with all required assets resolved.
   */
  async generateCompleteEpisode(learningConcept: string): Promise<EpisodePackage> {
    console.log(`[ContentGeneration]: Starting generation for concept: "${learningConcept}"`);

    // 1. Initial Episode Record
    const episodeRecord = await episodeRepository.create({
      title: 'Generating...',
      status: EpisodeStatus.GENERATING,
    });

    // 2. Story Generation
    const characters = await characterRepository.listAll();
    const characterNames = characters.map(c => c.name);

    const storyPrompt = getStoryGenerationPrompt(learningConcept, characterNames);
    const storyData = await geminiService.generateJson<CreateStoryDto>(storyPrompt);

    // 3. Story Validation
    validateGeneratedStory(storyData, characterNames);
    const story = await storyRepository.create(storyData);

    // Update episode title
    await episodeRepository.update(episodeRecord.id, { title: story.title });

    console.log(`[ContentGeneration]: Story generated and validated: "${story.title}"`);

    // 4. Storyboard Generation
    const storyboardPrompt = getStoryboardGenerationPrompt(story);
    const storyboardData = await geminiService.generateJson<Storyboard>(storyboardPrompt);

    // 5. Storyboard Validation
    validateGeneratedStoryboard(storyboardData);
    const storyboardRecord = await storyboardRepository.create(storyboardData);
    console.log(`[ContentGeneration]: Storyboard generated and validated.`);

    // 6. Asset Resolution (Search & Auto-Generate if missing)
    console.log(`[ContentGeneration]: Resolving ${storyboardRecord.requiredAssets.length} assets...`);
    const resolutionResults = await assetResolver.resolveMany(storyboardRecord.requiredAssets);

    // 7. Update Storyboard with Resolved Asset URLs
    const updatedRequiredAssets = storyboardRecord.requiredAssets.map(req => {
      const resolved = resolutionResults.find(r =>
        r.requirement.name === req.name && r.requirement.type === req.type
      );
      return {
        ...req,
        url: resolved?.asset?.url,
      };
    });

    const finalStoryboard = await storyboardRepository.update(storyboardRecord.id, {
      requiredAssets: updatedRequiredAssets,
    });

    if (!finalStoryboard) {
      throw new AppError('Failed to update storyboard with resolved assets', 500);
    }

    const resolvedAssets = resolutionResults
      .filter(r => r.found)
      .map(r => r.asset as any);

    // 8. Assemble Package
    const finalEpisode = await episodeRepository.findById(episodeRecord.id);

    const episodePackage: EpisodePackage = {
      episode: finalEpisode!,
      story,
      storyboard: finalStoryboard,
      characters: characters.filter(c => story.characters.includes(c.name)),
      assets: resolvedAssets,
    };

    // 9. Store the Package as a JSON file
    const packageFileName = `package_${finalEpisode!.id}.json`;
    const packageUrl = await localStorageService.saveFile(
      Buffer.from(JSON.stringify(episodePackage, null, 2)),
      packageFileName,
      'episodes'
    );

    // 10. Trigger Render Process
    this.triggerRender(finalEpisode!.id, packageUrl).catch(err => {
      console.error(`[ContentGeneration]: Failed to trigger render for ${finalEpisode!.id}`, err.message);
      episodeRepository.update(finalEpisode!.id, { status: EpisodeStatus.FAILED });
    });

    return {
      ...episodePackage,
      packageUrl,
    };
  }

  /**
   * Sends a render request to the Godot Render Service.
   */
  private async triggerRender(episodeId: string, packageUrl: string): Promise<void> {
    console.log(`[ContentGeneration]: Triggering render for episode ${episodeId}`);

    // Update status to RENDERING before calling the service
    await episodeRepository.update(episodeId, { status: EpisodeStatus.RENDERING });

    await axios.post(`${config.renderService.url}/render`, {
      episodeId,
      episodeUrl: packageUrl,
    });
  }
}

export const contentGenerationService = new ContentGenerationService();
