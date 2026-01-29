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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/stores')
@ApiTags('Stores (Admin)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as lojas' })
  @ApiResponse({ status: 200, description: 'Lista de lojas com hierarquia' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Apenas admin pode acessar' })
  async findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar loja por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da loja' })
  @ApiResponse({ status: 200, description: 'Loja encontrada' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova loja' })
  @ApiResponse({ status: 201, description: 'Loja criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Loja matriz não encontrada' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar loja' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da loja' })
  @ApiResponse({ status: 200, description: 'Loja atualizada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar loja (soft delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID da loja' })
  @ApiResponse({ status: 200, description: 'Loja removida' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  @ApiResponse({ status: 409, description: 'Loja em uso por veículos ou possui filiais' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.storesService.remove(id);
    return { message: 'Loja removida com sucesso' };
  }
}
