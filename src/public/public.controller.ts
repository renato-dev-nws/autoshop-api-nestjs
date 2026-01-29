import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PublicService } from './public.service';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';

@Controller()
@ApiTags('Public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('vehicles')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Buscar veículos disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de veículos encontrados' })
  async searchVehicles(@Query() filters: SearchVehiclesDto) {
    return this.publicService.searchVehicles(filters);
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Obter detalhes de um veículo' })
  @ApiResponse({ status: 200, description: 'Detalhes do veículo' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async getVehicleById(@Param('id') id: number) {
    const vehicle = await this.publicService.getVehicleById(id);
    
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return vehicle;
  }

  @Get('vehicle-categories')
  @ApiOperation({ summary: 'Listar categorias/tipos de veículos ativos' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async getCategories() {
    return this.publicService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Listar todas as marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async getBrands() {
    return this.publicService.getBrands();
  }

  @Get('models')
  @ApiOperation({ summary: 'Listar modelos disponíveis (DISTINCT)' })
  @ApiResponse({ status: 200, description: 'Lista de modelos' })
  async getModels() {
    return this.publicService.getModels();
  }

  @Get('stores')
  @ApiOperation({ summary: 'Listar todas as lojas' })
  @ApiResponse({ status: 200, description: 'Lista de lojas' })
  async getStores() {
    return this.publicService.getStores();
  }
}
