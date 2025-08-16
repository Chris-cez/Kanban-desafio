import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from 'src/tasks/tasks.entity';
import { BoardMember } from 'src/board-members/board-members.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Task, task => task.board)
  tasks: Task[];

  @OneToMany(() => BoardMember, boardMember => boardMember.board)
  boardMembers: BoardMember[];
}