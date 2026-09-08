import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('stories', (table) => {
    table.json('dialogue').notNullable().defaultTo('[]');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('stories', (table) => {
    table.dropColumn('dialogue');
  });
}
