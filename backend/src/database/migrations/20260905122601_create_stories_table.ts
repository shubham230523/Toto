import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('stories', (table) => {
    table.uuid('id').primary();
    table.text('title').notNullable();
    table.text('learning_concept').notNullable();
    table.json('characters').notNullable().defaultTo('[]');
    table.json('scenes').notNullable().defaultTo('[]');
    table.integer('estimated_duration').notNullable(); // in seconds
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('stories');
}
