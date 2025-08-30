import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './users.entity';
import { Board } from './boards.entity';
import { BoardMemberPermission } from 'src/dto/create-board-member.dto';

@Unique(['user', 'board'])
@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BoardMemberPermission, default: BoardMemberPermission.READ })
  permissions: BoardMemberPermission;

  @ManyToOne(() => User, user => user.boardMembers)
  user: User;

  @ManyToOne(() => Board, board => board.boardMembers)
  board: Board;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}