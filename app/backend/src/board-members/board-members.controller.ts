import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';
import { BoardMembersService } from './board-members.service';

@UseGuards(AuthGuard('jwt'))
@Controller('board-members')
export class BoardMembersController {
  constructor(private boardMembersService: BoardMembersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Body() dto: CreateBoardMemberDto) {
    return this.boardMembersService.addMember(dto);
  }

  @Get()
  async getMembers(@Query('boardId') boardId: number) {
    return this.boardMembersService.getMembersByBoard(boardId);
  }

  @Patch(':id')
  async updatePermissions(@Param('id') id: number, @Body() dto: UpdateBoardMemberDto) {
    return this.boardMembersService.updatePermissions(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(@Param('id') id: number) {
    await this.boardMembersService.removeMember(id);
  }
}
