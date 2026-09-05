import type { Knex } from "knex";
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./src/database/migrations",
      tableName: "knex_migrations"
    },
    seeds: {
      directory: "./src/database/seeds"
    }
  },
  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./src/database/migrations",
      tableName: "knex_migrations"
    },
    seeds: {
      directory: "./src/database/seeds"
    }
  }
};

export default config;
