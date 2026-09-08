import request from 'supertest';
import express from 'express';
import healthRoutes from '../src/routes/health.routes';

const app = express();
app.use(healthRoutes);

describe('Health Routes', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
