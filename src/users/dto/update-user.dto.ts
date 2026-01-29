import { IsEmail, IsString, IsOptional, IsBoolean, IsInt, IsIn, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'gerente@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Nova senha',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    description: 'Nome completo',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Papel do usuário',
    enum: ['admin', 'manager'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'manager'])
  role?: string;

  @ApiProperty({
    description: 'ID da loja',
    required: false,
  })
  @IsOptional()
  @IsInt()
  store_id?: number;

  @ApiProperty({
    description: 'Se o usuário está ativo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
