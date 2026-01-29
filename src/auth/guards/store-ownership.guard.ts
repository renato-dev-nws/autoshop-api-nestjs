import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Injectable()
export class StoreOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Admin tem acesso total
    if (user.role === 'admin') {
      return true;
    }

    // Obter storeId do body ou params
    const storeId = request.body?.store_id || request.params?.storeId || request.body?.storeId;
    
    if (!storeId) {
      return true; // Se não houver storeId, deixa passar (será validado por outros guards/validações)
    }

    const storeIdNumber = parseInt(storeId, 10);

    // Manager só pode acessar sua loja ou matriz
    if (!user.storeId) {
      throw new ForbiddenException('Manager deve estar vinculado a uma loja');
    }

    // Se for a própria loja do manager, permite
    if (user.storeId === storeIdNumber) {
      return true;
    }

    // Verificar se a loja alvo é filial da loja do manager
    const targetStore = await this.storeRepository.findOne({
      where: { id: storeIdNumber },
    });

    if (!targetStore) {
      throw new ForbiddenException('Loja não encontrada');
    }

    // Se a loja do manager for a matriz da loja alvo, permite
    if (targetStore.parentId === user.storeId) {
      return true;
    }

    throw new ForbiddenException('Você não tem permissão para acessar esta loja');
  }
}
