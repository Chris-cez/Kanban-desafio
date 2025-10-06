import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Projeto Phoenix',
    description: 'O nome do quadro.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Lista de status customizados para as tarefas. Se não for fornecido, o padrão será ["todo", "doing", "done"].',
    example: ['Backlog', 'Em Desenvolvimento', 'Em Teste', 'Concluído'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  taskStatuses?: string[]; // Ex: ['todo', 'doing', 'done']
}