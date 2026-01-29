import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ListVehiclesDto } from './dto/list-vehicles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('admin/vehicles')
@ApiTags('Vehicles (Admin)')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar veículos (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de veículos com paginação' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async listVehicles(@Query() filters: ListVehiclesDto, @CurrentUser() user: User) {
    return this.vehiclesService.listVehicles(filters, user);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo veículo' })
  @ApiResponse({ status: 201, description: 'Veículo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para criar nesta loja' })
  @ApiResponse({ status: 409, description: 'Placa já cadastrada' })
  async create(@Body() createVehicleDto: CreateVehicleDto, @CurrentUser() user: User) {
    return this.vehiclesService.create(createVehicleDto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 200, description: 'Veículo encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar este veículo' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.vehiclesService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar este veículo' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  @ApiResponse({ status: 409, description: 'Placa já cadastrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentUser() user: User,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar apenas o status do veículo' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar este veículo' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.vehiclesService.updateStatus(id, updateStatusDto.status, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar veículo (soft delete)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 200, description: 'Veículo removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar este veículo' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.vehiclesService.remove(id, user);
    return { message: 'Veículo removido com sucesso' };
  }
}
