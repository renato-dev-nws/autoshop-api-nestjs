import { IsOptional, IsInt, IsNumber, IsBoolean, IsString, IsIn, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchVehiclesDto {
  @ApiPropertyOptional({ description: 'ID da categoria/tipo de veículo' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({ description: 'ID FIPE da marca' })
  @IsOptional()
  @IsString()
  brand_fipe_id?: string;

  @ApiPropertyOptional({ description: 'ID FIPE do modelo' })
  @IsOptional()
  @IsString()
  model_fipe_id?: string;

  @ApiPropertyOptional({ description: 'ID da loja' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  store_id?: number;

  @ApiPropertyOptional({ description: 'Preço mínimo' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min_price?: number;

  @ApiPropertyOptional({ description: 'Preço máximo' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max_price?: number;

  @ApiPropertyOptional({ description: 'Ano mínimo' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year_min?: number;

  @ApiPropertyOptional({ description: 'Ano máximo' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year_max?: number;

  @ApiPropertyOptional({ description: 'Apenas destaques da home' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  home_highlight?: boolean;

  @ApiPropertyOptional({ description: 'Apenas destaques da marca' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  brand_highlight?: boolean;

  @ApiPropertyOptional({ description: 'Campo para ordenação', enum: ['created_at', 'price', 'model_year', 'mileage'] })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'price', 'model_year', 'mileage'])
  sort?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Direção da ordenação', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string = 'desc';

  @ApiPropertyOptional({ description: 'Página atual', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  page_size?: number = 20;
}
