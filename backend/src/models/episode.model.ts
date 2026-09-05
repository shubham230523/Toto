export enum EpisodeStatus {
  GENERATING = 'generating',
  RENDERING = 'rendering',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export interface Episode {
  id: string;
  title: string;
  video_url?: string;
  duration?: number;
  characters: string[];
  status: EpisodeStatus;
  created_at: Date;
}

export interface CreateEpisodeDto {
  title: string;
  video_url?: string;
  duration?: number;
  characters?: string[];
  status?: EpisodeStatus;
}
