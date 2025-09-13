import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BoardMemberGuard, Permissions } from '../auth/guards/board-member.guard';
import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { User } from '../entities/users.entity';
import { BoardsService } from './boards.service';

@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBoardDto, @GetUser() user: User) {
    return this.boardsService.create(dto, user);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.boardsService.findAllForUser(user.id);
  }

  @Get(':id')
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.READ, BoardMemberPermission.WRITE, BoardMemberPermission.ADMIN)
  async findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.boardsService.findOne(Number(id), user.id);
  }

  @Patch(':id')
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN, BoardMemberPermission.WRITE)
  async update(@Param('id') id: number, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BoardMemberGuard)
  @Permissions(BoardMemberPermission.ADMIN)
  async remove(@Param('id') id: number) {
    await this.boardsService.remove(Number(id));
  }
}
