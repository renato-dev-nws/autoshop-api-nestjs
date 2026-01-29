import { ApiProperty } from '@nestjs/swagger';
import { Store } from '../../stores/entities/store.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ nullable: true })
  store_id: number | null;

  @ApiProperty({ type: () => Store, nullable: true })
  store: Store | null;
}

export class AuthResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
}
