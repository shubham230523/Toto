import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('episodes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('title').notNullable();
    table.text('video_url');
    table.integer('duration'); // in seconds
    table.jsonb('characters').notNullable().defaultTo('[]');
    table.string('status').notNullable().defaultTo('generating');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('episodes');
}
