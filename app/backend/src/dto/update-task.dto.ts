import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Configurar pipeline de CI/CD com testes',
    description: 'O novo título da tarefa.',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Usar GitHub Actions para rodar testes, build e deploy no ECS.',
    description: 'A nova descrição da tarefa.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'doing',
    description: 'O novo status da tarefa. Deve ser um dos status definidos no quadro.',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se a tarefa deve ser arquivada.',
  })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: 'O ID do usuário que finalizou a tarefa.',
  })
  @IsInt()
  @IsOptional()
  finalizerId?: number;
}