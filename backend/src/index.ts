import express from 'express';
import healthRoutes from './routes/health.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use(healthRoutes);

app.listen(PORT, () => {
  console.log(`[server]: Toto Backend is running at http://localhost:${PORT}`);
});
