import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { UploadPhotosDto } from './dto/upload-photos.dto';
import { UpdatePhotoOrderDto } from './dto/update-photo-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('admin/vehicles/:vehicleId/photos')
@ApiTags('Photos (Admin)')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @ApiOperation({ summary: 'Upload de múltiplas fotos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPhotosDto })
  @ApiParam({ name: 'vehicleId', type: 'number', description: 'ID do veículo' })
  @ApiResponse({ status: 201, description: 'Fotos enviadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou limite de fotos excedido' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para este veículo' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadPhotos(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadPhotos(vehicleId, files, user);
  }

  @Patch(':photoId/cover')
  @ApiOperation({ summary: 'Definir foto como capa' })
  @ApiParam({ name: 'vehicleId', type: 'number', description: 'ID do veículo' })
  @ApiParam({ name: 'photoId', type: 'number', description: 'ID da foto' })
  @ApiResponse({ status: 200, description: 'Foto definida como capa' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Foto não encontrada' })
  async setCover(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @CurrentUser() user: User,
  ) {
    return this.photosService.setCover(vehicleId, photoId, user);
  }

  @Patch(':photoId/order')
  @ApiOperation({ summary: 'Atualizar ordem da foto' })
  @ApiParam({ name: 'vehicleId', type: 'number', description: 'ID do veículo' })
  @ApiParam({ name: 'photoId', type: 'number', description: 'ID da foto' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Foto não encontrada' })
  async updateOrder(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body() updateOrderDto: UpdatePhotoOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.photosService.updateOrder(
      vehicleId,
      photoId,
      updateOrderDto.display_order,
      user,
    );
  }

  @Delete(':photoId')
  @ApiOperation({ summary: 'Deletar foto' })
  @ApiParam({ name: 'vehicleId', type: 'number', description: 'ID do veículo' })
  @ApiParam({ name: 'photoId', type: 'number', description: 'ID da foto' })
  @ApiResponse({ status: 200, description: 'Foto removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Foto não encontrada' })
  async remove(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @CurrentUser() user: User,
  ) {
    await this.photosService.remove(vehicleId, photoId, user);
    return { message: 'Foto removida com sucesso' };
  }
}
