import { db } from '../config/database';
import { Asset, AssetType, CreateAssetDto } from '../models/asset.model';

export class AssetRepository {
  private readonly tableName = 'assets';

  /**
   * Creates a new asset record.
   */
  async create(data: CreateAssetDto): Promise<Asset> {
    const [asset] = await db(this.tableName)
      .insert({
        name: data.name,
        type: data.type,
        url: data.url,
        metadata: JSON.stringify(data.metadata || {}),
      })
      .returning('*');

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
   * Since multiple assets might have the same name (e.g., across different types),
   * this returns the first match.
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
