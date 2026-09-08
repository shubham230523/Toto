import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Character, CreateCharacterDto } from '../models/character.model';

export class CharacterRepository {
  private readonly tableName = 'characters';

  private mapFromDb(row: any): Character {
    return {
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }

  async create(data: CreateCharacterDto): Promise<Character> {
    const id = uuidv4();
    await db(this.tableName)
      .insert({
        ...data,
        id,
        metadata: JSON.stringify(data.metadata || {}),
      });

    const character = await this.findById(id);
    if (!character) throw new Error('Failed to create character');
    return character;
  }

  async findById(id: string): Promise<Character | null> {
    const row = await db(this.tableName)
      .where({ id })
      .first();

    return row ? this.mapFromDb(row) : null;
  }

  async findByName(name: string): Promise<Character | null> {
    const row = await db(this.tableName)
      .where({ name })
      .first();

    return row ? this.mapFromDb(row) : null;
  }

  async listAll(): Promise<Character[]> {
    const rows = await db(this.tableName).orderBy('name', 'asc');
    return rows.map(r => this.mapFromDb(r));
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
