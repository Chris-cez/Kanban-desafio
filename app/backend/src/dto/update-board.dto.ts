import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateBoardDto {
  @ApiPropertyOptional({
    example: 'Projeto Phoenix V2',
    description: 'O novo nome do quadro.',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'A nova lista de status customizados para as tarefas.',
    example: ['Backlog', 'Dev', 'QA', 'Done'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  taskStatuses?: string[];
}