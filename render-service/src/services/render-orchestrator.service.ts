import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import { config } from '../config';
import { jobRepository } from '../repositories/job.repository';
import { JobStatus } from '../models/job.model';
import { videoStorageService } from './video-storage.service';

export class RenderOrchestratorService {
  private readonly tempDir: string;

  constructor() {
    this.tempDir = path.resolve(__dirname, '../../temp');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('[RenderOrchestrator]: Failed to create temp directory', error);
    }
  }

  /**
   * Starts a render job in the background.
   */
  async startRenderJob(jobId: string, episodeId: string, episodeUrl: string): Promise<void> {
    try {
      jobRepository.create(jobId, episodeId);

      // 1. Download the episode definition
      const response = await axios.get(episodeUrl);
      const episodeData = response.data;

      // 2. Save to a temporary file for Godot
      const tempFilePath = path.join(this.tempDir, `${jobId}.json`);
      await fs.writeFile(tempFilePath, JSON.stringify(episodeData));

      // 3. Prepare Godot arguments
      const outputVideoName = `${jobId}.avi`; // Rendered as AVI by Godot
      const finalVideoName = `${jobId}.mp4`;  // Target name after storage

      const godotArgs = [
        '--headless',
        '--path', path.resolve(config.godot.projectPath),
        '--write-movie', path.join(path.resolve(config.godot.projectPath), `output/${outputVideoName}`),
        '--',
        '--episode', tempFilePath
      ];

      console.log(`[RenderOrchestrator]: Spawning Godot for job ${jobId}`);
      jobRepository.update(jobId, { status: JobStatus.RENDERING });

      const godotProcess = spawn(config.godot.binaryPath, godotArgs);

      let renderResult: any = null;

      godotProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('RENDER_RESULT:')) {
            try {
              const resultStr = output.split('RENDER_RESULT:')[1].trim();
              renderResult = JSON.parse(resultStr);
            } catch (e) {
              console.error(`[RenderOrchestrator]: Failed to parse render result for job ${jobId}`, e);
            }
        }
      });

      godotProcess.on('close', async (code) => {
        console.log(`[RenderOrchestrator]: Job ${jobId} process exited with code ${code}`);

        try {
          if (code === 0 && renderResult && renderResult.status === 'success') {
            // 4. Upload the video to object storage
            const localVideoPath = path.join(path.resolve(config.godot.projectPath), `output/${outputVideoName}`);
            const publicUrl = await videoStorageService.uploadVideo(localVideoPath, finalVideoName);

            // 5. Update the render job
            jobRepository.update(jobId, {
              status: JobStatus.COMPLETED,
              outputUrl: publicUrl
            });

            // 6. Update the episode status to READY in the main backend
            await axios.patch(`${config.backend.apiUrl}/episodes/${episodeId}`, {
              status: 'ready',
              video_url: publicUrl,
              duration: Math.round(renderResult.duration || 0)
            });

            console.log(`[RenderOrchestrator]: Job ${jobId} COMPLETED and backend notified.`);
          } else {
            jobRepository.update(jobId, {
              status: JobStatus.FAILED,
              error: renderResult?.error || `Process exited with code ${code}`
            });
          }
        } catch (error: any) {
          console.error(`[RenderOrchestrator]: Post-render failure for job ${jobId}`, error.message);
          jobRepository.update(jobId, { status: JobStatus.FAILED, error: error.message });
        } finally {
          // Cleanup temp file
          try {
            await fs.unlink(tempFilePath);
          } catch (e) {}
        }
      });

    } catch (error: any) {
      console.error(`[RenderOrchestrator]: Failed to initiate job ${jobId}`, error.message);
      jobRepository.update(jobId, { status: JobStatus.FAILED, error: error.message });
    }
  }
}

export const renderOrchestratorService = new RenderOrchestratorService();
