import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from '../entities/board-members.entity';
import { Board } from '../entities/boards.entity';
import { User } from '../entities/users.entity';
import { BoardMembersController } from './board-members.controller';
import { BoardMembersService } from './board-members.service';
import { Task } from '../entities/tasks.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember, User, Board, Task]), AuthModule],
  controllers: [BoardMembersController],
  providers: [BoardMembersService]
})
export class BoardMembersModule {}
