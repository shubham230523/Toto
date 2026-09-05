import { db } from '../config/database';
import { Storyboard, StoryboardRecord } from '../models/storyboard.model';

export class StoryboardRepository {
  private readonly tableName = 'storyboards';

  async create(data: Storyboard): Promise<StoryboardRecord> {
    const [record] = await db(this.tableName)
      .insert({
        title: data.title,
        learning_concept: data.learningConcept,
        scenes: JSON.stringify(data.scenes),
        required_assets: JSON.stringify(data.requiredAssets),
        estimated_duration: data.estimatedDuration,
      })
      .returning('*');

    return record;
  }

  async findById(id: string): Promise<StoryboardRecord | null> {
    const record = await db(this.tableName)
      .where({ id })
      .first();

    return record || null;
  }

  async listAll(): Promise<StoryboardRecord[]> {
    return db(this.tableName).orderBy('created_at', 'desc');
  }
}

export const storyboardRepository = new StoryboardRepository();
