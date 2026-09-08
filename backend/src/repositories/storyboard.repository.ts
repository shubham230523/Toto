import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Storyboard, StoryboardRecord } from '../models/storyboard.model';

export class StoryboardRepository {
  private readonly tableName = 'storyboards';

  async create(data: Storyboard): Promise<StoryboardRecord> {
    const id = uuidv4();
    await db(this.tableName)
      .insert({
        id,
        title: data.title,
        learning_concept: data.learningConcept,
        scenes: JSON.stringify(data.scenes),
        required_assets: JSON.stringify(data.requiredAssets),
        estimated_duration: data.estimatedDuration,
      });

    const record = await this.findById(id);
    if (!record) throw new Error('Failed to create storyboard');
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

  async update(id: string, data: Partial<Storyboard>): Promise<StoryboardRecord | null> {
    const updateData: any = { ...data };
    if (data.scenes) {
      updateData.scenes = JSON.stringify(data.scenes);
    }
    if (data.requiredAssets) {
      updateData.required_assets = JSON.stringify(data.requiredAssets);
      delete updateData.requiredAssets;
    }
    if (data.learningConcept) {
      updateData.learning_concept = data.learningConcept;
      delete updateData.learningConcept;
    }
    if (data.estimatedDuration) {
      updateData.estimated_duration = data.estimatedDuration;
      delete updateData.estimatedDuration;
    }

    await db(this.tableName)
      .where({ id })
      .update(updateData);

    return this.findById(id);
  }
}

export const storyboardRepository = new StoryboardRepository();
