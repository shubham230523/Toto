import { assetRepository } from '../repositories/asset.repository';
import { assetGeneratorService } from './asset-generator.service';
import { Asset, AssetType } from '../models/asset.model';

export interface AssetRequirement {
  name: string;
  type: AssetType;
  metadata?: Record<string, any>;
}

export interface ResolutionResult {
  found: boolean;
  generated: boolean;
  asset?: Asset;
  requirement: AssetRequirement;
}

export class AssetResolver {
  /**
   * Resolves an asset requirement by searching the library or generating it if missing.
   */
  async resolve(requirement: AssetRequirement, autoGenerate: boolean = true): Promise<ResolutionResult> {
    // 1. Search existing library
    let asset = await assetRepository.findByTypeAndName(requirement.type, requirement.name);

    if (asset) {
      return {
        found: true,
        generated: false,
        asset,
        requirement,
      };
    }

    // 2. If not found and auto-generate is disabled, report missing
    if (!autoGenerate) {
      return {
        found: false,
        generated: false,
        requirement,
      };
    }

    // 3. Generate missing asset
    try {
      let generatedAsset: Asset;

      switch (requirement.type) {
        case AssetType.CHARACTER:
          generatedAsset = await assetGeneratorService.generateCharacter(requirement.name);
          break;
        case AssetType.EXPRESSION:
          const charName = requirement.metadata?.characterName || requirement.name.split('_')[0];
          const expression = requirement.metadata?.expression || requirement.name.split('_')[1] || 'idle';
          generatedAsset = await assetGeneratorService.generateExpression(charName, expression);
          break;
        case AssetType.BACKGROUND:
          generatedAsset = await assetGeneratorService.generateBackground(requirement.name);
          break;
        case AssetType.OBJECT:
          generatedAsset = await assetGeneratorService.generateObject(requirement.name);
          break;
        case AssetType.AUDIO:
          const text = requirement.metadata?.text || requirement.name;
          const voice = requirement.metadata?.voice;
          generatedAsset = await assetGeneratorService.generateSpeech(requirement.name, text, voice);
          break;
        default:
          return { found: false, generated: false, requirement };
      }

      return {
        found: true,
        generated: true,
        asset: generatedAsset,
        requirement,
      };
    } catch (error) {
      console.error(`[AssetResolver]: Failed to auto-generate asset ${requirement.name} (${requirement.type})`, error);
      return {
        found: false,
        generated: false,
        requirement,
      };
    }
  }

  /**
   * Resolves a list of asset requirements.
   */
  async resolveMany(requirements: AssetRequirement[], autoGenerate: boolean = true): Promise<ResolutionResult[]> {
    // We process sequentially to avoid potential race conditions if multiple scripts
    // require the same new asset simultaneously, although repository handles it via unique constraints.
    // Sequential also helps keep image provider rate limits in check.
    const results: ResolutionResult[] = [];
    for (const req of requirements) {
      results.push(await this.resolve(req, autoGenerate));
    }
    return results;
  }
}

export const assetResolver = new AssetResolver();
