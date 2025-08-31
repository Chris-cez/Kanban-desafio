import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';

export enum BoardMemberPermission {
  ADMIN = 'admin',
  READ = 'read',
  WRITE = 'write',
}

export class CreateBoardMemberDto {
  @IsInt()
  userId: number;

  @IsInt()
  boardId: number;

  @IsEnum(BoardMemberPermission)
  @IsNotEmpty()
  permissions: BoardMemberPermission;
}