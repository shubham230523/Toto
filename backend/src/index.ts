import express, { Request, Response, NextFunction } from 'express';
import { config } from './config';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './utils/error-handler';
import { AppError } from './utils/app-error';

const app = express();
const PORT = config.server.port;

app.use(express.json());

// Routes
app.use(healthRoutes);

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Toto Backend is running at http://localhost:${PORT}`);
});
