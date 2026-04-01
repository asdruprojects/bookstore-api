import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchBooksQueryDto {
  @ApiProperty({
    description:
      'Texto a buscar en el nombre de la categoría (coincidencia parcial)',
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}
