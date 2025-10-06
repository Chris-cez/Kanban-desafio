import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BoardMemberPermission } from './create-board-member.dto';

export class UpdateBoardMemberDto {
  @ApiPropertyOptional({
    enum: BoardMemberPermission,
    example: BoardMemberPermission.WRITE,
    description: 'A nova permissão do membro no quadro.',
  })
  @IsEnum(BoardMemberPermission)
  @IsOptional()
  permissions?: BoardMemberPermission;
}