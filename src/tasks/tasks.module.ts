import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from 'src/entities/tasks.entity';
import { Board } from 'src/entities/boards.entity';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Board, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
