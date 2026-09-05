import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('characters', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable().unique();
    table.text('species').notNullable();
    table.text('personality').notNullable();
    table.text('appearance').notNullable();
    table.jsonb('metadata').notNullable().defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('name');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('characters');
}
