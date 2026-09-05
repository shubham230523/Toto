import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('assets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.string('type').notNullable(); // character, background, object, expression, audio
    table.text('url').notNullable();
    table.jsonb('metadata').notNullable().defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Explicit indexes for fast lookups
    table.index('type');
    table.index('name');
    // Composite index for common "find asset of type X with name Y" queries
    table.index(['type', 'name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('assets');
}
