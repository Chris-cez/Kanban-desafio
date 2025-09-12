import { IsInt, IsNotEmpty, IsEnum, IsString } from 'class-validator';

export enum BoardMemberPermission {
  ADMIN = 'admin',
  READ = 'read',
  WRITE = 'write',
}
export class CreateBoardMemberDto {
  @IsInt()
  boardId: number;

  @IsEnum(BoardMemberPermission)
  @IsNotEmpty()
  permissions: BoardMemberPermission;

  @IsString()
  @IsNotEmpty()
  userLogin: string;
}