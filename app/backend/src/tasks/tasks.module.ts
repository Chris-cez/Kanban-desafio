import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../entities/boards.entity';
import { Task } from '../entities/tasks.entity';
import { User } from '../entities/users.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Board, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
