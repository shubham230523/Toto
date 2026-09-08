import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Storyboard, StoryboardRecord } from '../models/storyboard.model';

export class StoryboardRepository {
  private readonly tableName = 'storyboards';

  private mapFromDb(row: any): StoryboardRecord {
    return {
      ...row,
      scenes: typeof row.scenes === 'string' ? JSON.parse(row.scenes) : row.scenes,
      requiredAssets: typeof row.required_assets === 'string' ? JSON.parse(row.required_assets) : row.required_assets,
      learningConcept: row.learning_concept,
      estimatedDuration: row.estimated_duration,
    };
  }

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
    const row = await db(this.tableName)
      .where({ id })
      .first();

    return row ? this.mapFromDb(row) : null;
  }

  async listAll(): Promise<StoryboardRecord[]> {
    const rows = await db(this.tableName).orderBy('created_at', 'desc');
    return rows.map(r => this.mapFromDb(r));
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
