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
}

export const characterRepository = new CharacterRepository();
