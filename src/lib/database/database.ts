import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from './migrate';
import { migrations } from './migrations';

const DATABASE_NAME = 'catalog.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL');
  await runMigrations(db, migrations);
  return db;
}

export function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= openAndMigrate().catch((error: unknown) => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

export async function clearDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM favourites; DELETE FROM products;');
  });
}
