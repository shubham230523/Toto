export interface Character {
  id: string;
  name: string;
  species: string;
  personality: string;
  appearance: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface CreateCharacterDto {
  name: string;
  species: string;
  personality: string;
  appearance: string;
  metadata?: Record<string, any>;
}
