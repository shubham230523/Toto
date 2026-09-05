import { db } from '../config/database';
import { Character, CreateCharacterDto } from '../models/character.model';

export class CharacterRepository {
  private readonly tableName = 'characters';

  async create(data: CreateCharacterDto): Promise<Character> {
    const [character] = await db(this.tableName)
      .insert({
        ...data,
        metadata: JSON.stringify(data.metadata || {}),
      })
      .returning('*');

    return character;
  }

  async findById(id: string): Promise<Character | null> {
    const character = await db(this.tableName)
      .where({ id })
      .first();

    return character || null;
  }

  async findByName(name: string): Promise<Character | null> {
    const character = await db(this.tableName)
      .where({ name })
      .first();

    return character || null;
  }

  async listAll(): Promise<Character[]> {
    return db(this.tableName).orderBy('name', 'asc');
  }

  /**
   * Returns a map of character names to their weights.
   */
  async getNameWeightMap(): Promise<Record<string, number>> {
    const weights = await db(this.tableName).select('name', 'weight');
    return weights.reduce((acc, curr) => {
      acc[curr.name] = curr.weight;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const characterRepository = new CharacterRepository();
