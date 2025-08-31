import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @IsInt()
  @IsOptional()
  finalizerId?: number;
}