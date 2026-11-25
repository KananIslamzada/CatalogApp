import { z } from 'zod';

export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  brand: z.string().optional(),
  price: z.number(),
  discountPercentage: z.number(),
  rating: z.number(),
  stock: z.number(),
  thumbnail: z.string(),
  images: z.array(z.string()),
});

export type Product = z.infer<typeof productSchema>;

export const productPageSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type DataSource = 'network' | 'cache';

export type ProductPage = {
  products: Product[];
  total: number;
  skip: number;
  source: DataSource;
};

export type ProductResult = {
  product: Product;
  source: DataSource;
};

export type SearchResult = {
  term: string;
  products: Product[];
  source: DataSource;
};
