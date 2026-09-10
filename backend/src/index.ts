import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import morgan from 'morgan';
import { config } from './config';
import { connectDB } from './config/database';
import healthRoutes from './routes/health.routes';
import episodeRoutes from './routes/episode.routes';
import assetRoutes from './routes/asset.routes';
import contentRoutes from './routes/content.routes';
import { errorHandler } from './utils/error-handler';
import { AppError } from './utils/app-error';

const app = express();
const PORT = config.server.port;

// Connect to Database
connectDB();

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Basic CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.resolve(config.storage.path)));

// Routes
app.use(healthRoutes);
app.use(episodeRoutes);
app.use(assetRoutes);
app.use(contentRoutes);

// Handle undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Toto Backend is running at http://localhost:${PORT}`);
});
