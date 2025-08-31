import { IsEnum, IsOptional } from 'class-validator';
import { BoardMemberPermission } from './create-board-member.dto';

export class UpdateBoardMemberDto {
  @IsEnum(BoardMemberPermission)
  @IsOptional()
  permissions?: BoardMemberPermission;
}