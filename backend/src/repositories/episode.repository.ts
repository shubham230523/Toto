import { db } from '../config/database';
import { Episode, EpisodeStatus, CreateEpisodeDto } from '../models/episode.model';

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
   * Gets a random episode with 'ready' status.
   */
  async getRandomReady(): Promise<Episode | null> {
    const episode = await db(this.tableName)
      .where({ status: EpisodeStatus.READY })
      .orderByRaw('RANDOM()')
      .first();

    return episode || null;
  }
}

export const episodeRepository = new EpisodeRepository();
