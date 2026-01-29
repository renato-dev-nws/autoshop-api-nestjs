import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@ApiTags('Taxonomy (Admin)')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  // ==================== CATEGORIES ====================

  @Get('vehicle-categories')
  @ApiOperation({ summary: 'Listar todas as categorias (incluindo inativas)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAllCategories() {
    return this.taxonomyService.findAllCategories();
  }

  @Get('vehicle-categories/:id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.taxonomyService.findOneCategory(id);
  }

  @Post('vehicle-categories')
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Categoria já existe' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.taxonomyService.createCategory(createCategoryDto);
  }

  @Put('vehicle-categories/:id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Nome já existe' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.taxonomyService.updateCategory(id, updateCategoryDto);
  }

  @Delete('vehicle-categories/:id')
  @ApiOperation({ summary: 'Deletar categoria (soft delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria removida' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Categoria em uso por veículos' })
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    await this.taxonomyService.removeCategory(id);
    return { message: 'Categoria removida com sucesso' };
  }

  // ==================== BRANDS ====================

  @Get('brands')
  @ApiOperation({ summary: 'Listar todas as marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async findAllBrands() {
    return this.taxonomyService.findAllBrands();
  }

  @Get('brands/:id')
  @ApiOperation({ summary: 'Buscar marca por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da marca' })
  @ApiResponse({ status: 200, description: 'Marca encontrada' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  async findOneBrand(@Param('id', ParseIntPipe) id: number) {
    return this.taxonomyService.findOneBrand(id);
  }

  @Post('brands')
  @ApiOperation({ summary: 'Criar nova marca' })
  @ApiResponse({ status: 201, description: 'Marca criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Marca já existe' })
  async createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.taxonomyService.createBrand(createBrandDto);
  }

  @Put('brands/:id')
  @ApiOperation({ summary: 'Atualizar marca' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da marca' })
  @ApiResponse({ status: 200, description: 'Marca atualizada' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  @ApiResponse({ status: 409, description: 'Nome já existe' })
  async updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.taxonomyService.updateBrand(id, updateBrandDto);
  }

  @Delete('brands/:id')
  @ApiOperation({ summary: 'Deletar marca (soft delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da marca' })
  @ApiResponse({ status: 200, description: 'Marca removida' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  @ApiResponse({ status: 409, description: 'Marca em uso por veículos' })
  async removeBrand(@Param('id', ParseIntPipe) id: number) {
    await this.taxonomyService.removeBrand(id);
    return { message: 'Marca removida com sucesso' };
  }

  // ==================== MODELS ====================

  @Get('models')
  @ApiOperation({ summary: 'Listar todos os modelos' })
  @ApiResponse({ status: 200, description: 'Lista de modelos' })
  async findAllModels() {
    return this.taxonomyService.findAllModels();
  }

  @Get('models/:id')
  @ApiOperation({ summary: 'Buscar modelo por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do modelo' })
  @ApiResponse({ status: 200, description: 'Modelo encontrado' })
  @ApiResponse({ status: 404, description: 'Modelo não encontrado' })
  async findOneModel(@Param('id', ParseIntPipe) id: number) {
    return this.taxonomyService.findOneModel(id);
  }

  @Post('models')
  @ApiOperation({ summary: 'Criar novo modelo' })
  @ApiResponse({ status: 201, description: 'Modelo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  @ApiResponse({ status: 409, description: 'Modelo já existe para esta marca' })
  async createModel(@Body() createModelDto: CreateModelDto) {
    return this.taxonomyService.createModel(createModelDto);
  }

  @Put('models/:id')
  @ApiOperation({ summary: 'Atualizar modelo' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do modelo' })
  @ApiResponse({ status: 200, description: 'Modelo atualizado' })
  @ApiResponse({ status: 404, description: 'Modelo não encontrado' })
  @ApiResponse({ status: 409, description: 'Nome já existe para esta marca' })
  async updateModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    return this.taxonomyService.updateModel(id, updateModelDto);
  }

  @Delete('models/:id')
  @ApiOperation({ summary: 'Deletar modelo (soft delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do modelo' })
  @ApiResponse({ status: 200, description: 'Modelo removido' })
  @ApiResponse({ status: 404, description: 'Modelo não encontrado' })
  @ApiResponse({ status: 409, description: 'Modelo em uso por veículos' })
  async removeModel(@Param('id', ParseIntPipe) id: number) {
    await this.taxonomyService.removeModel(id);
    return { message: 'Modelo removido com sucesso' };
  }
}
