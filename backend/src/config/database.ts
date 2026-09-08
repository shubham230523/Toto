import knex, { Knex } from 'knex';
import { config } from './index';

export const db: Knex = knex({
  client: 'sqlite3',
  connection: {
    filename: config.database.url || './toto.sqlite',
  },
  useNullAsDefault: true,
});

export const connectDB = async () => {
  try {
    // Test connection
    await db.raw('SELECT 1');
    console.log('[database]: SQLite connection verified successfully');
  } catch (error) {
    console.error('[database]: Connection error', error);
  }
};
