import { Module } from '@nestjs/common';
import { BoardMembersController } from './board-members.controller';
import { BoardMembersService } from './board-members.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMember } from 'src/entities/board-members.entity';
import { User } from 'src/entities/users.entity';
import { Board } from 'src/entities/boards.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardMember, User, Board])],
  controllers: [BoardMembersController],
  providers: [BoardMembersService]
})
export class BoardMembersModule {}
