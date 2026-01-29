import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePhotoOrderDto {
  @ApiProperty({
    description: 'Ordem de exibição da foto',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  display_order: number;
}
