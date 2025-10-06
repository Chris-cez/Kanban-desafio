import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BoardMemberGuard, Permissions } from '../auth/guards/board-member.guard';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { User } from '../entities/users.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova tarefa em um quadro' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (sem permissão de escrita no quadro).' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado.' })
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskDto, @GetUser() user: User) {
    return this.tasksService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as tarefas de um quadro' })
  @ApiQuery({ name: 'boardId', description: 'ID do quadro para filtrar as tarefas', type: Number, required: true })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é membro do quadro).' })
  @UseGuards(BoardMemberGuard) // Requer que o boardId seja passado como query param
  @Permissions(BoardMemberPermission.READ, BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async findAll(@Query('boardId') boardId?: number) {
    return this.tasksService.findAll(boardId ? Number(boardId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma tarefa específica pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  // Nota: Este endpoint não possui um BoardMemberGuard. Acesso é público se o ID for conhecido.
  async findOne(@Param('id') id: number) {
    return this.tasksService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma tarefa (requer permissão de escrita ou admin)' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async update(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma tarefa (requer permissão de escrita ou admin)' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 204, description: 'Tarefa removida com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async remove(@Param('id') id: number) {
    await this.tasksService.remove(Number(id));
  }
}
