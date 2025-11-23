import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('events')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('payload', 'jsonb', (col) => col.notNull()) 
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
  
 
  await db.schema
    .createIndex('idx_events_type')
    .on('events')
    .column('type')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('events').execute();
}