import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { renderOrchestratorService } from '../services/render-orchestrator.service';
import { jobRepository } from '../repositories/job.repository';
import { AppError } from '../utils/app-error';

const router = Router();

/**
 * POST /render
 * Initiates the rendering process for a given episode definition.
 */
router.post('/render', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { episodeId, episodeUrl } = req.body;

    if (!episodeId) {
      return next(new AppError('episodeId is required', 400));
    }

    if (!episodeUrl) {
      return next(new AppError('episodeUrl is required', 400));
    }

    // Basic URL validation
    try {
      new URL(episodeUrl);
    } catch (e) {
      return next(new AppError('Invalid episodeUrl', 400));
    }

    const jobId = uuidv4();
    console.log(`[render-service]: Received render request. episodeId: ${episodeId}, jobId: ${jobId}`);

    // Fire and forget: Start the render job in the background
    renderOrchestratorService.startRenderJob(jobId, episodeId, episodeUrl);

    res.status(202).json({
      status: 'processing',
      message: 'Render process initiated',
      data: {
        jobId: jobId,
        episodeId: episodeId
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /render/:jobId
 * Retrieves the status of a render job.
 */
router.get('/render/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const job = jobRepository.findById(jobId as string);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
