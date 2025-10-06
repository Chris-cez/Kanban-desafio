import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BoardMemberGuard, Permissions } from '../auth/guards/board-member.guard';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';
import { User } from '../entities/users.entity';
import { BoardMembersService } from './board-members.service';

@ApiTags('Board Members')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @ApiOperation({ summary: 'Adiciona um novo membro a um quadro (requer permissão de admin no quadro)' })
  @ApiResponse({ status: 201, description: 'Membro adicionado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Usuário ou quadro não encontrado.' })
  @ApiResponse({ status: 409, description: 'Usuário já é membro do quadro.' })
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Body() dto: CreateBoardMemberDto) {
    return this.boardMembersService.addMember(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os membros de um quadro (requer ser membro do quadro)' })
  @ApiQuery({ name: 'boardId', description: 'ID do quadro para listar os membros', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de membros retornada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @UseGuards(BoardMemberGuard) // Requer `boardId` como query param
  @Permissions(BoardMemberPermission.READ, BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async getMembers(@Query('boardId') boardId: number) {
    return this.boardMembersService.getMembersByBoard(boardId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza as permissões de um membro (requer permissão de admin no quadro)' })
  @ApiParam({ name: 'id', description: 'ID da relação "BoardMember"' })
  @ApiResponse({ status: 200, description: 'Permissões atualizadas com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado.' })
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  async updatePermissions(@Param('id') id: number, @Body() dto: UpdateBoardMemberDto, @GetUser() user: User) {
    return this.boardMembersService.updatePermissions(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um membro de um quadro (requer permissão de admin no quadro)' })
  @ApiParam({ name: 'id', description: 'ID da relação "BoardMember"' })
  @ApiResponse({ status: 204, description: 'Membro removido com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (ex: tentar remover o último admin).' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  async removeMember(@Param('id') id: number, @GetUser() user: User) {
    await this.boardMembersService.removeMember(id, user);
  }
}
