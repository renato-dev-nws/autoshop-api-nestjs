import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePhoto } from './entities/vehicle-photo.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PhotosService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'vehicles');

  constructor(
    @InjectRepository(VehiclePhoto)
    private readonly photoRepository: Repository<VehiclePhoto>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {
    // Criar diretório de upload se não existir
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadPhotos(
    vehicleId: number,
    files: Express.Multer.File[],
    user: User,
  ): Promise<{ uploaded: number; photos: VehiclePhoto[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    if (files.length > 10) {
      throw new BadRequestException('Máximo de 10 fotos por vez');
    }

    // Verificar se o veículo existe e permissão
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['store'],
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    await this.validateStoreAccess(vehicle.storeId, user);

    // Contar fotos existentes
    const currentCount = await this.photoRepository.count({
      where: { vehicleId },
    });

    const photos: VehiclePhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tipo de arquivo
      if (!file.mimetype.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Gerar nome único
      const filename = `${vehicleId}_${Date.now()}_${i}${path.extname(file.originalname)}`;
      const filepath = path.join(this.uploadPath, filename);

      // Salvar arquivo
      fs.writeFileSync(filepath, file.buffer);

      // Criar registro no banco
      const photo = this.photoRepository.create({
        vehicleId,
        url: `/uploads/vehicles/${filename}`,
        isCover: currentCount === 0 && i === 0, // Primeira foto é capa se não houver outras
        displayOrder: currentCount + i,
      });

      photos.push(await this.photoRepository.save(photo));
    }

    return {
      uploaded: photos.length,
      photos,
    };
  }

  async setCover(vehicleId: number, photoId: number, user: User): Promise<VehiclePhoto> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, vehicleId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }

    await this.validateStoreAccess(photo.vehicle.storeId, user);

    // Desmarcar capa anterior
    await this.photoRepository.update(
      { vehicleId, isCover: true },
      { isCover: false },
    );

    // Marcar nova capa
    photo.isCover = true;
    return this.photoRepository.save(photo);
  }

  async updateOrder(
    vehicleId: number,
    photoId: number,
    displayOrder: number,
    user: User,
  ): Promise<VehiclePhoto> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, vehicleId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }

    await this.validateStoreAccess(photo.vehicle.storeId, user);

    photo.displayOrder = displayOrder;
    return this.photoRepository.save(photo);
  }

  async remove(vehicleId: number, photoId: number, user: User): Promise<void> {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId, vehicleId },
      relations: ['vehicle'],
    });

    if (!photo) {
      throw new NotFoundException('Foto não encontrada');
    }

    await this.validateStoreAccess(photo.vehicle.storeId, user);

    // Deletar arquivo físico
    const filepath = path.join(process.cwd(), photo.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Deletar registro
    await this.photoRepository.remove(photo);

    // Se era capa, definir próxima como capa
    if (photo.isCover) {
      const nextPhoto = await this.photoRepository.findOne({
        where: { vehicleId },
        order: { displayOrder: 'ASC' },
      });

      if (nextPhoto) {
        nextPhoto.isCover = true;
        await this.photoRepository.save(nextPhoto);
      }
    }
  }

  private async validateStoreAccess(storeId: number, user: User): Promise<void> {
    if (user.role === 'admin') {
      return;
    }

    if (user.role === 'manager' && user.storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: user.storeId },
      });

      const allowedStoreIds = [user.storeId];
      if (store?.parentId) allowedStoreIds.push(store.parentId);

      if (!allowedStoreIds.includes(storeId)) {
        throw new ForbiddenException('Você não tem permissão para gerenciar fotos deste veículo');
      }
    }
  }
}
