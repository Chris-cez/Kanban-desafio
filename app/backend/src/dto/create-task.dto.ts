import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsInt()
    boardId: number;

    @IsInt()
    creatorId: number;
}
