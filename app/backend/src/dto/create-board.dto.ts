import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  taskStatuses?: string[]; // Ex: ['todo', 'doing', 'done']
}