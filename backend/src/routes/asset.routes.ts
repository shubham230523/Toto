import { Router, Request, Response, NextFunction } from 'express';
import { assetRepository } from '../repositories/asset.repository';
import { AssetType } from '../models/asset.model';
import { AppError } from '../utils/app-error';

const router = Router();

/**
 * GET /assets
 * Optional query param: type (character, background, object, expression, audio)
 */
router.get('/assets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    if (type) {
      if (!Object.values(AssetType).includes(type as AssetType)) {
        return next(new AppError('Invalid asset type', 400));
      }

      const assets = await assetRepository.listByType(type as AssetType);
      return res.status(200).json({
        status: 'success',
        results: assets.length,
        data: { assets },
      });
    }

    // If no type is provided, we could either return all or return an error.
    // For now, let's require a type or return an empty list/error to stay focused.
    return next(new AppError('Asset type is required', 400));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /assets/:id
 */
router.get('/assets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const asset = await assetRepository.findById(id as string);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
