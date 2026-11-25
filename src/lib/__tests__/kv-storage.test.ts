import { z } from 'zod';

import { clearKvStorage, kvStorage, readJson, writeJson } from '../kv-storage';

const userSchema = z.object({ id: z.number(), name: z.string() });

describe('kv-storage', () => {
  afterEach(() => {
    clearKvStorage();
  });

  it('round-trips a value through JSON', () => {
    writeJson('user', { id: 1, name: 'Emily' });

    expect(readJson('user', userSchema)).toEqual({ id: 1, name: 'Emily' });
  });

  it('returns null for a missing key', () => {
    expect(readJson('user', userSchema)).toBeNull();
  });

  it('returns null when the stored shape no longer matches', () => {
    writeJson('user', { id: '1' });

    expect(readJson('user', userSchema)).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    kvStorage.set('user', '{not json');

    expect(readJson('user', userSchema)).toBeNull();
  });

  it('clears every key', () => {
    writeJson('a', 1);
    writeJson('b', 2);

    clearKvStorage();

    expect(kvStorage.getAllKeys()).toHaveLength(0);
  });
});
