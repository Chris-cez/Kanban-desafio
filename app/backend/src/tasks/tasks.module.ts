import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMemberGuard } from '../auth/guards/board-member.guard';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { Task } from '../entities/tasks.entity';
import { User } from '../entities/users.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Board, User, BoardMember])],
  controllers: [TasksController],
  providers: [TasksService, BoardMemberGuard],
})
export class TasksModule {}
