import { IsString, IsInt, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({
    description: 'ID da marca',
    example: 1,
  })
  @IsInt()
  brand_id: number;

  @ApiProperty({
    description: 'Nome do modelo',
    example: 'COROLLA GLI UPPER 2.0',
  })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty({
    description: 'ID do modelo na tabela FIPE',
    example: '5940',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  model_fipe_id?: string;
}
