import { Book } from './entities/book.entity';

export type BookPublic = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  cost_usd: number;
  selling_price_local: number | null;
  stock_quantity: number;
  category: string;
  supplier_country: string;
  created_at: string;
  updated_at: string;
};

export function toBookPublic(book: Book): BookPublic {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    cost_usd: Number(book.costUsd),
    selling_price_local:
      book.sellingPriceLocal != null ? Number(book.sellingPriceLocal) : null,
    stock_quantity: book.stockQuantity,
    category: book.category,
    supplier_country: book.supplierCountry,
    created_at: book.createdAt.toISOString(),
    updated_at: book.updatedAt.toISOString(),
  };
}
