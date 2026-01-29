import { ApiProperty } from '@nestjs/swagger';

export class UploadPhotosDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Fotos do veículo (máximo 10)',
  })
  files: Express.Multer.File[];
}
