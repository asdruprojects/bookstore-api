import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsIsbn } from '../../../common/validators/is-isbn.validator';

export class CreateBookDto {
  @ApiProperty({ example: 'El Quijote' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Miguel de Cervantes' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: '978-84-376-0494-7' })
  @IsString()
  @IsNotEmpty()
  @IsIsbn()
  isbn: string;

  @ApiProperty({ example: 15.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01, { message: 'cost_usd debe ser mayor a 0' })
  costUsd: number;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'stock_quantity no puede ser negativo' })
  stockQuantity: number;

  @ApiProperty({ example: 'Literatura Clásica' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'ES', description: 'ISO 3166-1 alpha-2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  supplierCountry: string;
}
