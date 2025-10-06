import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BoardMemberGuard, Permissions } from '../auth/guards/board-member.guard';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { User } from '../entities/users.entity';
import { BoardsService } from './boards.service';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo quadro' })
  @ApiResponse({ status: 201, description: 'Quadro criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBoardDto, @GetUser() user: User) {
    return this.boardsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os quadros do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de quadros retornada com sucesso.' })
  async findAll(@GetUser() user: User) {
    return this.boardsService.findAllForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um quadro específico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do quadro' })
  @ApiResponse({ status: 200, description: 'Quadro encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é membro do quadro).' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado.' })
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.READ, BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.boardsService.findOne(Number(id), user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um quadro (requer permissão de escrita ou admin)' })
  @ApiParam({ name: 'id', description: 'ID do quadro' })
  @ApiResponse({ status: 200, description: 'Quadro atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado.' })
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN, BoardMemberPermission.WRITE)
  async update(@Param('id') id: number, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um quadro (requer permissão de admin)' })
  @ApiParam({ name: 'id', description: 'ID do quadro' })
  @ApiResponse({ status: 204, description: 'Quadro removido com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Quadro não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  async remove(@Param('id') id: number) {
    await this.boardsService.remove(Number(id));
  }
}
