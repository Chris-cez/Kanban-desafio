import { Controller, Post, Body, Get, Query, Param, Patch, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport/dist';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  async findAll(@Query('boardId') boardId?: number) {
    return this.tasksService.findAll(boardId ? Number(boardId) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.tasksService.findOne(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number) {
    await this.tasksService.remove(Number(id));
  }
}
