import { Request, Response, NextFunction } from 'express';
import { AppError } from './app-error';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error(`[RenderService Error]: ${statusCode} - ${message}`);
  if (!(err as AppError).isOperational) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Something went wrong in the render service' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
