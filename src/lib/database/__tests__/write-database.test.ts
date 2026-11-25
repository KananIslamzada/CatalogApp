import { writeDatabase } from '../database';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({ execAsync: jest.fn(async () => undefined) })),
}));
jest.mock('../migrate', () => ({ runMigrations: jest.fn(async () => 1) }));

function deferred() {
  let resolve = () => undefined as void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('writeDatabase', () => {
  it('runs writes one after another', async () => {
    const events: string[] = [];
    const first = deferred();

    const slow = writeDatabase(async () => {
      events.push('first start');
      await first.promise;
      events.push('first end');
    });
    const fast = writeDatabase(async () => {
      events.push('second start');
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(events).toEqual(['first start']);

    first.resolve();
    await Promise.all([slow, fast]);
    expect(events).toEqual(['first start', 'first end', 'second start']);
  });

  it('keeps going after a failed write and still reports the failure', async () => {
    const failing = writeDatabase(async () => {
      throw new Error('constraint failed');
    });
    const next = writeDatabase(async () => 'saved');

    await expect(failing).rejects.toThrow('constraint failed');
    await expect(next).resolves.toBe('saved');
  });
});
