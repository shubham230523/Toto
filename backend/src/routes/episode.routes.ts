import { Router, Request, Response, NextFunction } from 'express';
import { episodeRepository } from '../repositories/episode.repository';
import { EpisodeStatus } from '../models/episode.model';
import { AppError } from '../utils/app-error';

const router = Router();

router.post('/episodes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, video_url, duration, characters, status } = req.body;

    // Validation
    if (!title || typeof title !== 'string') {
      return next(new AppError('Title is required and must be a string', 400));
    }

    if (video_url && typeof video_url !== 'string') {
      return next(new AppError('Video URL must be a string', 400));
    }

    if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
      return next(new AppError('Duration must be a positive number', 400));
    }

    if (status && !Object.values(EpisodeStatus).includes(status as EpisodeStatus)) {
      return next(new AppError('Invalid status value', 400));
    }

    const episode = await episodeRepository.create({
      title,
      video_url,
      duration,
      characters,
      status: status as EpisodeStatus,
    });

    res.status(201).json({
      status: 'success',
      data: { episode },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/episodes/ready', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const episodes = await episodeRepository.listReady();

    res.status(200).json({
      status: 'success',
      results: episodes.length,
      data: { episodes },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/episodes/random', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exclude } = req.query;
    const excludeIds = typeof exclude === 'string' ? exclude.split(',') : [];

    const episode = await episodeRepository.getRandomReady(excludeIds);

    if (!episode) {
      return next(new AppError('No ready episodes available', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { episode },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/episodes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const episode = await episodeRepository.findById(id as string);

    if (!episode) {
      return next(new AppError('Episode not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { episode },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /episodes/:id
 * Updates an episode's status or details.
 */
router.patch('/episodes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, video_url, duration } = req.body;

    const episode = await episodeRepository.update(id as string, {
      status,
      video_url,
      duration,
    });

    if (!episode) {
      return next(new AppError('Episode not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { episode },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
