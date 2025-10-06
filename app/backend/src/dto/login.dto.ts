import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'testuser',
    description: 'O login (username) do usuário.',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'password123', description: 'A senha do usuário.' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

