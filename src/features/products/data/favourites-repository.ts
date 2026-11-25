import { getDatabase, writeDatabase } from '@/lib/database';

import { type Product } from '../types';
import { rowToProduct, type ProductRow } from './product-row';
import { saveProducts } from './products-repository';

export async function readFavourites(): Promise<Product[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProductRow>(
    `SELECT products.* FROM favourites
     JOIN products ON products.id = favourites.product_id
     ORDER BY favourites.created_at DESC`,
  );
  return rows.map(rowToProduct);
}

export async function addFavourite(product: Product): Promise<void> {
  await saveProducts([product]);
  await writeDatabase((db) =>
    db.runAsync('INSERT OR REPLACE INTO favourites (product_id, created_at) VALUES (?, ?)', [
      product.id,
      Date.now(),
    ]),
  );
}

export async function removeFavourite(id: number): Promise<void> {
  await writeDatabase((db) => db.runAsync('DELETE FROM favourites WHERE product_id = ?', [id]));
}
