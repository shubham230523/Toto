import { Pool } from 'pg';
import knex, { Knex } from 'knex';
import { config } from './index';

export const pool = new Pool({
  connectionString: config.database.url,
});

export const db: Knex = knex({
  client: 'pg',
  connection: config.database.url,
});

export const connectDB = async () => {
  try {
    // Test pg pool connection
    const client = await pool.connect();
    console.log('[database]: Connected to PostgreSQL successfully via Pool');
    client.release();

    // Test knex connection
    await db.raw('SELECT 1');
    console.log('[database]: Knex connection verified');
  } catch (error) {
    console.error('[database]: Connection error', error);
  }
};
