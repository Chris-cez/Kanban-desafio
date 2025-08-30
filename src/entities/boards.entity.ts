import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BoardMember } from './board-members.entity';
import { Task } from './tasks.entity';

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