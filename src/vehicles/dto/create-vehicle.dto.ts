import {
  IsInt,
  IsString,
  IsIn,
  Length,
  Min,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ description: 'ID da loja' })
  @IsInt()
  store_id: number;

  @ApiProperty({ description: 'ID da categoria' })
  @IsInt()
  category_id: number;

  @ApiProperty({ description: 'Tipo de veículo', enum: ['carros', 'motos', 'caminhoes'] })
  @IsString()
  @IsIn(['carros', 'motos', 'caminhoes'])
  type: string;

  @ApiProperty({ description: 'Placa do veículo', example: 'ABC-1234' })
  @IsString()
  @Length(7, 10)
  plate: string;

  @ApiProperty({ description: 'Ano de fabricação' })
  @IsInt()
  @Min(1900)
  manufacture_year: number;

  @ApiProperty({ description: 'Ano do modelo' })
  @IsInt()
  @Min(1900)
  model_year: number;

  @ApiPropertyOptional({ description: 'Quilometragem' })
  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ description: 'Cor' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Tipo de combustível' })
  @IsOptional()
  @IsString()
  fuel_type?: string;

  @ApiProperty({ description: 'Preço' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Código FIPE' })
  @IsOptional()
  @IsString()
  fipe_code?: string;

  @ApiPropertyOptional({ description: 'Valor FIPE' })
  @IsOptional()
  @IsNumber()
  fipe_value?: number;

  // Brand/Model Logic - 0 = criar novo
  @ApiPropertyOptional({ description: 'ID da marca (0 para criar nova)' })
  @IsOptional()
  @IsInt()
  brand_id?: number;

  @ApiProperty({ description: 'Nome da marca' })
  @IsString()
  brand_name: string;

  @ApiPropertyOptional({ description: 'ID FIPE da marca' })
  @IsOptional()
  @IsString()
  brand_fipe_id?: string;

  @ApiPropertyOptional({ description: 'Logo da marca (URL)' })
  @IsOptional()
  @IsString()
  brand_logo?: string;

  @ApiPropertyOptional({ description: 'ID do modelo (0 para criar novo)' })
  @IsOptional()
  @IsInt()
  model_id?: number;

  @ApiProperty({ description: 'Nome do modelo' })
  @IsString()
  model_name: string;

  @ApiPropertyOptional({ description: 'ID FIPE do modelo' })
  @IsOptional()
  @IsString()
  model_fipe_id?: string;

  @ApiPropertyOptional({ description: 'Descrição' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ['Available', 'Reserved', 'Sold'] })
  @IsOptional()
  @IsString()
  @IsIn(['Available', 'Reserved', 'Sold'])
  status?: string = 'Available';

  @ApiPropertyOptional({ description: 'Destaque na home' })
  @IsOptional()
  @IsBoolean()
  home_highlight?: boolean = false;

  @ApiPropertyOptional({ description: 'Destaque na marca' })
  @IsOptional()
  @IsBoolean()
  brand_highlight?: boolean = false;

  @ApiPropertyOptional({ description: 'Lista de recursos/features' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Especificações técnicas (objeto JSON)' })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;
}
