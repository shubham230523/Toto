import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  connectionString: config.database.url,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('[database]: Connected to PostgreSQL successfully');
    client.release();
  } catch (error) {
    console.error('[database]: Connection error', error);
    // In a real app, we might want to exit the process if the DB is critical
    // process.exit(1);
  }
};
