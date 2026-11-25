# Storage

Three stores, each for one kind of data. All of them are wiped on logout.

| Store               | Module                                                     | Holds                                                                 | Why                                                                                                                           |
| ------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Keychain / Keystore | `lib/secure-storage.ts` (`tokenStorage`)                   | Access and refresh tokens                                             | Encrypted by the OS. `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`: readable on cold start, never synced to backups or other devices. |
| MMKV                | `lib/kv-storage.ts` (`kvStorage`, `readJson`, `writeJson`) | Small non-sensitive values (e.g. the signed-in user's public profile) | Synchronous, so values are available on the first render without a loading state.                                             |
| SQLite              | `lib/database/` (`getDatabase`, `clearDatabase`)           | Cached products and favourites                                        | Relational, queryable (pagination, search) and fine with thousands of rows. Powers offline mode.                              |

## Secure storage

- `tokenStorage.read()` returns `null` unless **both** tokens exist, so a half-written session is never treated as valid.
- Tokens are never logged and never leave this module except through the HTTP client.

## MMKV

- One instance, id `catalog`.
- `readJson(key, schema)` validates with zod. Corrupt or outdated data returns `null` instead of crashing or leaking a wrong shape into the app.
- `clearKvStorage()` wipes the instance.

## SQLite

- Database `catalog.db`, WAL journal mode.
- `getDatabase()` opens and migrates once and caches the promise. If opening fails, the cache is reset so the next call retries.
- Migrations live in `migrations.ts` as an ordered array of SQL strings. `runMigrations` compares the array length with `PRAGMA user_version` and runs only the pending ones inside a transaction. To change the schema, **append** a new migration and never edit a shipped one.
- `clearDatabase()` deletes all rows from all tables in one transaction.

### Schema (v1)

`products`: every field the list and details screens need, so details work offline for any product seen in the list. `images` is a JSON array. `cached_at` records when the row was last refreshed.

`favourites`: `product_id` and `created_at`. Joined with `products` for display. No foreign key, because favourites must survive a products cache refresh.

## Testing

- MMKV switches to an in-memory mock under Jest. `react-native-nitro-modules` is stubbed in `jest.setup.ts` because it looks up its native module at import time.
- `expo-secure-store` is mocked per test with an in-memory map.
- `runMigrations` is tested against a fake database object, since expo-sqlite has no Node build.
