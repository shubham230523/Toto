import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('characters', (table) => {
    table.integer('weight').notNullable().defaultTo(10); // Default weight of 10
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('characters', (table) => {
    table.dropColumn('weight');
  });
}
