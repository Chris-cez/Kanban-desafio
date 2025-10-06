import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
    @ApiProperty({
        example: 'Configurar pipeline de CI/CD',
        description: 'O título da tarefa.',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Usar GitHub Actions para build e deploy.',
        description: 'Descrição opcional da tarefa.',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 'todo',
        description: 'O status inicial da tarefa. Deve ser um dos status definidos no quadro.',
    })
    @IsString()
    @IsNotEmpty()
    status: string;

    @ApiProperty({
        example: 1,
        description: 'O ID do quadro ao qual a tarefa pertence.',
    })
    @IsInt()
    boardId: number;
}
