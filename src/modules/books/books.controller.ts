import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBooksQueryDto } from './dto/find-books-query.dto';
import { SearchBooksQueryDto } from './dto/search-books-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear libro' })
  @ApiResponse({ status: 201, description: 'Creado' })
  @ApiResponse({ status: 400, description: 'Validación' })
  @ApiResponse({ status: 409, description: 'ISBN duplicado' })
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar por categoría (nombre parcial)' })
  @ApiQuery({ name: 'category', required: true })
  search(@Query() query: SearchBooksQueryDto) {
    return this.booksService.searchByCategory(query.category);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Libros con stock bajo' })
  @ApiQuery({ name: 'threshold', required: false })
  lowStock(@Query() query: LowStockQueryDto) {
    return this.booksService.findLowStock(query.threshold ?? 10);
  }

  @Get()
  @ApiOperation({ summary: 'Listar libros (paginación opcional)' })
  findAll(@Query() query: FindBooksQueryDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener libro por ID' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar libro' })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409, description: 'ISBN duplicado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminación lógica' })
  @ApiResponse({ status: 404 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }

  @Post(':id/calculate-price')
  @ApiOperation({
    summary: 'Calcular precio de venta sugerido (USD → moneda local + 40%)',
  })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 503, description: 'Servicio de tasas no disponible' })
  calculatePrice(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.calculatePrice(id);
  }
}
