import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import episodeRoutes from '../src/routes/episode.routes';
import { episodeRepository } from '../src/repositories/episode.repository';

// Mock the repository
jest.mock('../src/repositories/episode.repository');

const app = express();
app.use(bodyParser.json());
app.use(episodeRoutes);

describe('Episode Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /episodes/random should return an episode', async () => {
    const mockEpisode = { id: '1', title: 'Test Episode', status: 'ready' };
    (episodeRepository.getRandomReady as jest.Mock).mockResolvedValue(mockEpisode);

    const res = await request(app).get('/episodes/random');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.episode).toEqual(mockEpisode);
    expect(episodeRepository.getRandomReady).toHaveBeenCalled();
  });

  it('GET /episodes/random should return 404 if no episodes', async () => {
    (episodeRepository.getRandomReady as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/episodes/random');

    expect(res.status).toBe(404);
  });

  it('POST /episodes should create an episode', async () => {
    const newEpisode = { title: 'New Story', video_url: 'http://test.com' };
    (episodeRepository.create as jest.Mock).mockResolvedValue({ id: '2', ...newEpisode });

    const res = await request(app)
      .post('/episodes')
      .send(newEpisode);

    expect(res.status).toBe(201);
    expect(res.body.data.episode.title).toBe('New Story');
  });

  it('POST /episodes should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/episodes')
      .send({ video_url: 'missing title' });

    expect(res.status).toBe(400);
  });
});
