import { type SQLiteDatabase } from 'expo-sqlite';

type MigratableDatabase = Pick<
  SQLiteDatabase,
  'getFirstAsync' | 'execAsync' | 'withTransactionAsync'
>;

export async function runMigrations(
  db: MigratableDatabase,
  migrations: readonly string[],
): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= migrations.length) return currentVersion;

  await db.withTransactionAsync(async () => {
    for (const sql of migrations.slice(currentVersion)) {
      await db.execAsync(sql);
    }
    await db.execAsync(`PRAGMA user_version = ${migrations.length}`);
  });

  return migrations.length;
}
