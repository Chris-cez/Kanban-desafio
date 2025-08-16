import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Board } from 'src/boards/boards.entity';

@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permissions: string; // Ex: 'admin', 'read', 'write'

  @ManyToOne(() => User, user => user.boardMembers)
  user: User;

  @ManyToOne(() => Board, board => board.boardMembers)
  board: Board;
}