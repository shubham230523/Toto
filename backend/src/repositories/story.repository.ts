import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Story, CreateStoryDto } from '../models/story.model';

export class StoryRepository {
  private readonly tableName = 'stories';

  async create(data: CreateStoryDto): Promise<Story> {
    const id = uuidv4();
    await db(this.tableName)
      .insert({
        id,
        title: data.title,
        learning_concept: data.learningConcept,
        characters: JSON.stringify(data.characters),
        scenes: JSON.stringify(data.scenes),
        estimated_duration: data.estimatedDuration,
      });

    const story = await this.findById(id);
    if (!story) throw new Error('Failed to create story');
    return story;
  }

  async findById(id: string): Promise<Story | null> {
    const story = await db(this.tableName)
      .where({ id })
      .first();

    return story || null;
  }

  async listAll(): Promise<Story[]> {
    return db(this.tableName).orderBy('created_at', 'desc');
  }
}

export const storyRepository = new StoryRepository();
