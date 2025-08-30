import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/entities/boards.entity';
import { Task } from 'src/entities/tasks.entity';
import { User } from 'src/entities/users.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Board, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
