import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('storyboards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('title').notNullable();
    table.text('learning_concept').notNullable();
    table.jsonb('scenes').notNullable().defaultTo('[]');
    table.jsonb('required_assets').notNullable().defaultTo('[]');
    table.integer('estimated_duration').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('storyboards');
}
