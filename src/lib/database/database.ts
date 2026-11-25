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

let pendingWrite: Promise<unknown> = Promise.resolve();

export function writeDatabase<T>(task: (db: SQLiteDatabase) => Promise<T>): Promise<T> {
  const write = pendingWrite.then(async () => task(await getDatabase()));
  pendingWrite = write.catch(() => undefined);
  return write;
}

export function clearDatabase(): Promise<void> {
  return writeDatabase((db) =>
    db.withTransactionAsync(async () => {
      await db.execAsync('DELETE FROM favourites; DELETE FROM products;');
    }),
  );
}
