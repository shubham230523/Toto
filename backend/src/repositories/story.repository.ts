import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Story, CreateStoryDto } from '../models/story.model';

export class StoryRepository {
  private readonly tableName = 'stories';

  private mapFromDb(row: any): Story {
    return {
      ...row,
      characters: typeof row.characters === 'string' ? JSON.parse(row.characters) : row.characters,
      scenes: typeof row.scenes === 'string' ? JSON.parse(row.scenes) : row.scenes,
      dialogue: typeof row.dialogue === 'string' ? JSON.parse(row.dialogue) : row.dialogue,
      learningConcept: row.learning_concept,
      estimatedDuration: row.estimated_duration,
    };
  }

  async create(data: CreateStoryDto): Promise<Story> {
    const id = uuidv4();
    await db(this.tableName)
      .insert({
        id,
        title: data.title,
        learning_concept: data.learningConcept,
        characters: JSON.stringify(data.characters),
        scenes: JSON.stringify(data.scenes),
        dialogue: JSON.stringify(data.dialogue),
        estimated_duration: data.estimatedDuration,
      });

    const story = await this.findById(id);
    if (!story) throw new Error('Failed to create story');
    return story;
  }

  async findById(id: string): Promise<Story | null> {
    const row = await db(this.tableName)
      .where({ id })
      .first();

    return row ? this.mapFromDb(row) : null;
  }

  async listAll(): Promise<Story[]> {
    const rows = await db(this.tableName).orderBy('created_at', 'desc');
    return rows.map(r => this.mapFromDb(r));
  }
}

export const storyRepository = new StoryRepository();
