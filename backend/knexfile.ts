import type { Knex } from "knex";
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite3",
    connection: {
      filename: process.env.DATABASE_URL || "./toto.sqlite"
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./src/database/migrations",
      tableName: "knex_migrations"
    },
    seeds: {
      directory: "./src/database/seeds"
    }
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: process.env.DATABASE_URL || "./toto.sqlite"
    },
    useNullAsDefault: true,
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
