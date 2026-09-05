import express from 'express';
import morgan from 'morgan';
import { config } from './config';
import renderRoutes from './routes/render.routes';
import { errorHandler } from './utils/error-handler';

const app = express();
const PORT = config.server.port;

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use(renderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'toto-render-service' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[render-service]: Service is running at http://localhost:${PORT}`);
});
