import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BoardMemberGuard, Permissions } from '../auth/guards/board-member.guard';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { User } from '../entities/users.entity';
import { TasksService } from './tasks.service';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskDto, @GetUser() user: User) {
    // O boardId no DTO será usado pelo BoardMemberGuard
    return this.tasksService.create(dto, user);
  }

  @Get()
  @UseGuards(BoardMemberGuard) // Requer que o boardId seja passado como query param
  @Permissions(BoardMemberPermission.READ, BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async findAll(@Query('boardId') boardId?: number) {
    return this.tasksService.findAll(boardId ? Number(boardId) : undefined);
  }

  @Get(':id')
  // A autorização para findOne é mais complexa com o guard atual.
  // O ideal seria o serviço verificar a permissão.
  async findOne(@Param('id') id: number) {
    return this.tasksService.findOne(Number(id));
  }

  @Patch(':id')
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async update(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async remove(@Param('id') id: number) {
    await this.tasksService.remove(Number(id));
  }
}
