import { runMigrations } from '../migrate';

function createFakeDatabase(userVersion: number) {
  const executed: string[] = [];
  const db = {
    getFirstAsync: jest.fn(async () => ({ user_version: userVersion })),
    execAsync: jest.fn(async (sql: string) => {
      executed.push(sql);
    }),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => {
      await task();
    }),
  };
  return { db, executed };
}

const migrations = ['CREATE TABLE a (id INTEGER)', 'CREATE TABLE b (id INTEGER)'];

describe('runMigrations', () => {
  it('applies every migration on a fresh database', async () => {
    const { db, executed } = createFakeDatabase(0);

    await expect(runMigrations(db, migrations)).resolves.toBe(2);

    expect(executed).toEqual([...migrations, 'PRAGMA user_version = 2']);
  });

  it('applies only the pending migrations', async () => {
    const { db, executed } = createFakeDatabase(1);

    await runMigrations(db, migrations);

    expect(executed).toEqual(['CREATE TABLE b (id INTEGER)', 'PRAGMA user_version = 2']);
  });

  it('does nothing when the schema is up to date', async () => {
    const { db, executed } = createFakeDatabase(2);

    await expect(runMigrations(db, migrations)).resolves.toBe(2);

    expect(executed).toEqual([]);
    expect(db.withTransactionAsync).not.toHaveBeenCalled();
  });
});
