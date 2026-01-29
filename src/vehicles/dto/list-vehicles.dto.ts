import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SearchVehiclesDto } from '../../public/dto/search-vehicles.dto';

export class ListVehiclesDto extends SearchVehiclesDto {
  @ApiPropertyOptional({ description: 'Busca por placa, marca, modelo ou descrição' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: ['Available', 'Reserved', 'Sold'] })
  @IsOptional()
  @IsString()
  @IsIn(['Available', 'Reserved', 'Sold'])
  status?: string;
}
