export enum JobStatus {
  QUEUED = 'QUEUED',
  RENDERING = 'RENDERING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface RenderJob {
  jobId: string;
  episodeId: string;
  status: JobStatus;
  outputUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
