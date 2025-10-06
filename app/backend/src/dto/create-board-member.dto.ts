wimport { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsEnum, IsString } from 'class-validator';

export enum BoardMemberPermission {
  ADMIN = 'admin',
  READ = 'read',
  WRITE = 'write',
}
export class CreateBoardMemberDto {
  @ApiProperty({
    example: 1,
    description: 'O ID do quadro onde o membro será adicionado.',
  })
  @IsInt()
  boardId: number;

  @ApiProperty({
    enum: BoardMemberPermission,
    example: BoardMemberPermission.READ,
    description: 'A permissão que o novo membro terá no quadro.',
  })
  @IsEnum(BoardMemberPermission)
  @IsNotEmpty()
  permissions: BoardMemberPermission;

  @ApiProperty({
    example: 'membro.equipe',
    description: 'O login do usuário a ser adicionado como membro.',
  })
  @IsString()
  @IsNotEmpty()
  userLogin: string;
}