import { IsString, IsOptional, IsInt, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Nome da loja',
    example: 'Matriz São Paulo',
  })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty({
    description: 'CNPJ da loja (formato XX.XXX.XXX/XXXX-XX)',
    example: '12.345.678/0001-90',
  })
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Endereço completo da loja',
    example: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '(11) 98888-7777',
  })
  @IsString()
  @Length(1, 20)
  phone: string;

  @ApiProperty({
    description: 'ID da loja matriz (null se for matriz)',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsInt()
  parent_id?: number;
}
