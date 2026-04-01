import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBooksQueryDto } from './dto/find-books-query.dto';
import { ExchangeRateService } from './exchange-rate.service';
import { countryToCurrency } from './country-currency.map';
import { isbnDigits } from '../../common/validators/is-isbn.validator';
import { toBookPublic, BookPublic } from './books.mapper';

const MARGIN = 1.4;

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async create(dto: CreateBookDto): Promise<BookPublic> {
    const isbn = isbnDigits(dto.isbn);
    await this.ensureIsbnAvailable(isbn);

    const book = this.booksRepository.create({
      title: dto.title.trim(),
      author: dto.author.trim(),
      isbn,
      costUsd: dto.costUsd.toFixed(4),
      sellingPriceLocal: null,
      stockQuantity: dto.stockQuantity,
      category: dto.category.trim(),
      supplierCountry: dto.supplierCountry.trim().toUpperCase(),
      active: true,
    });

    const saved = await this.booksRepository.save(book);
    return toBookPublic(saved);
  }

  async findAll(query: FindBooksQueryDto) {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const [items, itemCount] = await this.booksRepository.findAndCount({
      where: { active: true },
      order: { createdAt: 'DESC' },
      skip,
      take: perPage,
    });

    const pageCount = Math.max(1, Math.ceil(itemCount / perPage));
    const currentPage = Math.max(1, Math.min(page, pageCount));

    return {
      count: itemCount,
      items: items.map(toBookPublic),
      pageInfo: {
        page: currentPage,
        perPage,
        itemCount: items.length,
        pageCount,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < pageCount,
      },
    };
  }

  async findOne(id: number): Promise<BookPublic> {
    const book = await this.findActiveOrThrow(id);
    return toBookPublic(book);
  }

  async update(id: number, dto: UpdateBookDto): Promise<BookPublic> {
    const book = await this.findActiveOrThrow(id);

    if (dto.isbn !== undefined) {
      const next = isbnDigits(dto.isbn);
      if (next !== book.isbn) {
        await this.ensureIsbnAvailable(next, book.id);
      }
      book.isbn = next;
    }
    if (dto.title !== undefined) book.title = dto.title.trim();
    if (dto.author !== undefined) book.author = dto.author.trim();
    if (dto.costUsd !== undefined) book.costUsd = dto.costUsd.toFixed(4);
    if (dto.sellingPriceLocal !== undefined) {
      book.sellingPriceLocal =
        dto.sellingPriceLocal === null
          ? null
          : dto.sellingPriceLocal.toFixed(4);
    }
    if (dto.stockQuantity !== undefined) book.stockQuantity = dto.stockQuantity;
    if (dto.category !== undefined) book.category = dto.category.trim();
    if (dto.supplierCountry !== undefined) {
      book.supplierCountry = dto.supplierCountry.trim().toUpperCase();
    }

    const saved = await this.booksRepository.save(book);
    return toBookPublic(saved);
  }

  async remove(id: number): Promise<{ message: string }> {
    const book = await this.findActiveOrThrow(id);
    book.active = false;
    await this.booksRepository.save(book);
    return { message: 'Libro eliminado correctamente' };
  }

  async searchByCategory(category: string): Promise<BookPublic[]> {
    const q = category.trim();
    const books = await this.booksRepository
      .createQueryBuilder('book')
      .where('book.active = :active', { active: true })
      .andWhere('LOWER(book.category) LIKE LOWER(:cat)', {
        cat: `%${q}%`,
      })
      .orderBy('book.title', 'ASC')
      .getMany();

    return books.map(toBookPublic);
  }

  async findLowStock(threshold: number): Promise<BookPublic[]> {
    const t = threshold ?? 10;
    const books = await this.booksRepository.find({
      where: { active: true },
      order: { stockQuantity: 'ASC' },
    });
    return books.filter((b) => b.stockQuantity <= t).map(toBookPublic);
  }

  async calculatePrice(id: number) {
    const book = await this.findActiveOrThrow(id);
    const currency = countryToCurrency(book.supplierCountry);
    const { rate, usedFallback } =
      await this.exchangeRateService.getUsdToCurrencyRate(currency);

    const costUsd = Number(book.costUsd);
    const costLocal = round(costUsd * rate, 4);
    const sellingPriceLocal = round(costLocal * MARGIN, 2);

    book.sellingPriceLocal = sellingPriceLocal.toFixed(4);
    await this.booksRepository.save(book);

    return {
      book_id: book.id,
      cost_usd: costUsd,
      exchange_rate: rate,
      cost_local: costLocal,
      margin_percentage: 40,
      selling_price_local: sellingPriceLocal,
      currency,
      calculation_timestamp: new Date().toISOString(),
      used_fallback_rate: usedFallback,
    };
  }

  private async findActiveOrThrow(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id, active: true },
    });
    if (!book) {
      throw new NotFoundException(`Libro con id ${id} no encontrado`);
    }
    return book;
  }

  private async ensureIsbnAvailable(isbn: string, excludeId?: number) {
    const existing = await this.booksRepository.findOne({
      where: { isbn, active: true },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Ya existe un libro activo con ISBN ${isbn}`);
    }
  }
}

function round(n: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(n * p) / p;
}
