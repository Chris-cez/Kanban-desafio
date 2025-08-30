import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './tasks.entity';
import { BoardMember } from './board-members.entity';

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

  @Column('simple-array', { default: 'todo,doing,done' })
  taskStatuses: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}