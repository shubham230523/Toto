import { db } from '../config/database';
import { Episode, EpisodeStatus, CreateEpisodeDto } from '../models/episode.model';
import { characterRepository } from './character.repository';

export class EpisodeRepository {
  private readonly tableName = 'episodes';

  /**
   * Creates a new episode record.
   */
  async create(data: CreateEpisodeDto): Promise<Episode> {
    const [episode] = await db(this.tableName)
      .insert({
        title: data.title,
        video_url: data.video_url,
        duration: data.duration,
        characters: JSON.stringify(data.characters || []),
        status: data.status || EpisodeStatus.GENERATING,
      })
      .returning('*');

    return episode;
  }

  /**
   * Finds an episode by its unique ID.
   */
  async findById(id: string): Promise<Episode | null> {
    const episode = await db(this.tableName)
      .where({ id })
      .first();

    return episode || null;
  }

  /**
   * Lists all episodes with 'ready' status.
   */
  async listReady(): Promise<Episode[]> {
    return db(this.tableName)
      .where({ status: EpisodeStatus.READY })
      .orderBy('created_at', 'desc');
  }

  /**
   * Updates an existing episode.
   */
  async update(id: string, data: Partial<Episode>): Promise<Episode | null> {
    const [episode] = await db(this.tableName)
      .where({ id })
      .update(data)
      .returning('*');

    return episode || null;
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

    let episodes = await query;

    // 2. Fallback if exclusion resulted in no episodes
    if (episodes.length === 0 && excludeIds.length > 0) {
      episodes = await db(this.tableName).where({ status: EpisodeStatus.READY });
    }

    if (episodes.length === 0) return null;

    // 3. Perform Weighted Selection
    const characterWeights = await characterRepository.getNameWeightMap();

    // Calculate total weights for each episode
    const episodeWeights = episodes.map(ep => {
      let weight = 0;
      // ep.characters is a JSONB array of strings
      // Note: Knex/PG might return it as a string or an object depending on driver/setup
      const names = typeof ep.characters === 'string' ? JSON.parse(ep.characters) : ep.characters;
      const namesList = Array.isArray(names) ? names : [];

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
