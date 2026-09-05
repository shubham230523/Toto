import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { config } from './config';
import { connectDB } from './config/database';
import healthRoutes from './routes/health.routes';
import episodeRoutes from './routes/episode.routes';
import { errorHandler } from './utils/error-handler';
import { AppError } from './utils/app-error';

const app = express();
const PORT = config.server.port;

// Connect to Database
connectDB();

// Middlewares
app.use(morgan('dev')); // Logs: :method :url :status :response-time ms - :res[content-length]
app.use(express.json());

// Routes
app.use(healthRoutes);
app.use(episodeRoutes);

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Toto Backend is running at http://localhost:${PORT}`);
});
