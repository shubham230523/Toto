import { RenderJob, JobStatus } from '../models/job.model';

export class JobRepository {
  private jobs: Map<string, RenderJob> = new Map();

  create(jobId: string, episodeId: string): RenderJob {
    const job: RenderJob = {
      jobId,
      episodeId,
      status: JobStatus.QUEUED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(jobId, job);
    return job;
  }

  update(jobId: string, updates: Partial<RenderJob>): RenderJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.status === JobStatus.COMPLETED) {
      updatedJob.completedAt = new Date();
    }

    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  findById(jobId: string): RenderJob | null {
    return this.jobs.get(jobId) || null;
  }

  listAll(): RenderJob[] {
    return Array.from(this.jobs.values());
  }
}

export const jobRepository = new JobRepository();
