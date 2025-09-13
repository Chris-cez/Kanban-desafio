import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Task } from '../entities/tasks.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardMember, Task]), AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
