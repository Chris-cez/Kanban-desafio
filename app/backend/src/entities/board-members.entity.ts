import { BoardMemberPermission } from '../dto/create-board-member.dto';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Board } from './boards.entity';
import { User } from './users.entity';

@Unique(['user', 'board'])
@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BoardMemberPermission, default: BoardMemberPermission.READ })
  permissions: BoardMemberPermission;

  @ManyToOne(() => User, user => user.boardMembers)
  user: User;

  @ManyToOne(() => Board, board => board.boardMembers, { onDelete: 'CASCADE' })
  board: Board;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}