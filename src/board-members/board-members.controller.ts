import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateBoardMemberDto } from '../dto/create-board-member.dto';
import { UpdateBoardMemberDto } from '../dto/update-board-member.dto';
import { BoardMembersService } from './board-members.service';

@Controller('board-members')
export class BoardMembersController {
  constructor(private boardMembersService: BoardMembersService) {}

  @Post()
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
  async removeMember(@Param('id') id: number) {
    return this.boardMembersService.removeMember(id);
  }
}
