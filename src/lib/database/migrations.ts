export const migrations: readonly string[] = [
  `
  CREATE TABLE products (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    price REAL NOT NULL,
    discount_percentage REAL NOT NULL,
    rating REAL NOT NULL,
    stock INTEGER NOT NULL,
    thumbnail TEXT NOT NULL,
    images TEXT NOT NULL,
    cached_at INTEGER NOT NULL
  );

  CREATE TABLE favourites (
    product_id INTEGER PRIMARY KEY NOT NULL,
    created_at INTEGER NOT NULL
  );
  `,
];
