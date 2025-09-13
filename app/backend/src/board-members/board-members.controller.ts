import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BoardMemberGuard, Permissions } from '../auth/guards/board-member.guard';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';
import { User } from '../entities/users.entity';
import { BoardMembersService } from './board-members.service';

@UseGuards(AuthGuard('jwt'))
@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Body() dto: CreateBoardMemberDto) {
    // O boardId no DTO é usado pelo BoardMemberGuard para verificar a permissão do requisitante
    return this.boardMembersService.addMember(dto);
  }

  @Get()
  @UseGuards(BoardMemberGuard) // Requer `boardId` como query param
  @Permissions(BoardMemberPermission.READ, BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async getMembers(@Query('boardId') boardId: number) {
    return this.boardMembersService.getMembersByBoard(boardId);
  }

  @Patch(':id')
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  async updatePermissions(@Param('id') id: number, @Body() dto: UpdateBoardMemberDto, @GetUser() user: User) {
    return this.boardMembersService.updatePermissions(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  async removeMember(@Param('id') id: number, @GetUser() user: User) {
    await this.boardMembersService.removeMember(id, user);
  }
}
