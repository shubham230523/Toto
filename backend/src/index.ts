import express from 'express';
import { config } from './config';
import healthRoutes from './routes/health.routes';

const app = express();
const PORT = config.server.port;

app.use(express.json());

// Routes
app.use(healthRoutes);

app.listen(PORT, () => {
  console.log(`[server]: Toto Backend is running at http://localhost:${PORT}`);
});
