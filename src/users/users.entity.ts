import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from 'src/tasks/tasks.entity';
import { BoardMember } from 'src/board-members/board-members.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @OneToMany(() => Task, task => task.creator)
  createdTasks: Task[];

  @OneToMany(() => Task, task => task.finalizer)
  completedTasks: Task[];

  @OneToMany(() => BoardMember, boardMember => boardMember.user)
  boardMembers: BoardMember[];
}