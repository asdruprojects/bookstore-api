import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { ExchangeRateService } from './exchange-rate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    HttpModule.register({
      timeout: 15_000,
      maxRedirects: 3,
    }),
  ],
  controllers: [BooksController],
  providers: [BooksService, ExchangeRateService],
})
export class BooksModule {}
