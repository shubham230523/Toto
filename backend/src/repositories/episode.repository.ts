import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Episode, EpisodeStatus, CreateEpisodeDto } from '../models/episode.model';
import { characterRepository } from './character.repository';

export class EpisodeRepository {
  private readonly tableName = 'episodes';

  private mapFromDb(row: any): Episode {
    return {
      ...row,
      characters: typeof row.characters === 'string' ? JSON.parse(row.characters) : row.characters,
    };
  }

  /**
   * Creates a new episode record.
   */
  async create(data: CreateEpisodeDto): Promise<Episode> {
    const id = uuidv4();
    await db(this.tableName)
      .insert({
        id,
        title: data.title,
        video_url: data.video_url,
        duration: data.duration,
        characters: JSON.stringify(data.characters || []),
        status: data.status || EpisodeStatus.GENERATING,
      });

    const episode = await this.findById(id);
    if (!episode) throw new Error('Failed to create episode');
    return episode;
  }

  /**
   * Finds an episode by its unique ID.
   */
  async findById(id: string): Promise<Episode | null> {
    const row = await db(this.tableName)
      .where({ id })
      .first();

    return row ? this.mapFromDb(row) : null;
  }

  /**
   * Lists all episodes with 'ready' status.
   */
  async listReady(): Promise<Episode[]> {
    const rows = await db(this.tableName)
      .where({ status: EpisodeStatus.READY })
      .orderBy('created_at', 'desc');

    return rows.map(r => this.mapFromDb(r));
  }

  /**
   * Updates an existing episode.
   */
  async update(id: string, data: Partial<Episode>): Promise<Episode | null> {
    await db(this.tableName)
      .where({ id })
      .update(data);

    return this.findById(id);
  }

  /**
   * Gets a random episode with 'ready' status, weighted by character participation.
   * @param excludeIds Optional list of episode IDs to exclude from selection.
   */
  async getRandomReady(excludeIds: string[] = []): Promise<Episode | null> {
    // 1. Fetch all eligible ready episodes
    let query = db(this.tableName).where({ status: EpisodeStatus.READY });
    if (excludeIds.length > 0) {
      query = query.whereNotIn('id', excludeIds);
    }

    let rows = await query;

    // 2. Fallback if exclusion resulted in no episodes
    if (rows.length === 0 && excludeIds.length > 0) {
      rows = await db(this.tableName).where({ status: EpisodeStatus.READY });
    }

    if (rows.length === 0) return null;

    const episodes = rows.map(r => this.mapFromDb(r));

    // 3. Perform Weighted Selection
    const characterWeights = await characterRepository.getNameWeightMap();

    // Calculate total weights for each episode
    const episodeWeights = episodes.map(ep => {
      let weight = 0;
      const namesList = Array.isArray(ep.characters) ? ep.characters : [];

      for (const name of namesList) {
        weight += characterWeights[name] || 10; // default weight 10
      }
      return Math.max(weight, 1);
    });

    const totalWeight = episodeWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < episodes.length; i++) {
      random -= episodeWeights[i];
      if (random <= 0) {
        return episodes[i];
      }
    }

    return episodes[0];
  }
}

export const episodeRepository = new EpisodeRepository();
