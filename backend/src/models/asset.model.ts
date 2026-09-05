export enum AssetType {
  CHARACTER = 'character',
  BACKGROUND = 'background',
  OBJECT = 'object',
  EXPRESSION = 'expression',
  AUDIO = 'audio',
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface CreateAssetDto {
  name: string;
  type: AssetType;
  url: string;
  metadata?: Record<string, any>;
}
