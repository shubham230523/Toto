import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { Asset, AssetType, CreateAssetDto } from '../models/asset.model';

export class AssetRepository {
  private readonly tableName = 'assets';

  /**
   * Creates a new asset record.
   */
  async create(data: CreateAssetDto): Promise<Asset> {
    const id = uuidv4();
    await db(this.tableName)
      .insert({
        id,
        name: data.name,
        type: data.type,
        url: data.url,
        metadata: JSON.stringify(data.metadata || {}),
      });

    const asset = await this.findById(id);
    if (!asset) throw new Error('Failed to create asset');
    return asset;
  }

  /**
   * Gets an asset by its unique ID.
   */
  async findById(id: string): Promise<Asset | null> {
    const asset = await db(this.tableName)
      .where({ id })
      .first();

    return asset || null;
  }

  /**
   * Finds an asset by its name.
   */
  async findByName(name: string): Promise<Asset | null> {
    const asset = await db(this.tableName)
      .where({ name })
      .first();

    return asset || null;
  }

  async findByTypeAndName(type: AssetType, name: string): Promise<Asset | null> {
    const asset = await db(this.tableName)
      .where({ type, name })
      .first();

    return asset || null;
  }

  /**
   * Lists all assets of a specific type.
   */
  async listByType(type: AssetType): Promise<Asset[]> {
    return db(this.tableName)
      .where({ type })
      .orderBy('created_at', 'desc');
  }
}

export const assetRepository = new AssetRepository();
