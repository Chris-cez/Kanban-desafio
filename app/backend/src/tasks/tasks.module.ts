import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { Task } from '../entities/tasks.entity';
import { User } from '../entities/users.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Board, User, BoardMember]), AuthModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
