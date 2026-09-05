import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Toto Backend is running' });
});

app.listen(PORT, () => {
  console.log(`[server]: Toto Backend is running at http://localhost:${PORT}`);
});
