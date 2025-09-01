import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMemberGuard } from '../auth/guards/board-member.guard';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardMember])],
  controllers: [BoardsController],
  providers: [BoardsService, BoardMemberGuard],
})
export class BoardsModule {}
