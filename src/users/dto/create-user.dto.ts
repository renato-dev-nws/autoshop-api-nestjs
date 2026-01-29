import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'gerente@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nome completo',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Papel do usuário',
    example: 'manager',
    enum: ['admin', 'manager'],
  })
  @IsString()
  @IsIn(['admin', 'manager'])
  role: string;

  @ApiProperty({
    description: 'ID da loja (obrigatório para managers)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  store_id?: number;

  @ApiProperty({
    description: 'Se o usuário está ativo',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
