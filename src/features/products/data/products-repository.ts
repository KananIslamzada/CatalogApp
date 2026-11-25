import { getDatabase } from '@/lib/database';

import { type Product } from '../types';
import { productToParams, rowToProduct, type ProductRow } from './product-row';

const UPSERT_PRODUCT = `
  INSERT INTO products (
    id, title, description, category, brand, price,
    discount_percentage, rating, stock, thumbnail, images, cached_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    brand = excluded.brand,
    price = excluded.price,
    discount_percentage = excluded.discount_percentage,
    rating = excluded.rating,
    stock = excluded.stock,
    thumbnail = excluded.thumbnail,
    images = excluded.images,
    cached_at = excluded.cached_at
`;

export async function saveProducts(products: Product[]): Promise<void> {
  if (products.length === 0) return;

  const db = await getDatabase();
  const cachedAt = Date.now();
  const statement = await db.prepareAsync(UPSERT_PRODUCT);
  try {
    await db.withTransactionAsync(async () => {
      for (const product of products) {
        await statement.executeAsync(productToParams(product, cachedAt));
      }
    });
  } finally {
    await statement.finalizeAsync();
  }
}

export async function readProductsPage(
  skip: number,
  limit: number,
): Promise<{ products: Product[]; total: number }> {
  const db = await getDatabase();
  const [rows, count] = await Promise.all([
    db.getAllAsync<ProductRow>('SELECT * FROM products ORDER BY id LIMIT ? OFFSET ?', [
      limit,
      skip,
    ]),
    db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM products'),
  ]);
  return { products: rows.map(rowToProduct), total: count?.total ?? 0 };
}

export async function readProduct(id: number): Promise<Product | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
  return row ? rowToProduct(row) : null;
}
