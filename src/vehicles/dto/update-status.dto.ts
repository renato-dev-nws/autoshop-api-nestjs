import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ description: 'Novo status', enum: ['Available', 'Reserved', 'Sold'] })
  @IsString()
  @IsIn(['Available', 'Reserved', 'Sold'])
  status: string;
}
