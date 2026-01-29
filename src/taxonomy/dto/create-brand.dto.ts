import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Nome da marca',
    example: 'TOYOTA',
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'ID da marca na tabela FIPE',
    example: '21',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  brand_fipe_id?: string;

  @ApiProperty({
    description: 'URL do logo da marca',
    example: 'https://example.com/toyota.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;
}
