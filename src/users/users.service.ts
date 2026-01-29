import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['store'],
      order: { name: 'ASC' },
      select: ['id', 'email', 'name', 'role', 'storeId', 'active', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['store'],
      select: ['id', 'email', 'name', 'role', 'storeId', 'active', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validar email único
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    // Validar store_id para managers
    if (createUserDto.role === 'manager') {
      if (!createUserDto.store_id) {
        throw new BadRequestException('Managers devem estar associados a uma loja');
      }

      const store = await this.storeRepository.findOne({
        where: { id: createUserDto.store_id },
      });

      if (!store) {
        throw new NotFoundException('Loja não encontrada');
      }
    } else if (createUserDto.role === 'admin' && createUserDto.store_id) {
      throw new BadRequestException('Admins não devem estar associados a uma loja específica');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role,
      storeId: createUserDto.store_id,
      active: createUserDto.active ?? true,
    });

    const savedUser = await this.userRepository.save(user);

    // Remover password do retorno
    delete savedUser.password;
    return savedUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar email único (se mudou)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    // Validar store_id para managers
    if (updateUserDto.role === 'manager' || user.role === 'manager') {
      const finalRole = updateUserDto.role ?? user.role;
      const finalStoreId = updateUserDto.store_id ?? user.storeId;

      if (finalRole === 'manager' && !finalStoreId) {
        throw new BadRequestException('Managers devem estar associados a uma loja');
      }

      if (updateUserDto.store_id) {
        const store = await this.storeRepository.findOne({
          where: { id: updateUserDto.store_id },
        });

        if (!store) {
          throw new NotFoundException('Loja não encontrada');
        }
      }
    }

    // Hash da nova senha se fornecida
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Atualizar campos
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.store_id !== undefined) user.storeId = updateUserDto.store_id;
    if (updateUserDto.active !== undefined) user.active = updateUserDto.active;

    const savedUser = await this.userRepository.save(user);

    // Remover password do retorno
    delete savedUser.password;
    return savedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
